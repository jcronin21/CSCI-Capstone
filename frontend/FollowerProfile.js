import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function FollowerProfile({ route }) {
  const { follower } = route.params;

  // Demo playlists for each user
  const initialPlaylists = {
    yikezsikes: [
      { id: '1', name: 'lake day', upvotes: 0, downvotes: 0, hasVoted: false },
      { id: '2', name: 'workout', upvotes: 0, downvotes: 0, hasVoted: false },
    ],
    kmcall2: [
      { id: '1', name: 'birthday party!', upvotes: 0, downvotes: 0, hasVoted: false },
      { id: '2', name: 'dinner mix', upvotes: 0, downvotes: 0, hasVoted: false },
    ],
    cmik: [
      { id: '1', name: 'classic rock', upvotes: 0, downvotes: 0, hasVoted: false },
      { id: '2', name: 'road trip', upvotes: 0, downvotes: 0, hasVoted: false },
    ],
  };

  const [playlists, setPlaylists] = useState(initialPlaylists[follower.name] || []);
//user only allowed one vote per playlist
  const handleVote = (playlistId, type) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          if (playlist.hasVoted) {
            Alert.alert('Error', 'You can only vote once on this playlist.');
            return playlist;
          }
          const updatedVotes = type === 'upvote' ? { upvotes: playlist.upvotes + 1 } : { downvotes: playlist.downvotes + 1 };
          return { ...playlist, ...updatedVotes, hasVoted: true };
        }
        return playlist;
      })
    );
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
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleVote(item.id, 'upvote')}
            >
              <Text style={styles.voteText}>Upvote</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => handleVote(item.id, 'downvote')}
            >
              <Text style={styles.voteText}>Downvote</Text>
            </TouchableOpacity>
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
});
