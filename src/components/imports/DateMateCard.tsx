
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type DateMateCardProps = {
  photo: any;
  name: string;
  age: string;
  gender: string;
  status: string;
  isOnline: boolean;
  isLiked: boolean;
  onToggleLike: () => void;
  onSkip: () => void;
  onViewProfile: () => void;
  onMessage: () => void;
};

export default function DateMateCard({
  photo,
  name,
  age,
  gender,
  status,
  isOnline,
  isLiked,
  onToggleLike,
  onSkip,
  onViewProfile,
  onMessage,
}: DateMateCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={photo} style={styles.image} />

        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              isOnline && styles.onlineDot,
            ]}
          />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>
          {name}, {age}
        </Text>

        <Text style={styles.gender}>{gender}</Text>

        {isLiked && (
          <Text style={styles.likedText}>
            You liked {name}! 💗
          </Text>
        )}

        {isLiked && (
          <>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={onViewProfile}
            >
              <Text style={styles.viewButtonText}>
                View Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageButton}
              onPress={onMessage}
            >
              <Text style={styles.messageButtonText}>
                Message
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.likeButton,
              isLiked && styles.unlikeButton,
            ]}
            onPress={onToggleLike}
          >
            <Text style={styles.likeButtonText}>
              {isLiked ? 'Unlike' : 'Like'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: '#FFF8FA',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 235,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#A0A0A0',
    marginRight: 6,
  },
  onlineDot: {
    backgroundColor: '#2EAD72',
  },
  statusText: {
    fontSize: 11,
    color: '#777777',
    fontWeight: '500',
  },
  details: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#252525',
  },
  gender: {
    fontSize: 13,
    color: '#777777',
    marginTop: 5,
    marginBottom: 12,
  },
  likedText: {
    fontSize: 13,
    color: '#E85D75',
    fontWeight: '600',
    marginBottom: 12,
  },
  viewButton: {
    backgroundColor: '#E85D75',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: '#FCE8EC',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  messageButtonText: {
    color: '#E85D75',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#EEEEEE',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '600',
  },
  likeButton: {
    flex: 1,
    backgroundColor: '#E85D75',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  unlikeButton: {
    backgroundColor: '#777777',
  },
  likeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
