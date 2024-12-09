import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, Modal, TextInput } from 'react-native';
import { where,collection, getDocs,query, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'; 
import { firestore } from '../backend/firebase';
import { launchImageLibrary } from 'react-native-image-picker';
import PlaylistDetails from './PlaylistDetails';


export default function HomeScreen({ accessToken, navigation }) {
  const [playlists, setPlaylists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [playlistImage, setPlaylistImage] = useState(null);

  const playlistsCollection = collection(firestore, 'playlists');

  //fetch the playlist from Firebase
  const fetchPlaylistsFromFirebase = async () => {
    try {
      const q = query(playlistsCollection,where('username', '==','jcronin'));
      const data = await getDocs(q);
      const firebasePlaylists = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setPlaylists(firebasePlaylists);
      console.log(firebasePlaylists);
    } catch (error) {
      console.error('Error fetching playlists from Firebase:', error);
    }
  };
  

  useEffect(() => {
    fetchPlaylistsFromFirebase();

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
  }, [navigation]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Playlist name cannot be empty.');
      return;
    }

    try {
      const newPlaylist = {
        name: newPlaylistName,
        songs: selectedSongs,
        createdAt: new Date().toISOString(),
        image: playlistImage,
      };

      const docRef = await addDoc(playlistsCollection, newPlaylist);
      Alert.alert('Success', `Playlist "${newPlaylistName}" created!`);
      setIsModalVisible(false);

      navigation.navigate('SongSelector', {
        playlistId: docRef.id,
        selectedSongs: [],
        accessToken: accessToken,
        setPlaylists: setPlaylists,
        fetchPlaylistsFromFirebase: fetchPlaylistsFromFirebase,
      });

      fetchPlaylistsFromFirebase();

    } catch (error) {
      console.error('Error creating playlist in Firebase:', error);
      Alert.alert('Error', 'Could not create playlist. Please try again.');
    }
  };

  //this is where the user can pick the image for their playlist
  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.5 },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', 'Could not pick an image. Please try again.');
        } else {
          setPlaylistImage(response.assets[0].uri);  //set the image uri
        }
      }
    );
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      const playlistDoc = doc(firestore, 'playlists', playlistId);
      await deleteDoc(playlistDoc);

      Alert.alert('Success', 'Playlist deleted!');
      setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      Alert.alert('Error', 'Could not delete playlist. Please try again.');
    }
  };

  const handlePlaylistPress = (playlist) => {
    navigation.navigate('PlaylistDetails', { playlist, accessToken });
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
            <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
              <Text style={styles.imageButtonText}>Choose Playlist Image</Text>
            </TouchableOpacity>
            {playlistImage && (
              <Image source={{ uri: playlistImage }} style={styles.previewImage} />
            )}
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
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.playlistImage} />
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
  imageButton: {
    padding: 10,
    backgroundColor: '#87ceeb',
    borderRadius: 5,
    marginBottom: 15,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginTop: 10,
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
    backgroundColor: '#87ceeb',
  },
  cancelModalButton: {
    backgroundColor: '#888',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
