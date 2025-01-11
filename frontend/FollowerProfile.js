import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';

export default function FollowerProfile({ route }) {
  const { follower } = route.params;
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const db = getDatabase();
        const userRef = ref(db, `playlists`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const allPlaylists = snapshot.val();
          const filteredPlaylists = Object.values(allPlaylists).filter(
            (playlist) => playlist.username === follower.email
          );

          setPlaylists(filteredPlaylists);
        } else {
          console.log('No playlists found for this follower.');
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, [follower.email]);

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
      <Text style={styles.title}>{follower.email}'s Playlists</Text>
      {playlists.length > 0 ? (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.playlistItem}>
              <Text style={styles.playlistName}>{item.name}</Text>
              {item.songs.map((song, index) => (
                <View key={index} style={styles.songItem}>
                  <Image
                    source={song.image ? { uri: song.image } : require('./assets/placeholder.jpg')}
                    style={styles.albumArt}
                  />
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
      ) : (
        <Text style={styles.noPlaylistsText}>No playlists available for this user.</Text>
      )}
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
  noPlaylistsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
