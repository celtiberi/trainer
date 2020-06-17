import React, { useState, useEffect } from 'react'
import { View, Text, StatusBar, StyleSheet, Dimensions } from 'react-native'
//import Tuner from './tuner'
import Note from './note'
import Meter from './meter'
import { eventEmitter, EVENTS } from '../../eventEmitter'
import _ from 'lodash'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height


export default () =>
{
    const [ note, setNote ] = useState( {
            name: 'A',
            octave: 4,
            frequency: 440
    } )

    useEffect( () =>
    {
        // const tuner = new Tuner()
        // tuner.start()

        eventEmitter.on( EVENTS.MIC, note =>
        {
              setNote( note )
        } )

        //
        // tuner.onNoteDetected = note => {
        //   if (this._lastNoteName === note.name) {
        //     this._update(note);
        //   } else {
        //     this._lastNoteName = note.name;
        //   }
        // };
    }, [] )


    return (
        <View style={style.body}>
            <Meter cents={note.cents}/>
            <Note {...note} />
            <Text style={style.frequency}>
                {_.isNumber(note.frequency) ? note.frequency.toFixed( 1 ) : note.frequency} Hz
            </Text>
        </View>
    )

}

const style = StyleSheet.create( {
    body: {
        width: width,
        height: height * 0.4,
        top: 100,
        justifyContent: 'center',
        alignItems: 'center',
        color: 'blue'
    },
    frequency: {
        fontSize: 15,
        color: '#37474f'
    }
} )
