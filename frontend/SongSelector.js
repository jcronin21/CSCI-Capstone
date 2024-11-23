import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function SongSelector({ route, navigation }) {
  const { playlistId, accessToken } = route.params;
  const [songs, setSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);

  useEffect(() => {
    const fetchSavedTracks = async () => {
      try {
        const response = await axios.get('https://api.spotify.com/v1/me/tracks', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSongs(response.data.items.map((item) => item.track));
      } catch (error) {
        console.error('Error fetching saved tracks:', error);
      }
    };

    fetchSavedTracks();
  }, [accessToken]);

  const handleSongToggle = (songId) => {
    setSelectedSongs((prevSelected) =>
      prevSelected.includes(songId)
        ? prevSelected.filter((id) => id !== songId)
        : [...prevSelected, songId]
    );
  };

  const handleAddSongs = async () => {
    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: selectedSongs.map((id) => `spotify:track:${id}`),
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      Alert.alert('Success', 'Songs added to the playlist!');
      navigation.goBack(); 
    } catch (error) {
      console.error('Error adding songs to playlist:', error);
      Alert.alert('Error', 'Failed to add songs to the playlist.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Songs</Text>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.songItem,
              selectedSongs.includes(item.id) && styles.selectedSong,
            ]}
            onPress={() => handleSongToggle(item.id)}
          >
            <Text>{item.name}</Text>
            <Text style={styles.artistName}>
              {item.artists.map((artist) => artist.name).join(', ')}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddSongs}
        disabled={selectedSongs.length === 0}
      >
        <Text style={styles.addButtonText}>
          Add {selectedSongs.length} Song(s)
        </Text>
      </TouchableOpacity>
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
  songItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedSong: {
    backgroundColor: '#d1f7d6',
  },
  artistName: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1DB954',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
