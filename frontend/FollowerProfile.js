import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';

export default function FollowerProfile({ route }) {
  const { follower } = route.params;

  const initialPlaylists = {
    yikezsikes: [
      {
        id: '1',
        name: 'lake day',
        upvotes: 0,
        downvotes: 0,
        hasVoted: false,
        songs: [
          { name: 'Good Vibrations - The Beach Boys', image: require('./assets/good.jpg') },
          { name: 'Sitting on the Dock of the Bay - Otis Redding', image: require('./assets/dock.jpg') },
        ],
      },
      {
        id: '2',
        name: 'workout',
        upvotes: 0,
        downvotes: 0,
        hasVoted: false,
        songs: [
          { name: 'Eye of the Tiger - Survivor', image:require('./assets/tiger.jpg') },
          { name: 'Stronger - Kanye West', image:require('./assets/stronger.jpg') },
        ],
      },
    ],
    kmcall2: [
      {
        id: '1',
        name: 'birthday party!',
        upvotes: 0,
        downvotes: 0,
        hasVoted: false,
        songs: [
          { name: 'Happy Birthday - Stevie Wonder', image:require('./assets/wonder.jpeg') },
          { name: 'Celebration - Kool & The Gang', image:require('./assets/celebration.jpg') },
        ],
      },
    ],
  };

  const [playlists, setPlaylists] = useState(initialPlaylists[follower.name] || []);
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
            {item.songs.map((song, index) => (
              <View key={index} style={styles.songItem}>
                <Image source={{ uri: song.image }} style={styles.albumArt} />
                <Text style={styles.songName}>{song.name}</Text>
              </View>
            ))}
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
    marginBottom: 10,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  albumArt: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  songName: {
    fontSize: 16,
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
