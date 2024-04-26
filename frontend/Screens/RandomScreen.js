import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';

const RandomScreen = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);


  useEffect(() => {
    searchTracks();
  }, []);

  
  const searchTracks = async () => {
    const query = inputValue.trim();
    if (!query) {
      console.error('Please enter a valid track to search.'); 
      return;
    }
  
    const searchType = 'track';
  
    try {
      const response = await fetch(`http://localhost:5000/api/search?q=${query}&type=${searchType}`);
      if (!response.ok) {
        throw new Error('Error fetching search results');
      }
      const data = await response.json();
      console.log('Search results:', data);
  
      if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
        setSearchResults(data.tracks.items);
      } else {
        console.error('No tracks found in search results.');
        setSearchResults([]); //clean it out
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
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
          onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
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
        style={{ marginTop: 20, width: '100%' }}
      />
    </View>
  );
}

export default RandomScreen;




//use this ??? 
//http://127.0.0.1:5000/spotify-login








//dont forget to refresh
//api keys expire every hour...!





















