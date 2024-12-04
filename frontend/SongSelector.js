import React, { useState } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../backend/firebase';
import axios from 'axios';

export default function SongSelector({ route, navigation }) {
    const { playlistId, accessToken, selectedSongs: initialSelectedSongs, setPlaylists, fetchPlaylistsFromFirebase } = route.params;

    const handleAddSongs = async () => {
        if (!accessToken) {
          Alert.alert('Error', 'Access token is missing. Please log in again.');
          return;
        }
    
        try {
          //update the Firebase playlist with selected songs
          const playlistRef = doc(firestore, 'playlists', playlistId);
          await updateDoc(playlistRef, {
            songs: selectedSongs,  //add the selected songs to the Firebase playlist
          });
    
          //refresh the playlist list by calling the passed function
          fetchPlaylistsFromFirebase();
    
          Alert.alert('Success', 'Songs added to the playlist!');
          navigation.goBack();
        } catch (error) {
          console.error('Error updating playlist:', error);
          Alert.alert('Error', 'Failed to add songs to the playlist.');
        }
      };



    //Check if accessToken is missing
  if (!accessToken) {
    Alert.alert('Error', 'Access token is missing. Please log in again.');
    return null;  //return null to stop further rendering
  }

  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState(initialSelectedSongs || []);

  const searchTracks = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { q: query, type: 'track', limit: 10 },
      });
      setSongs(response.data.tracks.items);
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  };

  const handleSongToggle = (songId) => {
    setSelectedSongs((prevSelected) =>
      prevSelected.includes(songId)
        ? prevSelected.filter((id) => id !== songId)
        : [...prevSelected, songId]
    );
  };

  
  
  

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for songs..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchTracks}
      />
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
            <View style={styles.songDetails}>
              <Text style={styles.songName}>{item.name}</Text>
              <Text style={styles.artistName}>
                {item.artists.map((artist) => artist.name).join(', ')}
              </Text>
            </View>
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
    backgroundColor:'#CCCCFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  songDetails: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistName: {
    fontSize: 14,
    color: '#666',
  },
  selectedSong: {
    backgroundColor: '#d1f7d6',
  },
  addButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#87ceeb',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
