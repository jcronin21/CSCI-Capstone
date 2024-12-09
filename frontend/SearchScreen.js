import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Image, TouchableOpacity, Alert, Modal } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { getDatabase, ref, set, get } from 'firebase/database'; 

export default function SearchScreen({ accessToken, userPlaylists = [] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [sound, setSound] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [firebasePlaylists, setFirebasePlaylists] = useState([]);

  //playlists from Firebase (user's own playlists)
  useEffect(() => {
    const fetchFirebasePlaylists = async () => {
      const db = getDatabase();
      const userPlaylistsRef = ref(db, 'playlists/');
      try {
        const snapshot = await get(userPlaylistsRef);
        if (snapshot.exists()) {
          setFirebasePlaylists(Object.values(snapshot.val())); //store playlist(s)
        }
      } catch (error) {
        console.error('Error fetching playlists from Firebase:', error);
      }
    };
    fetchFirebasePlaylists();
  }, []);

  //fetching the songs from spotify based on user search
  const searchTracks = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { q: query, type: 'track', limit: 10 },
      });
      console.log("Spotify API Response:", response.data.tracks.items);
      setResults(response.data.tracks.items);
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  };
  
  const playPreview = async (url) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    if (!url) {
      Alert.alert('Error', 'This track does not have a preview.');
      return;
    }

    try {
      console.log('Playing preview:', url);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Could not play the preview.');
    }
  };

  const pausePreview = async () => {
    if (sound) {
      try {
        await sound.pauseAsync();
      } catch (error) {
        console.error('Error pausing playback:', error);
        Alert.alert('Error', 'Could not pause the preview :(');
      }
    } else {
      Alert.alert('No audio', 'No audio is currently playing');
    }
  };

  const handleAddToPlaylist = (track) => {
    setSelectedTrack(track);
    setIsModalVisible(true);
  };

  //add the selected song to the selected Firebase playlist
  const confirmAddToPlaylist = async (playlistId) => {
    try {
      const db = getDatabase();
      const playlistRef = ref(db, `playlists/${playlistId}/tracks/`);
      await set(playlistRef, {
        [selectedTrack.id]: {
          id: selectedTrack.id,
          name: selectedTrack.name,
          artist: selectedTrack.artists[0]?.name,
          album: selectedTrack.album?.name,
          preview_url: selectedTrack.preview_url,
        },
      });
      Alert.alert('Success', `"${selectedTrack.name}" added to the playlist!`);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      Alert.alert('Error', 'Failed to add the song to the playlist.');
    } finally {
      setIsModalVisible(false);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

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
  data={results}
  keyExtractor={(item) => item?.id ?? item?.track?.id ?? 'defaultKey'}
  renderItem={({ item }) => (
    <>
    <iframe
    key="1EjQRTG53jsinzk2xlVVJP"
    src={"https://open.spotify.com/embed/track/"+item.id+"?utm_source=generator"} 
    width="100%" 
    border="0"
    height="100" 
    frameBorder="0"
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
    loading="lazy"></iframe>
    
    </>
  )}
/>


      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add "{selectedTrack?.name}" to Playlist</Text>
            <FlatList
              data={firebasePlaylists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.playlistItem}
                  onPress={() => confirmAddToPlaylist(item.id)}
                >
                  <Text style={styles.playlistName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#CCCCFF',
  },
  input: {
    borderWidth: 2,
    borderColor: '#87CEEB',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  albumCover: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  songDetails: {
    fontSize: 14,
    color: '#666',
  },
  playButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5A4FCF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  pauseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#FFFF',
  },
  pauseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5A4FCF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  noPreview: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 5,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E97451',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  playlistItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  playlistName: {
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
