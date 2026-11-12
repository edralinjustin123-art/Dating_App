
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function DateMateCard({
  profileId,
  photo,
  name,
  age,
  status,
  message,
}) {
  const [liked, setLiked] = useState(false);
  const [skipped, setSkipped] = useState(false);

  if (skipped) {
    return (
      <View style={styles.skippedCard}>
        <Text style={styles.skippedText}>
          {name} was skipped
        </Text>

        <Pressable
          style={styles.restoreButton}
          onPress={() => setSkipped(false)}
        >
          <Text style={styles.restoreButtonText}>Restore Profile</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Image source={photo} style={styles.photo} />

      <View style={styles.statusBadge}>
        <View
          style={[
            styles.statusDot,
            status.toLowerCase() === 'online'
              ? styles.onlineDot
              : styles.offlineDot,
          ]}
        />
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.name}>
          {name}, {age}
        </Text>

        <Text style={styles.message}>{message}</Text>

        <Pressable
          style={styles.viewProfileButton}
          onPress={() =>
            router.push({
              pathname: '/profile/[id]',
              params: { id: profileId },
            })
          }
        >
          <Text style={styles.viewProfileText}>View Profile</Text>
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.skipButton}
            onPress={() => setSkipped(true)}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>

          <Pressable
            style={[
              styles.likeButton,
              liked && styles.likedButton,
            ]}
            onPress={() => setLiked(!liked)}
          >
            <Text style={styles.likeButtonText}>
              {liked ? '♥ Liked' : '♡ Like'}
            </Text>
          </Pressable>
        </View>

        {liked && (
          <Text style={styles.likedMessage}>
            You liked {name}!
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
  width: 280,
  minHeight: 450,
  backgroundColor: '#FFFFFF',
  borderRadius: 22,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#F3DDE2',
  marginRight: 16,
},
  photo: {
    width: '100%',
    height: 235,
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineDot: {
    backgroundColor: '#35B66A',
  },
  offlineDot: {
    backgroundColor: '#999999',
  },
  statusText: {
    fontSize: 12,
    color: '#444444',
  },
  cardContent: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#292929',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 14,
  },
  viewProfileButton: {
    alignItems: 'center',
    backgroundColor: '#FCE8EC',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  viewProfileText: {
    color: '#E85D75',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  skipButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E85D75',
    borderRadius: 12,
  },
  skipButtonText: {
    color: '#E85D75',
    fontWeight: '600',
  },
  likeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#E85D75',
    borderRadius: 12,
  },
  likedButton: {
    backgroundColor: '#C94460',
  },
  likeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  likedMessage: {
    color: '#E85D75',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12,
  },
  skippedCard: {
    width: 280,
    minHeight: 150,
    marginRight: 16,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F3DDE2',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  skippedText: {
    color: '#555555',
    fontSize: 16,
    marginBottom: 14,
  },
  restoreButton: {
    backgroundColor: '#FCE8EC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  restoreButtonText: {
    color: '#E85D75',
    fontWeight: 'bold',
  },
});
