import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './HomeScreen';
import ProfileScreen from './frontend/Screens/ProfileScreen';
import SettingsScreen from './frontend/Screens/SettingsScreen';
import RandomScreen from './frontend/Screens/RandomScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {

  // async function getdata(){
  //   const response = await fetch('https://www.apitutor.org/spotify/simple/v1/search?q=beyonce&type=album&limit=3');
  //   const data = await response.json();
  //   console.log(data);

  // }
  // getdata();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Random') {
            iconName = focused ? 'apps' : 'apps-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: '#00A300',
        inactiveTintColor: '#570987',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Random" component={RandomScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>


        <Stack.Screen name="Main" component={MainTabNavigator} />
    </NavigationContainer>
  );
};

export default App;
