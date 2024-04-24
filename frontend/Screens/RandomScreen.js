import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';

const RandomScreen = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const SPOTIFY_API_KEY = 'b6ff98053c404aae853a4a1da8ac29ef'; 

  useEffect(() => {
    searchTracks();
  }, []);

  const searchTracks = async () => {
    if (inputValue.trim() !== '') {
      try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${inputValue}&type=track`, {
          headers: {
            Authorization: `Bearer ${SPOTIFY_API_KEY}`
          }
        });
        if (!response.ok) {
          throw new Error('Error fetching search results');
        }
        const data = await response.json();
        if (data.tracks && data.tracks.items) {
          setSearchResults(data.tracks.items);
        } else {
          console.error('No tracks found in search results.');
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }
  };

  const playTrack = (track) => {
    // Implement play functionality here
    console.log('Playing track:', track);
  };

  const renderTrackItem = ({ item }) => (
    <TouchableOpacity onPress={() => playTrack(item)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
        <Image
          source={{ uri: item.album.images[0].url }}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
        />
        <View>
          <Text>{item.name}</Text>
          <Text>{item.artists.map(artist => artist.name).join(', ')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 20, padding: 5 }}
        onChangeText={text => setInputValue(text)}
        value={inputValue}
        placeholder="Search for a song"
      />
      <Button title="Search" onPress={searchTracks} />

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={renderTrackItem}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

export default RandomScreen;




































