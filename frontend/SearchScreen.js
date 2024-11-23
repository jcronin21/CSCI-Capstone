import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import axios from 'axios';

export default function SearchScreen({ accessToken }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const searchTracks = async () => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { q: query, type: 'track', limit: 10 },
      });
      setResults(response.data.tracks.items);
    } catch (error) {
      console.error('Error searching tracks:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for songs..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchTracks}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.item}>{item.name} by {item.artists[0].name}</Text>
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
