//import Recording from "react-native-recording";
//import MicStream from 'react-native-microphone-stream'
import PitchFinder from 'pitchfinder'
import { eventEmitter, EVENTS } from '../../eventEmitter'
import frequencyToMidiNoteNumber from 'frequency-to-midi-note-number'
import noteFromMidi from 'midi-note'
import _ from 'lodash'

export default class Tuner
{
    middleA = 440
    semitone = 69
    noteStrings = [
        'C',
        'C♯',
        'D',
        'D♯',
        'E',
        'F',
        'F♯',
        'G',
        'G♯',
        'A',
        'A♯',
        'B'
    ]

    constructor()
    {
        //MicStream.stop()
        const bufferSize = 4096
        this.sampleRate = 44100

        this.currentNote = { name: ''}

        this.startTime = Date.now()

        this.callTimer = Date.now()
        // MicStream.init( {
        //     bufferSize,
        //     sampleRate: this.sampleRate,
        //     bitsPerChannel: 16,
        //     channelsPerFrame: 1,
        // } )

        eventEmitter.on( EVENTS.RESET, micNote =>
        {
            this.currentNote = { name: ''}
        })

        eventEmitter.on( EVENTS.CURRENT_NOTE, note =>
        {
            this.desiredNote = { name: note.name, beatDuration: note.beatDuration }
            this.startTime = Date.now()
        })

        this.detector = new PitchFinder.YIN( { sampleRate: this.sampleRate } )
    }

    start()
    {
        //MicStream.start()

        // this.listener = MicStream.addListener( data =>
        // {
        //     const frequency = this.detector( data )
        //
        //     if ( frequency ) {
        //         const note = this.getNote( frequency )
        //         let noteData = {
        //             name: this.noteStrings[ note % 12 ],
        //             value: note,
        //             cents: this.getCents( frequency, note ),
        //             octave: parseInt( note / 12 ) - 1,
        //             frequency: frequency,
        //             duration: 0
        //         }
        //
        //         let now = Date.now()
        //         if( this.currentNote.name === noteData.name )
        //         {
        //             let duration = now - this.startTime
        //
        //             noteData.duration = duration
        //         }
        //         else
        //         {
        //             this.startTime = now
        //         }
        //
        //         this.currentNote = noteData
        //
        //         // trying to limit how often the event fires
        //         if(now - this.callTimer > 10)
        //         {
        //             this.callTimer = now
        //             eventEmitter.emit( EVENTS.MIC, this.currentNote )
        //         }
        //
        //         if( this.desiredNote && this.desiredNote.name === this.currentNote.name && this.currentNote.duration >= this.desiredNote.beatDuration )
        //         {
        //             eventEmitter.emit( EVENTS.NOTE_HIT, this.currentNote )
        //         }
        //     }
        // } )
    }

    stop()
    {
        MicStream.stop()
    }

    /**
     * get musical note from frequency
     *
     * @param {number} frequency
     * @returns {number}
     */
    getNote( frequency )
    {
        const note = 12 * ( Math.log( frequency / this.middleA ) / Math.log( 2 ) )
        return Math.round( note ) + this.semitone
    }

    /**
     * get the musical note's standard frequency
     *
     * @param note
     * @returns {number}
     */
    getStandardFrequency( note )
    {
        return this.middleA * Math.pow( 2, ( note - this.semitone ) / 12 )
    }

    /**
     * get cents difference between given frequency and musical note's standard frequency
     *
     * @param {float} frequency
     * @param {int} note
     * @returns {int}
     */
    getCents( frequency, note )
    {
        return Math.floor(
            ( 1200 * Math.log( frequency / this.getStandardFrequency( note ) ) ) /
            Math.log( 2 )
        )
    }
}
