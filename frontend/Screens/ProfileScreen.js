import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/playlists'); 
      if (!response.ok) {
        throw new Error('Error fetching playlists');
      }
      const data = await response.json();
      setPlaylists(data.items);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity onPress={() => { /*add some stuff here later */ }}>
      <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
        <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
        <Text>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
  

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Your Playlists</Text>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylistItem}
      />
    </View>
  );
}

export default ProfileScreen;
