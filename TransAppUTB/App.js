import React, { Component } from 'react';
import { Text, View } from 'react-native';
import Greeting from './components/Greeting';
import styles from './styles/styles'


export default class LotsOfGreetings extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Greeting />
      </View>
    );
  }
}
