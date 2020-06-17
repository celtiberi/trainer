import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { eventEmitter, EVENTS } from './src/eventEmitter';
import Sheet from './src/components/Sheet';

import WhistleTuner from './src/components/Tuner';

export default function App()
{

    useEffect( () =>
    {
    }, [] );

    return (
        <View style={style.body}>

            <View>
                <Sheet/>
            </View>
        </View>
    );
}
//<WhistleTuner/>
const style = StyleSheet.create( {
    body: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    frequency: {
        fontSize: 28,
        color: '#37474f',
    },
} );
