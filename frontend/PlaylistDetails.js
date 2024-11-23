import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

export default function PlaylistDetails({ route }) {
  const { playlist, accessToken } = route.params;
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setTracks(response.data.items);
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };

    fetchTracks();
  }, [playlist, accessToken]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{playlist.name}</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.track.id}
        renderItem={({ item }) => (
          <View style={styles.trackItem}>
            <Text style={styles.trackName}>{item.track.name}</Text>
            <Text style={styles.trackArtist}>
              {item.track.artists.map((artist) => artist.name).join(', ')}
            </Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  trackItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
  },
});
