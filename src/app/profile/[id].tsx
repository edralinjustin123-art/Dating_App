
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { profiles } from '../../data/profiles';

const profilePhoto = require('../../components/images/profile.png');

export default function ProfileDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [liked, setLiked] = useState(false);

  const profile = profiles.find((person) => person.id === id);

  const profileIndex = profiles.findIndex(
    (person) => person.id === id
  );

  const isOnline = profileIndex % 2 === 0;

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Ionicons
            name="person-outline"
            size={60}
            color="#E85D75"
          />

          <Text style={styles.title}>Profile not found</Text>

          <Text style={styles.description}>
            Sorry, we couldn't find this profile.
          </Text>

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.page}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#292929"
            />
          </Pressable>

          <Text style={styles.headerTitle}>Profile</Text>

          <Pressable
            style={styles.iconButton}
            onPress={() => setLiked(!liked)}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={25}
              color="#E85D75"
            />
          </Pressable>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          <Image
            source={profilePhoto}
            style={styles.profileImage}
          />

          <View style={styles.onlineBadge}>
            <View
              style={[
                styles.statusDot,
                isOnline ? styles.onlineDot : styles.offlineDot,
              ]}
            />

            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {profile.name}
          </Text>

          <Text style={styles.ageText}>
            {profile.age} years old
          </Text>
        </View>

        {/* About Me */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>

          <Text style={styles.description}>
            {profile.description}
          </Text>
        </View>

        {/* Like Button */}
        <Pressable
          style={[
            styles.likeButton,
            liked && styles.likedButton,
          ]}
          onPress={() => setLiked(!liked)}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={21}
            color="#E85D75"
          />

          <Text style={styles.likeButtonText}>
            {liked ? 'Liked' : 'Like'}
          </Text>
        </Pressable>

        {/* Send Message */}
        <Pressable
          style={styles.messageButton}
          onPress={() => router.push('/(tabs)/mate')}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.messageButtonText}>
            Send Message
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          Your next connection could be just one tap away 💗
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  page: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 18,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#292929',
  },

  photoContainer: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FCE8EC',
    position: 'relative',
  },

  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  onlineBadge: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 7,
  },

  onlineDot: {
    backgroundColor: '#35B66A',
  },

  offlineDot: {
    backgroundColor: '#999999',
  },

  statusText: {
    fontSize: 13,
    color: '#444444',
  },

  profileInfo: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 26,
  },

  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#292929',
    textAlign: 'center',
  },

  ageText: {
    fontSize: 15,
    color: '#888888',
    marginTop: 5,
  },

  section: {
    backgroundColor: '#FFF8FA',
    borderWidth: 1,
    borderColor: '#F3DDE2',
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#292929',
    marginBottom: 10,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#666666',
  },

  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E85D75',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },

  likedButton: {
    backgroundColor: '#FFF0F3',
  },

  likeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E85D75',
  },

  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#E85D75',
  },

  messageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  footer: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    marginTop: 24,
    paddingHorizontal: 10,
  },

  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#292929',
    marginTop: 16,
    marginBottom: 8,
  },

  backButton: {
    backgroundColor: '#FCE8EC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
  },

  backButtonText: {
    color: '#E85D75',
    fontSize: 16,
    fontWeight: '600',
  },
});
