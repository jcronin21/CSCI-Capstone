import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Modal, TextInput } from 'react-native';
import { where, collection, getDocs, query, addDoc, deleteDoc, doc } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';
import { firestore } from '../backend/firebase';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

export default function HomeScreen({ accessToken, navigation }) {
  const [playlists, setPlaylists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlistImage, setPlaylistImage] = useState(null);

  const auth = getAuth(); //Firebase Auth
  const user = auth.currentUser; //get the current logged in user

  useEffect(() => {
    if (user) {
      fetchPlaylistsFromFirebase();
    }

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
  }, [navigation, user]);

  const fetchPlaylistsFromFirebase = async () => {
    try {
      if (!user) return; //making sure the user is auth
      const playlistsCollection = collection(firestore, 'playlists');
      const q = query(playlistsCollection, where('username', '==', user.email)); //query logged in user playlists
      const data = await getDocs(q);
      const firebasePlaylists = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setPlaylists(firebasePlaylists);
    } catch (error) {
      console.error('Error fetching playlists from Firebase:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch playlists.',
      });
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Playlist name cannot be empty.',
      });
      return;
    }

    try {
      if (!user) return;

      const newPlaylist = {
        name: newPlaylistName,
        songs: [],
        createdAt: new Date().toISOString(),
        image: playlistImage,
        username: user.email, 
      };

      const playlistsCollection = collection(firestore, 'playlists');
      const docRef = await addDoc(playlistsCollection, newPlaylist);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Playlist "${newPlaylistName}" created!`,
      });

      setIsModalVisible(false);
      setNewPlaylistName('');
      setPlaylistImage(null);

      navigation.navigate('SongSelector', {
        playlistId: docRef.id,
        selectedSongs: [],
        accessToken,
        setPlaylists,
        fetchPlaylistsFromFirebase,
      });

      fetchPlaylistsFromFirebase();
    } catch (error) {
      console.error('Error creating playlist in Firebase:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not create playlist.',
      });
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      const playlistDoc = doc(firestore, 'playlists', playlistId);
      await deleteDoc(playlistDoc);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Playlist deleted!',
      });

      setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not delete playlist.',
      });
    }
  };

  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.5 },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Could not pick an image.',
          });
        } else {
          setPlaylistImage(response.assets[0].uri);
          Toast.show({
            type: 'info',
            text1: 'Image Selected',
            text2: 'Playlist image added.',
          });
        }
      }
    );
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
            <TouchableOpacity
              style={styles.imageButton}
              onPress={handlePickImage}
            >
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
              <Text style={styles.playlistName}>{item.name}</Text>
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
      <Toast />
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textInput: {
    width: '100%',
    height: 40,
    borderColor: '#E97451',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 15,
  },
  imageButton: {
    backgroundColor: '#E97451',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
  },
  createModalButton: {
    backgroundColor: '#E97451',
  },
  cancelModalButton: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});