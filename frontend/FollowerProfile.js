import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function FollowerProfile({ route }) {
  const { follower } = route.params;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: follower.image }}
        style={styles.profileImage}
      />
      <Text style={styles.title}>{follower.name}</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
