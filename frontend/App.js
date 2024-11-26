import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from './HomeScreen';
import PlaylistDetails from './PlaylistDetails';
import SongSelector from './SongSelector';
import SearchScreen from './SearchScreen';
import ProfileScreen from './ProfileScreen';
import FollowerProfile from './FollowerProfile';
import LoginScreen from './LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = ({ accessToken }) => (
  <Stack.Navigator>
    <Stack.Screen name="Home" options={{ title: 'Your Playlists' }}>
      {(props) => <HomeScreen {...props} accessToken={accessToken} />}
    </Stack.Screen>
    <Stack.Screen name="PlaylistDetails" component={PlaylistDetails} />
    <Stack.Screen
      name="SongSelector"
      component={SongSelector}
      options={{ title: 'Add Songs to Playlist' }}
    />
  </Stack.Navigator>
);

const ProfileStack = ({ accessToken }) => (
  <Stack.Navigator>
    <Stack.Screen name="ProfileScreen">
      {(props) => <ProfileScreen {...props} accessToken={accessToken} />}
    </Stack.Screen>
    <Stack.Screen
      name="FollowerProfile"
      component={FollowerProfile}
      options={{ title: 'Follower Profile' }}
    />
  </Stack.Navigator>
);

export default function App() {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    //put your own token here
    const hardcodedToken = '';
    setAccessToken(hardcodedToken);
  }, []);

  return (
    <NavigationContainer>
      {accessToken ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Search') {
                iconName = focused ? 'search' : 'search-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#8f5bce',
            tabBarInactiveTintColor: '#050707',
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home">
            {(props) => <HomeStack {...props} accessToken={accessToken} />}
          </Tab.Screen>
          <Tab.Screen name="Search">
            {(props) => <SearchScreen {...props} accessToken={accessToken} />}
          </Tab.Screen>
          <Tab.Screen name="Profile">
            {(props) => <ProfileStack {...props} accessToken={accessToken} />}
          </Tab.Screen>
        </Tab.Navigator>
      ) : (
        <LoginScreen setAccessToken={setAccessToken} />
      )}
    </NavigationContainer>
  );
}
