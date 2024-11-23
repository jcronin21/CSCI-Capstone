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
import LoginScreen from './LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = ({ accessToken }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      options={{ title: 'Your Playlists' }}
    >
      {(props) => <HomeScreen {...props} accessToken={accessToken} />}
    </Stack.Screen>
    <Stack.Screen
      name="PlaylistDetails"
      component={PlaylistDetails}
    />
    <Stack.Screen
      name="SongSelector"
      component={SongSelector}
      options={{ title: 'Add Songs to Playlist' }}
    />
  </Stack.Navigator>
);

export default function App() {
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    //temp token, put your own token here
    const hardcodedToken = 'BQAfnal0YCHepK9roM1-ivUAI6Unm52BPcKLLoV1VCjowav_3AyR_nH0qNNu3ldaLkaPk0zcKdlaqO-sZO5CiMKAUdCg9_AsHn8spvnrfHCbL_F23BhgY_4nKI9Dw6LICZWsFY0LnnqL2SH_hgmr4E06p4KmSZk1XUioVFYcamzFN6y0n1UylnQfZDgYand04XA2XiW7jKNKz2IuyOm5FoIuLhMrr91_y_Eg5zLUcup0M_neBnSIyrH72u4II6KcBGxDVQ9E';
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
            tabBarActiveTintColor: '#1DB954',
            tabBarInactiveTintColor: 'gray',
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
            {(props) => <ProfileScreen {...props} accessToken={accessToken} />}
          </Tab.Screen>
        </Tab.Navigator>
      ) : (
        <LoginScreen setAccessToken={setAccessToken} />
      )}
    </NavigationContainer>
  );
}
