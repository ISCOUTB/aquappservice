
import * as React from 'react';
//import React, { Component } from 'react';
import { Text, View, Image} from 'react-native';

export default class Greeting extends React.Component {
    render() {
        let pic = {
            uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/2f7d32b1787708aba49b3586082d327b'
        };
        return (
            <Image source={pic} style={{width: 100, height: 110}}/>
        );
    }
}