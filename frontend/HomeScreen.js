import React, { useEffect, useState } from 'react';
import {View,Text,FlatList,TouchableOpacity,StyleSheet,Image,Alert,Modal,TextInput,} from 'react-native';
import axios from 'axios';

export default function HomeScreen({ accessToken, navigation }) {
  const [playlists, setPlaylists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsModalVisible(true)}
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
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Playlist name cannot be empty.');
      return;
    }

    try {
      const response = await axios.post(
        'https://api.spotify.com/v1/me/playlists',
        { name: newPlaylistName },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      Alert.alert('Success', `Playlist "${response.data.name}" created!`);
      setPlaylists((prev) => [response.data, ...prev]);
      setNewPlaylistName('');
      setIsModalVisible(false);

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

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await axios.delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      Alert.alert('Success', 'Playlist deleted!');
      setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      Alert.alert('Error', 'Could not delete playlist. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Playlist</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter playlist name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.createModalButton]}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.images && item.images.length > 0 ? (
              <Image
                source={{ uri: item.images[0].url }}
                style={styles.playlistImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <View style={styles.infoContainer}>
              <TouchableOpacity onPress={() => handlePlaylistPress(item)}>
                <Text style={styles.playlistName}>{item.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePlaylist(item.id)}
              >
                <Text style={styles.deleteText}>...</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#CCCCFF',
  },

  item: {
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
  playlistImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 10,
    color: '#fff',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  createModalButton: {
    backgroundColor: '#1DB954',
  },
  cancelModalButton: {
    backgroundColor: '#888',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
