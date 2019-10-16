import React, { Component } from 'react';
import { Text, View } from 'react-native';
import Greeting from './components/Greeting';
export default class LotsOfGreetings extends Component {
  render() {
    return (
      <View style={{alignItems: 'center', top: 50}}>
        <Greeting />
      </View>
    );
  }
}
