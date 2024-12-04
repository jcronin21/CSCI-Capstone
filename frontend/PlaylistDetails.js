import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import axios from 'axios';

export default function PlaylistDetails({ route }) {
  const { playlist, accessToken } = route.params;
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        if (playlist.songs && playlist.songs.length > 0) {
          const songDetails = await Promise.all(
            playlist.songs.map(async (songId) => {
              const response = await axios.get(`https://api.spotify.com/v1/tracks/${songId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              return response.data;
            })
          );
          setTracks(songDetails);
        } else {
          console.warn('No songs found in the playlist.');
        }
      } catch (error) {
        console.error('Error fetching song details:', error);
      }
    };

    fetchSongDetails();
  }, [playlist, accessToken]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{playlist.name}</Text>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.trackItem}>
            {item.album.images.length > 0 && (
              <Image
                source={{ uri: item.album.images[0].url }}
                style={styles.trackImage}
              />
            )}
            <View style={styles.trackInfo}>
              <Text style={styles.trackName}>{item.name}</Text>
              <Text style={styles.trackArtist}>
                {item.artists.map((artist) => artist.name).join(', ')}
              </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  trackImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  trackInfo: {
    flex: 1,
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
