import { ReactNativeSVGContext, NotoFontPack } from 'standalone-vexflow-context'
import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import Vex from 'vexflow'
import VexFlowJson from '../../lib/VeFlowJson'
import { eventEmitter, EVENTS } from '../../eventEmitter'
import Tuner from '../Tuner/tuner'

let { Stave, StaveNote, StaveText, TextNote, Voice, Formatter, Accidental, BarNote } = Vex.Flow

const width = Dimensions.get( 'window' ).width
const height = Dimensions.get( 'window' ).height

const JUSTIFY = TextNote.Justification.CENTER

const context = new ReactNativeSVGContext( NotoFontPack, { width, height } )

function getNoteName( note )
{
    if ( !note.keys ) {
        return null
    }

    return note.keys[ 0 ].split( '/' )[ 0 ]
}

function getTabFromNotes( noteGroup )
{
    return noteGroup.map( notes =>
    {
        let tab = []
        let key = 0
        notes.forEach( note =>
        {
            if ( !note.keys ) {
                return
            }

            key++

            let noteName = getNoteName( note )

            let noteLetter = 'd'

            // the letter that goes with each note comes from https://github.com/jgadsden/tin-whistle-tablature/blob/master/tin_whistle_tablature.qml
            switch ( noteName ) {
                case 'D':
                    noteLetter = 'd'
                    break
                case 'E':
                    noteLetter = 'e'
                    break
                case 'A':
                    noteLetter = 'a'
                    break
                case 'B':
                    noteLetter = 'B'
                    break
            }

            tab.push( <Text key={key} style={{
                fontFamily: 'TinWhistleTab',
                fontSize: 80,
                position: 'absolute',
                top: note.stave.y + 105,//notes[0].getAbsoluteX(),
                left: note.getAbsoluteX() - 3
            }}>{noteLetter}</Text> )
        } )

        return tab
    } )
}

let data = {
    staves: [
        {
            voices: [
                {
                    time: '4/4',
                    notes: [
                        { duration: 'q', keys: [ 'D/4' ] },
                        { duration: 'q', keys: [ 'D/4' ] },
                        { duration: 'q', keys: [ 'A/4' ] },
                        { duration: 'q', keys: [ 'A/4' ] },
                        { barnote: true },
                        { duration: 'q', keys: [ 'B/4' ] },
                        { duration: 'q', keys: [ 'B/4' ] },
                        { duration: 'h', keys: [ 'A/4' ] },
                    ]
                },
            ]
        },
        {
            voices: [
                {
                    time: '4/4',
                    notes: [
                        { duration: 'q', keys: [ 'A/4' ] },
                        { duration: 'q', keys: [ 'D/4' ] },
                        { duration: 'q', keys: [ 'A/4' ] },
                        { duration: 'q', keys: [ 'A/4' ] },
                        { barnote: true },
                        { duration: 'q', keys: [ 'B/4' ] },
                        { duration: 'q', keys: [ 'B/4' ] },
                        { duration: 'h', keys: [ 'A/4' ] },
                    ]
                },
            ]
        }
    ],

}

// let json = new VexFlowJson( data )
// json.renderNextStave( context, { width, height } )
// let tablature1 = getTabFromNotes( json.notes )
//
// json.renderNextStave( context, { width, height } )
// let tablature2 = getTabFromNotes( json.notes )

let json = new VexFlowJson( data )
let noteGroup = json.renderStaves( context, { width, height } )
let tablature = getTabFromNotes( noteGroup )
//
// noteGroup[0][0].setStyle({fillStyle: "blue", strokeStyle: "blue"})
// noteGroup[0][0].draw()

let notes = [].concat.apply([], noteGroup)
// notes[0].setStyle({fillStyle: "blue", strokeStyle: "blue"})
// notes[0].draw()

let index = 0

function setActiveNote( i )
{
    notes[i-1].setStyle({fillStyle: "black", strokeStyle: "black"})
    notes[i-1].draw()

    notes[i].setStyle({fillStyle: "blue", strokeStyle: "blue"})
    notes[i].draw()
}

export default () =>
{
    const [ noteIndex, setNoteIndex ] = useState( 0 )
    const [ lastNoteName, setLastNoteName ] = useState( '')

    useEffect( () =>
    {
        index = 0
        setNoteIndex(0)
        const tuner = new Tuner()
        tuner.start()

        eventEmitter.emit( EVENTS.CURRENT_NOTE, {
            name: getNoteName( notes[index] ),
            beatDuration: 100
        } )

        eventEmitter.on( EVENTS.NOTE_HIT, micNote =>
        {
            setLastNoteName(micNote.name)

            index++
            let currentNoteName = getNoteName( notes[index] )

            if( !currentNoteName )
            {
                // this is a barnote or something.  Skip it
                // todo: remove all barenotes from the list of notes
                index++
                let currentNoteName = getNoteName( notes[index] )
            }

            notes[index].setStyle({fillStyle: "blue", strokeStyle: "blue"})
            notes[index].draw()

            setActiveNote( index )
            setNoteIndex(index)

        } )

    }, [] )

    // notes[index].setStyle({fillStyle: "blue", strokeStyle: "blue"})
    // notes[index].draw()

    return (
        <View>
            <Text>{noteIndex}</Text>
            <Text>{index}</Text>
            <Text>{lastNoteName}</Text>
            {context.render()}
            {tablature}
        </View>
    )
}
//{getTabFromNotes()}






