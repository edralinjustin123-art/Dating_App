import React from 'react';
import { StyleSheet, Text, View, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

export default function SwipeCard({ profile, onSwipeLeft, onSwipeRight, isFirst }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = x.value;
      context.startY = y.value;
    },
    onActive: (event, context) => {
      x.value = context.startX + event.translationX;
      y.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.translationX > 0) {
          x.value = withSpring(width * 1.5);
          runOnJS(onSwipeRight)(profile);
        } else {
          x.value = withSpring(-width * 1.5);
          runOnJS(onSwipeLeft)(profile);
        }
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      x.value,
      [-width / 2, 0, width / 2],
      [-10, 0, 10],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, width / 4], [0, 1], Extrapolate.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-width / 4, 0], [1, 0], Extrapolate.CLAMP),
  }));

  if (!isFirst) {
    return (
      <View style={[styles.card, styles.secondaryCard]}>
        <Image source={require('../images/profile.png')} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
          <Text style={styles.location}><Ionicons name="location" size={14} /> {profile.location}</Text>
        </View>
      </View>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={require('../images/profile.png')} style={styles.image} />
        
        <Animated.View style={[styles.badge, styles.likeBadge, likeOpacity]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>
        
        <Animated.View style={[styles.badge, styles.nopeBadge, nopeOpacity]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}, {profile.age}</Text>
            <View style={styles.activeDot} />
          </View>
          <Text style={styles.location}><Ionicons name="location" size={14} /> {profile.location}</Text>
          <Text style={styles.bio} numberOfLines={2}>{profile.description}</Text>
          
          <View style={styles.interestsRow}>
            {profile.interests.slice(0, 3).map((interest, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width - 40,
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    overflow: 'hidden',
  },
  secondaryCard: {
    zIndex: -1,
    transform: [{ scale: 0.95 }, { translateY: 10 }],
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  bio: {
    fontSize: 15,
    color: Colors.white,
    marginTop: 8,
    lineHeight: 20,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  interestText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: 40,
    borderWidth: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 100,
  },
  likeBadge: {
    left: 40,
    borderColor: Colors.success,
    transform: [{ rotate: '-15deg' }],
  },
  nopeBadge: {
    right: 40,
    borderColor: Colors.error,
    transform: [{ rotate: '15deg' }],
  },
  likeText: {
    color: Colors.success,
    fontSize: 32,
    fontWeight: '900',
  },
  nopeText: {
    color: Colors.error,
    fontSize: 32,
    fontWeight: '900',
  },
});
