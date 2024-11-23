import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function HomeScreen({ accessToken, navigation }) {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePlaylist}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      ),
    });

    const fetchPlaylists = async () => {
      try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPlaylists(response.data.items);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, [accessToken, navigation]);

  const handleCreatePlaylist = async () => {
    try {
      const playlistName = "New Playlist"; //need to fix this to user input
      const response = await axios.post(
        'https://api.spotify.com/v1/me/playlists',
        { name: playlistName },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      Alert.alert('Success', `Playlist "${response.data.name}" created!`);
      setPlaylists((prev) => [response.data, ...prev]);
  
      navigation.navigate('SongSelector', {
        playlistId: response.data.id,
        accessToken,
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Could not create playlist. Please try again.');
    }
  };
  

  const handlePlaylistPress = (playlist) => {
    navigation.navigate('PlaylistDetails', { playlist, accessToken });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Playlists</Text>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => handlePlaylistPress(item)}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  createButton: {
    marginRight: 15,
    padding: 10,
    backgroundColor: '#E97451',
    borderRadius: 5,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
