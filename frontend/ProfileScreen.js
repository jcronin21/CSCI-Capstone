import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../backend/firebase';
import Toast from 'react-native-toast-message';

export default function ProfileScreen({ accessToken, navigation }) {
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedFollowerPlaylists, setSelectedFollowerPlaylists] = useState(null); //playlists of followers
  const [selectedPlaylistVotes, setSelectedPlaylistVotes] = useState({}); //votes for playlists
  const [messages, setMessages] = useState([]); //notif wall

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        console.log('No user logged in');
        navigation.navigate('Login');
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  //spotify profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user && accessToken) {
          const profileResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const profileData = await profileResponse.json();
          setProfile(profileData);

          const collectionRef = collection(db, 'users');
          const querySnapshot = await getDocs(collectionRef);

          const userDoc = querySnapshot.docs.find(
            (doc) => doc.data().email === user.email
          );

          if (userDoc) {
            const data = userDoc.data();
            setFollowers(data.followers || []);
            setMessages(data.messages || []); //show all notifications
          } else {
            console.log('User document not found in Firestore');
          }
        }
      } catch (error) {
        console.error('Error fetching profile or followers:', error);
      }
    };

    fetchData();
  }, [user, accessToken]);

  //get the follower's playlists
  const fetchFollowerPlaylists = async (followerName) => {
    try {
      const followerDoc = await getDocs(collection(db, 'playlists'));
      const playlists = [];

      followerDoc.forEach((doc) => {
        if (doc.data().username === followerName) {
          playlists.push(doc.data());
        }
      });

      setSelectedFollowerPlaylists(playlists);
    } catch (error) {
      console.error('Error fetching follower playlists:', error);
    }
  };

  //handle the votes
  const handleVote = async (playlistId, voteType) => {
    try {
      const playlistRef = doc(db, 'playlists', playlistId);

      //update the playlist with the new vote
      await updateDoc(playlistRef, { vote: voteType });

      setSelectedPlaylistVotes((prevVotes) => ({
        ...prevVotes,
        [playlistId]: voteType,
      }));

      //show notifs
      Toast.show({
        type: 'success',
        text1: `Playlist ${voteType}!`,
      });
    } catch (error) {
      console.error('Error handling vote:', error);
    }
  };

  //ratings
  const handleRate = (playlistName, rating) => {
    Toast.show({
      type: 'info',
      text1: `Playlist "${playlistName}" rated as:`,
      text2: `${rating}`,
    });
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
          {followers.length > 0 ? (
            <FlatList
              data={followers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.followerItem}>
                  <TouchableOpacity onPress={() => fetchFollowerPlaylists(item)}>
                    <Text style={styles.followerName}>{item}</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noFollowersText}>
              You have no followers yet!
            </Text>
          )}

          {selectedFollowerPlaylists && selectedFollowerPlaylists.length > 0 && (
            <View style={styles.playlistsSection}>
              <Text style={styles.sectionTitle}>Follower's Playlists</Text>
              <FlatList
                data={selectedFollowerPlaylists}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.playlistItem}>
                    <Text style={styles.playlistName}>{item.name}</Text>
                    <View style={styles.voteButtons}>
                      <TouchableOpacity
                        onPress={() => handleVote(item.id, 'upvoted')}>
                        <Text style={styles.voteButton}>👍</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleVote(item.id, 'downvoted')}>
                        <Text style={styles.voteButton}>👎</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.ratingButtons}>
                      <TouchableOpacity
                        onPress={() =>
                          handleRate(item.name, 'Best Music Taste')
                        }>
                        <Text style={styles.rateButton}>Rate as: Best Music Taste</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleRate(item.name, 'Smooth Music Transitions')
                        }>
                        <Text style={styles.rateButton}>
                          Rate as: Smooth Music Transitions
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          )}
          <Text style={styles.sectionTitle}>Notifications</Text>
          {messages.length > 0 ? (
            <FlatList
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.notificationItem}>
                  <Text>{item}</Text>
                </View>
              )}
            />
          ) : (
            <Text>No new notifications</Text>
          )}
        </>
      ) : (
        <Text>Loading...</Text>
      )}
      <Toast />
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
  noFollowersText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  followerItem: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    width: '90%',
  },
  followerName: {
    fontSize: 16,
    color: '#333',
  },
  playlistsSection: {
    marginTop: 20,
    width: '90%',
  },
  playlistItem: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  voteButtons: {
    flexDirection: 'row',
    marginTop: 5,
  },
  voteButton: {
    fontSize: 18,
    marginRight: 10,
  },
  ratingButtons: {
    marginTop: 10,
  },
  rateButton: {
    fontSize: 14,
    color: '#007BFF',
    marginVertical: 5,
  },
  notificationItem: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    width: '90%',
  },
});
