import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

export default function LoginScreen({ setAccessToken }) {
  const handleLogin = () => {
    const clientId = 'b6ff98053c404aae853a4a1da8ac29ef';
    const redirectUri = 'http://localhost:19006/callback';
    const scopes =
      'user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;

    Linking.openURL(authUrl);

    Linking.addEventListener('url', ({ url }) => {
      if (url.startsWith(redirectUri)) {
        const token = url.match(/access_token=([^&]+)/)?.[1];
        console.log('Extracted Token:', token); //debugger check console
        if (token) {
          setAccessToken(token);
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Tune'n!</Text>
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
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
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    backgroundColor: '#1DB954',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
