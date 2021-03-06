import Vex from 'vexflow'
import _ from 'lodash'

if ( !( Vex && Vex.Flow ) ) {
    throw 'Please be sure vexflow is required before requiring vexflow.json.'
}

export default class VexFlowJson
{
    constructor( data )
    {
        this.data = data
        this.stave_offset = 0
        this.stave_delta = 60
        this.staves = {}
        this.staveIndex = 0
        //this.interpret_data()
    }

    interpret_data( data )
    {
        if ( data instanceof Array ) {
            if ( data[ 0 ] instanceof Array ) {
                this.notes = this.interpret_notes( data )
            }
            else if ( typeof this.data[ 0 ] === 'string' ) {
                this.notes = this.interpret_notes( [ { keys: data } ] )
            }
        }
        else if ( data.keys ) {
            this.notes = this.interpret_notes( [ data ] )
        }
        else if ( data.notes ) {
            this.notes = this.interpret_notes( data.notes )
        }
        else if ( data.voices ) {
            this.voices = this.interpret_voices( data.voices )
        }

    }

    interpret_notes = function ( data )
    {
        return data.map( datum =>
        {
            if ( typeof datum === 'string' ) {
                if ( datum == '|' ) {
                    return { barnote: true }
                }
                else {
                    return { duration: 'q', keys: this.interpret_keys( [ datum ] ) }
                }
            }
            else if ( datum instanceof Array ) {
                return { duration: 'q', keys: this.interpret_keys( datum ) }
            }
            else {
                if ( datum.keys ) {
                    datum.keys = this.interpret_keys( datum.keys )
                    datum.duration || ( datum.duration = 'q' )
                }
                return datum
            }
        })
    }

    interpret_voices = function ( data )
    {
        return data.map( datum =>
        {
            return {
                time: datum.time,
                notes: this.interpret_notes( datum.notes )
            }
        })
    }

    interpret_keys = function ( data )
    {
        return data.map( datum =>
        {
            let note_portion, octave_portion, _ref
            _ref = datum.split( '/' ), note_portion = _ref[ 0 ], octave_portion = _ref[ 1 ]
            octave_portion || ( octave_portion = '4' )
            return '' + note_portion + '/' + octave_portion
        })
    }

    draw_canvas = function ( canvas, canvas_options )
    {
        canvas_options = canvas_options || {}

        this.canvas = canvas
        let backend = Vex.Flow.Renderer.Backends.CANVAS
        if ( canvas.tagName.toLowerCase() === 'svg' ) {
            backend = Vex.Flow.Renderer.Backends.SVG
        }
        this.renderer = new Vex.Flow.Renderer( this.canvas, backend )
        this.context = this.renderer.getContext()

        if ( canvas_options.scale ) {
            this.context.scale( canvas_options.scale, canvas_options.scale )
        }
    }

    draw_stave = function ( clef, keySignature, time, options )
    {
        if ( clef == null ) clef = 'treble'
        if ( !( clef instanceof Array ) ) clef = [ clef ]
        if ( options == null ) options = {}

        clef.forEach(   c =>
        {
            //this.staves[ c ] = new Vex.Flow.Stave( 10, this.stave_offset, this.width - 20 )
            this.staves[ c ] = new Vex.Flow.Stave( 10, this.staveIndex * 180, this.width - 20 )
            this.staves[ c ]
                .addClef( c )
                .addKeySignature( keySignature )
                .setContext( this.context )
                .setTimeSignature( time )
                .draw()

            this.stave_offset += this.stave_delta
        })
    }

    stave_notes = function ( notes )
    {
        return notes.map( note =>
        {
            if ( note.barnote ) {
                return new Vex.Flow.BarNote()
            }

            let stave_note
            note.duration || ( note.duration = 'h' )
            note.clef = 'treble' // Forcing to treble for now, even though bass may be present (we just line it up properly)
            stave_note = new Vex.Flow.StaveNote( note )

            _( note.keys ).each( function ( key, i )
            {
                let accidental, note_portion
                note_portion = key.split( '/' )[ 0 ]
                accidental = note_portion.slice( 1, ( note_portion.length + 1 ) || 9e9 )

                if ( accidental.length > 0 ) {
                    stave_note.addAccidental( i, new Vex.Flow.Accidental( accidental ) )
                }
            } )
            return stave_note
        } )
    }

    draw_notes = function ( notes )
    {
        Vex.Flow.Formatter.FormatAndDraw( this.context, this.staves[ 'treble' ], notes )
    }

    stave_voices = function ( voices )
    {
        return voices.map( voice =>
        {
            let stave_voice = new Vex.Flow.Voice( {
                num_beats: voice.time.split( '/' )[ 0 ],
                beat_value: voice.time.split( '/' )[ 1 ],
                resolution: Vex.Flow.RESOLUTION
            } )

            this.notes = this.stave_notes( voice.notes )
            stave_voice.setStrict( false )
            stave_voice.addTickables( this.notes )
            return stave_voice
        } )
    }

    draw_voices = function ( voices )
    {
        let formatter = new Vex.Flow.Formatter().joinVoices( voices ).format( voices, this.width * 0.8 )
        voices.forEach( voice =>
        {
            voice.draw( this.context, this.staves[ 'treble' ] )
        } )
    }

    render = function ( element, options )
    {
        options = ( options || {} )
        this.width = options.width || ( element.width | 0 ) || 600 // coerce weird SVG values to ints
        this.height = options.height || ( element.height | 0 ) || 120
        this.clef = options.clef
        this.scale = options.scale || 1
        this.keySignature = options.keySignature || 'C'

        this.context = element

        // this.draw_canvas(element, {
        //     scale: this.scale
        // });

        this.interpret_data( stave )
        this.draw_stave( this.clef, this.keySignature, this.voices[0].time || null)
        this.draw_voices( this.stave_voices( this.voices ) )
    }

    renderNextStave = function ( element, options )
    {
        options = ( options || {} )
        this.width = options.width || ( element.width | 0 ) || 600 // coerce weird SVG values to ints
        this.height = options.height || ( element.height | 0 ) || 120
        this.clef = options.clef
        this.scale = options.scale || 1
        this.keySignature = options.keySignature || 'C'

        this.context = element

        // this.draw_canvas(element, {
        //     scale: this.scale
        // });

        let currentStave = this.data.staves[this.staveIndex]

        this.interpret_data( currentStave )
        this.draw_stave( this.clef, this.keySignature, this.voices[0].time )
        this.draw_voices( this.stave_voices( this.voices ) )

        this.staveIndex++
    }

    renderStaves = function ( element, options )
    {
        options = ( options || {} )
        this.width = options.width || ( element.width | 0 ) || 600 // coerce weird SVG values to ints
        this.height = options.height || ( element.height | 0 ) || 120
        this.clef = options.clef
        this.scale = options.scale || 1
        this.keySignature = options.keySignature || 'C'

        this.context = element

        // this.draw_canvas(element, {
        //     scale: this.scale
        // });

        let staves = this.data.staves

        let notes = []


        staves.forEach( stave => {
            this.interpret_data( stave )
            this.draw_stave( this.clef, this.keySignature, this.voices[0].time )
            this.draw_voices( this.stave_voices( this.voices ) )

            notes.push(this.notes.slice(0))
            this.staveIndex++
        })

        // let currentStave = this.data.staves[this.staveIndex]
        //
        // this.interpret_data( currentStave )
        // this.draw_stave( this.clef, this.keySignature, this.voices[0].time )
        // this.draw_voices( this.stave_voices( this.voices ) )
        //
        // this.staveIndex++

        return notes
    }
}
