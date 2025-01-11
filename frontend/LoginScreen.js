import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen({ setAccessToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); 

  useEffect(() => {
    const authUrl = getSpotifyAuthUrl();
    Linking.addEventListener('url', handleRedirect);

    return () => {
      Linking.removeEventListener('url', handleRedirect);
    };
  }, []);

  const getSpotifyAuthUrl = () => {
    const clientId = 'b6ff98053c404aae853a4a1da8ac29ef';
    const redirectUri = 'http://localhost:19006/callback';
    const scopes =
      'user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private';
    return `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;
  };

  const handleRedirect = ({ url }) => {
    const redirectUri = 'http://localhost:19006/callback';
    if (url.startsWith(redirectUri)) {
      const token = url.match(/access_token=([^&]+)/)?.[1];
      if (token) {
        console.log('Spotify Token:', token); 
        setAccessToken(token); //Save token
        navigation.navigate('Home'); //navigate to home after login
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const auth = getAuth();
    try {
      //firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase Login Success:', userCredential.user);
      setLoading(false);

      //spotify login
      Linking.openURL(getSpotifyAuthUrl());
      
    } catch (error) {
      console.error('Firebase Login Error:', error);
      setLoading(false);
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Tune'n!</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Log In with Firebase</Text>
      </TouchableOpacity>

      {loading && <Text style={styles.loadingText}>Loading...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8f5bce',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
  },
  input: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    padding: 15,
    backgroundColor: '#5deaf6',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
  },
});
;
