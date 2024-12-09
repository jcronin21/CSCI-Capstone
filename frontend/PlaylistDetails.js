import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
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
            <iframe
              key={item.id}
              src={`https://open.spotify.com/embed/track/${item.id}?utm_source=generator`}
              width="100%"
              height="100"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
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
    marginBottom: 10,
  },
});
