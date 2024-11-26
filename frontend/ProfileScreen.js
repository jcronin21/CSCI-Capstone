import React, { useEffect, useState } from 'react';
import {View,Text,StyleSheet,Image,FlatList,TouchableOpacity,} from 'react-native';
import axios from 'axios';

const extractUserId = (profileUrl) => {
  if (!profileUrl) return null;
  const userId = profileUrl.split('/user/')[1]?.split('?')[0];
  return userId || null;
};


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
  
        setFollowers([
          {
            id: '1',
            name: 'yikezsikes',
            image: require('./assets/pfp 1.jpg'),
            profileUrl: 'https://open.spotify.com/user/kotlc17?si=4ca188ead8924e8b',
          },
          {
            id: '2',
            name: 'kmcall2',
            image: require('./assets/pfp 2.jpg'),
            profileUrl: 'https://open.spotify.com/user/kristen.mccall.2002?si=ab88b4bf2d1a45f3',
          },
          {
            id: '3',
            name: 'cmik',
            image: require('./assets/pfp 3.jpg'),
            profileUrl: 'https://open.spotify.com/user/iamwilliarthekedge?si=63c8d70164084ff3',
          },
        ]);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
  
    fetchProfile();
  }, [accessToken]);
  
  
  
  const handleFollowerPress = (follower) => {
    const userId = extractUserId(follower.profileUrl);
    if (!userId) {
      console.error('Invalid Spotify profile URL');
      return;
    }
    navigation.navigate('FollowerProfile', { follower, userId });
  };
  
  
  return (
    <View style={styles.container}>
      {profile ? (
        <>
          {profile.images && profile.images.length > 0 && (
            <Image
              source={{ uri: profile.images[0].url }}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.title}>{profile.display_name}</Text>
          <Text style={styles.email}>Email: {profile.email}</Text>

          <Text style={styles.sectionTitle}>Followers</Text>
          <FlatList
            data={followers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.followerItem}
                onPress={() => handleFollowerPress(item)}>
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
    backgroundColor: '#CCCCFF',
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
