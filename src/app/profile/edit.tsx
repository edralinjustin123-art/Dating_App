
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../../context/ProfileContext';

export default function EditProfile() {
  const router = useRouter();
  const { profile, setProfile } = useProfile();

  // Start with the current user's information.
  // Empty strings are used if nobody is logged in.
  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState(profile?.age ?? '');
  const [gender, setGender] = useState(profile?.gender ?? '');
  const [relationshipStatus, setRelationshipStatus] = useState(
    profile?.relationshipStatus ?? 'Single'
  );
  const [aboutMe, setAboutMe] = useState(profile?.aboutMe ?? '');
  const [favorites, setFavorites] = useState(profile?.favorites ?? '');
  const [hobbies, setHobbies] = useState(profile?.hobbies ?? '');
  const [birthdate, setBirthdate] = useState(profile?.birthdate ?? '');

  // Prevent editing when nobody is logged in.
  if (!profile) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter your display name.');
      return;
    }

    if (age.trim() && !/^\d+$/.test(age.trim())) {
      Alert.alert('Invalid age', 'Please enter numbers only for age.');
      return;
    }

    setProfile({
      name: name.trim(),
      age: age.trim(),
      gender: gender.trim(),
      relationshipStatus,
      aboutMe: aboutMe.trim(),
      favorites: favorites.trim(),
      hobbies: hobbies.trim(),
      birthdate: birthdate.trim(),
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back to Profile</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>
          Update your information and tell people more about yourself.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            maxLength={30}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={(value) =>
              setAge(value.replace(/[^0-9]/g, ''))
            }
            placeholder="Enter your age"
            keyboardType="number-pad"
            maxLength={3}
          />

          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            value={gender}
            onChangeText={setGender}
            placeholder="Enter your gender"
            maxLength={30}
          />

          <Text style={styles.label}>Relationship Status</Text>
          <View style={styles.statusOptions}>
            {['Single', 'On a Date'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  relationshipStatus === status &&
                    styles.selectedStatusOption,
                ]}
                onPress={() => setRelationshipStatus(status)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    relationshipStatus === status &&
                      styles.selectedStatusText,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>About Me</Text>

          <Text style={styles.label}>Personal Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={aboutMe}
            onChangeText={setAboutMe}
            placeholder="Write something about yourself..."
            multiline
            textAlignVertical="top"
            maxLength={300}
          />
          <Text style={styles.counter}>{aboutMe.length}/300</Text>

          <Text style={styles.label}>Favorites</Text>
          <TextInput
            style={styles.input}
            value={favorites}
            onChangeText={setFavorites}
            placeholder="Example: Music, movies, coffee"
            maxLength={150}
          />

          <Text style={styles.label}>Hobbies</Text>
          <TextInput
            style={styles.input}
            value={hobbies}
            onChangeText={setHobbies}
            placeholder="What do you enjoy doing?"
            maxLength={150}
          />

          <Text style={styles.label}>Birthdate</Text>
          <TextInput
            style={styles.input}
            value={birthdate}
            onChangeText={setBirthdate}
            placeholder="Example: January 15, 2005"
            maxLength={40}
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 20,
    paddingBottom: 35,
  },
  backText: {
    color: '#E85D75',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#252525',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 22,
  },
  formCard: {
    backgroundColor: '#FFF8FA',
    borderWidth: 1,
    borderColor: '#F5E7EB',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#252525',
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E1E3',
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#252525',
    marginBottom: 17,
  },
  multilineInput: {
    minHeight: 110,
    paddingTop: 13,
  },
  counter: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'right',
    marginTop: -12,
    marginBottom: 17,
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 5,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E1E3',
    backgroundColor: '#FFFFFF',
  },
  selectedStatusOption: {
    backgroundColor: '#FCE9ED',
    borderColor: '#E85D75',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#555555',
    fontWeight: '600',
  },
  selectedStatusText: {
    color: '#D94763',
  },
  saveButton: {
    minHeight: 52,
    backgroundColor: '#E85D75',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#777777',
    fontSize: 14,
    fontWeight: '600',
  },
});
