import React, { useState, useEffect } from 'react';
import {View,TextInput,FlatList,Text,StyleSheet,Image,TouchableOpacity,Alert,Modal,} from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';

export default function SearchScreen({ accessToken, userPlaylists }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [sound, setSound] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const searchTracks = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { q: query, type: 'track', limit: 10 },
      });
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
  const pausePreview = async() =>{
    if(sound){
      try{
        await sound.pauseAsync();
      }catch(error){
        console.error('Error pausing playback:',error);
        Alert.alert('Error','Could not pause the preview :(');
      }
    }else{
      Alert.alert('No audio', 'No audio is currently playing');
    }

  };
  const handleAddToPlaylist = (track) => {
    setSelectedTrack(track);
    setIsModalVisible(true);
  };

  const confirmAddToPlaylist = async (playlistId) => {
    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: [`spotify:track:${selectedTrack.id}`],
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.songItem}>
            <Image
              source={{ uri: item.album.images[0]?.url }}
              style={styles.albumCover}
            />
            <View style={styles.songInfo}>
              <Text style={styles.songName}>{item.name}</Text>
              <Text style={styles.songDetails}>
                {item.artists[0].name} • {item.album.name}
              </Text>
            </View>
            {item.preview_url ? (
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => playPreview(item.preview_url)}
              >
                <Text style={styles.playButtonText}>▶</Text>
              </TouchableOpacity>
              
            ) : (
              <Text style={styles.noPreview}>No Preview</Text>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToPlaylist(item)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.pauseButton}
                onPress={() => pausePreview(item.preview_url)}
              >
                <Text style={styles.pauseButtonText}>||</Text>
              </TouchableOpacity>
            
          </View>
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
              data={userPlaylists}
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
  pauseButtonText:{
    color:'#fff',
    fontWeight:'bold',
    fontSize:18,
    color:'5A4FCF',
  },
  puaseButton:{
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
    backgroundColor: '#F0F8FF',
    marginBottom: 10,
    borderRadius: 5,
  },
  playlistName: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E97451',
    borderRadius: 5,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
