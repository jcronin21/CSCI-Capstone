// HomeScreen.js
import React from 'react';
import { View, Text } from 'react-native';

const HomeScreen = () => {
  // async function getdata(){
  //   const response = await fetch('https://www.apitutor.org/spotify/simple/v1/search?q=beyonce&type=album&limit=3');
  //   const data = await response.json();
  //   console.log(data);

  // }
  // getdata();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Screen</Text>
    </View>
  );
}

export default HomeScreen;
