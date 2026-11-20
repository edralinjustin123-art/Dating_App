
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import ProfileInfoRow from './ProfileInfoRow';

type ProfileDetailsProps = {
  profile: {
    name: string;
    age: string | number;
    gender: string;
    relationshipStatus: string;
    aboutMe: string;
    favorites: string;
    hobbies: string;
    birthdate: string;
  };
  isOnline?: boolean;
  onToggleOnline?: () => void;
};

export default function ProfileDetails({
  profile,
  isOnline = true,
  onToggleOnline,
}: ProfileDetailsProps) {
  return (
    <>
      <View style={styles.profileCard}>
        <Image
          source={require('../images/profile.png')}
          style={styles.photo}
        />

        <View style={styles.profileDetails}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.age}>{profile.age} years old</Text>
          <Text style={styles.detailText}>{profile.gender}</Text>
          <Text style={styles.detailText}>
            {profile.relationshipStatus}
          </Text>

          <View style={styles.onlineRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isOnline ? '#2EAD72' : '#A0A0A0',
                },
              ]}
            />
            <Text style={styles.onlineText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          {onToggleOnline && (
            <TouchableOpacity
              style={styles.statusButton}
              onPress={onToggleOnline}
              activeOpacity={0.8}
            >
              <Text style={styles.statusButtonText}>
                {isOnline ? 'Go Offline' : 'Go Online'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.aboutText}>
          {profile.aboutMe || 'Tell people a little about yourself.'}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <ProfileInfoRow
          label="Favorites"
          value={profile.favorites}
        />
        <ProfileInfoRow
          label="Hobbies"
          value={profile.hobbies}
        />
        <ProfileInfoRow
          label="Birthdate"
          value={profile.birthdate}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F0E5E8',
    padding: 16,
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  photo: {
    width: 105,
    height: 105,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#F9DCE3',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#252525',
  },
  age: {
    fontSize: 14,
    color: '#777777',
    marginTop: 3,
  },
  detailText: {
    fontSize: 13,
    color: '#555555',
    marginTop: 5,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },
  onlineText: {
    fontSize: 13,
    color: '#555555',
    fontWeight: '600',
  },
  statusButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCE9ED',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: 10,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionCard: {
    backgroundColor: '#FFF8FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5E7EB',
    padding: 18,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 22,
  },
});
