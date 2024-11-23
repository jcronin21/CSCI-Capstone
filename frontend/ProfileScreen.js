import React, { useEffect, useState } from 'react';
import {View,Text,StyleSheet,Image,FlatList,TouchableOpacity,} from 'react-native';
import axios from 'axios';

export default function ProfileScreen({ accessToken, navigation }) {
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setProfile(response.data);

        //get actual user data
        setFollowers([
          { id: '1', name: 'Hope', image: 'https://via.placeholder.com/50' },
          { id: '2', name: 'Kristen', image: 'https://via.placeholder.com/50' },
          { id: '3', name: 'Corn', image: 'https://via.placeholder.com/50' },
        ]);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const handleFollowerPress = (follower) => {
    //nav temp- fix later
    navigation.navigate('FollowerProfile', { follower });
  };

  return (
    <View style={styles.container}>
      {profile ? (
        <>
          {/*Profile*/}
          {profile.images && profile.images.length > 0 && (
            <Image
              source={{ uri: profile.images[0].url }}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.title}>{profile.display_name}</Text>
          <Text style={styles.email}>Email: {profile.email}</Text>

          {/*Followers*/}
          <Text style={styles.sectionTitle}>Followers</Text>
          <FlatList
            data={followers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.followerItem}
                onPress={() => handleFollowerPress(item)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.followerImage}
                />
                <Text style={styles.followerName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#5A4FCF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  followerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  followerName: {
    fontSize: 16,
  },
});
