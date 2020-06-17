import MicStream from 'react-native-microphone-stream'
import { PitchDetector } from 'pitchy'
import { eventEmitter, EVENTS } from '../eventEmitter'
import frequencyToMidiNoteNumber from 'frequency-to-midi-note-number'
import noteFromMidi from 'midi-note'
import _ from 'lodash'


const bufferSize = 4096
MicStream.init( {
    bufferSize,
    sampleRate: 44100,
    bitsPerChannel: 16,
    channelsPerFrame: 1,
} )

let startTime = Date.now()
const detector = PitchDetector.forFloat32Array( bufferSize )

let currentNote = null
let noteStartTime = Date.now()
let duration = 0

let lastData = {}

function getDuration( note )
{
    if ( currentNote === note ) {
        // todo [pcremin] do not care about duration.  need number of beats it is held
        duration = Math.trunc( ( Date.now() - noteStartTime ) / 1000 ) // giving in seconds for now so the view does not refresh too fast
    }
    else {
        duration = 0
        noteStartTime = Date.now()
    }

    currentNote = note

    return duration
}

const listener = MicStream.addListener( signal =>
{
    if ( signal.length !== bufferSize ) {
        // todo [pcremin] why does this happen.  Maybe some internal buffer gets full so it calls the cb early?
        return
    }

    let input = signal.map( x => ( ( x / 256 ) * 2 ) - 1 )
    let [ pitch, clarity ] = detector.findPitch( input, 44100 )


    let midiNumber = null
    let note = null

    if ( clarity > 0.7 ) {    // todo [pcremin] might need to vary the clarity allowed
        midiNumber = frequencyToMidiNoteNumber( pitch )
        note = noteFromMidi( midiNumber )

        let duration = getDuration( note )

        let data = { note, midiNumber, duration, pitch }

        // only emit the data when it changes
        if ( !_.isEqual( lastData, data ) ) {
            lastData = data
            eventEmitter.emit( EVENTS.MIC, data )  // [pcremin] add pitch?
        }
    }
} )

function start()
{
    MicStream.start()
}

function stop()
{
    MicStream.stop()
}

module.exports = {
    start: start,
    stop: stop
}
