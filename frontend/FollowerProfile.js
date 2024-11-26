import React, { useState } from 'react';
import {View,Text,FlatList,StyleSheet,TouchableOpacity,TextInput,Modal,Alert,} from 'react-native';
import axios from 'axios';

export default function FollowerProfile({ route }) {
  const { follower, accessToken } = route.params;

  //demo playlists for each user
  const initialPlaylists = {
    yikezsikes: [
      { id: '1', name: 'lake day', upvotes: 0, downvotes: 0, rating: 0, suggestedSongs: [] },
      { id: '2', name: 'workout', upvotes: 0, downvotes: 0, rating: 0, suggestedSongs: [] },
    ],
    kmcall2: [
      { id: '1', name: 'birthday party!', upvotes: 0, downvotes: 0, rating: 0, suggestedSongs: [] },
      { id: '2', name: 'dinner mix', upvotes: 0, downvotes: 0, rating: 0, suggestedSongs: [] },
    ],
    cmik: [
      { id: '1', name: 'classic rock', upvotes: 0, downvotes: 0, rating: 0, suggestedSongs: [] },
      { id: '2', name: 'road trip', upvotes: 0, downvotes: 0, rating: 0, suggestedSongs: [] },
    ],
  };

  const [playlists, setPlaylists] = useState(initialPlaylists[follower.name] || []);
  const [isSuggestModalVisible, setSuggestModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  const handleUpvote = (playlistId) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, upvotes: playlist.upvotes + 1 } : playlist
      )
    );
  };

  const handleDownvote = (playlistId) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, downvotes: playlist.downvotes + 1 } : playlist
      )
    );
  };

  const handleRating = (playlistId, rating) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, rating } : playlist
      )
    );
    Alert.alert('Success', `Rated playlist with ${rating} stars!`);
  };

  const handleOpenSuggestModal = (playlistId) => {
    setSelectedPlaylistId(playlistId);
    setSuggestModalVisible(true);
  };

  const handleSearchTracks = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { q: searchQuery, type: 'track', limit: 5 },
      });
      setSearchResults(response.data.tracks.items);
    } catch (error) {
      console.error('Error searching tracks:', error);
      Alert.alert('Error', 'Failed to fetch search results.');
    }
  };

  const handleSuggestSong = (track) => {
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === selectedPlaylistId
          ? { ...playlist, suggestedSongs: [...playlist.suggestedSongs, track.name] }
          : playlist
      )
    );
    setSearchQuery('');
    setSearchResults([]);
    setSuggestModalVisible(false);
    Alert.alert('Success', `"${track.name}" suggested for the playlist!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{follower.name}'s Playlists</Text>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playlistItem}>
            <Text style={styles.playlistName}>{item.name}</Text>
            <Text>Upvotes: {item.upvotes}</Text>
            <Text>Downvotes: {item.downvotes}</Text>
            <Text>Rating: {item.rating} / 5</Text>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleUpvote(item.id)}
            >
              <Text style={styles.voteText}>Upvote</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleDownvote(item.id)}
            >
              <Text style={styles.voteText}>Downvote</Text>
            </TouchableOpacity>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRating(item.id, star)}
                >
                  <Text style={styles.star}>{'★'.repeat(star)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.suggestButton}
              onPress={() => handleOpenSuggestModal(item.id)}
            >
              <Text style={styles.suggestText}>Suggest a Song</Text>
            </TouchableOpacity>
          </View>
        )}
      />

<Modal
  visible={isSuggestModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setSuggestModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Suggest a Song</Text>
      <TextInput
        style={styles.input}
        placeholder="Search for a song..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearchTracks} 
      />
      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.songItem}
              onPress={() => handleSuggestSong(item)}
            >
              <Text style={styles.songName}>{item.name}</Text>
              <Text style={styles.artistName}>
                {item.artists.map((artist) => artist.name).join(', ')}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noResultsText}>
          {searchQuery ? 'No results found.' : 'Start typing to search for songs.'}
        </Text>
      )}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setSuggestModalVisible(false)}
      >
        <Text style={styles.cancelText}>Cancel</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  playlistItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  voteButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E97451',
    borderRadius: 5,
  },
  voteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  star: {
    fontSize: 20,
    color: '#FFD700',
  },
  suggestButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E97451',
    borderRadius: 5,
  },
  suggestText: {
    color: '#fff',
    fontWeight: 'bold',
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  songItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  artistName: {
    fontSize: 14,
    color: '#666',
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
  noResultsText: {
    fontSize: 16,
    color: '#888',
    marginVertical: 10,
    textAlign: 'center',
  },
  songName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E97451',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});
