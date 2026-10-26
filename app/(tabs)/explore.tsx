
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import DateMateCard from '../../components/imports/DateMateCard';
import { profiles } from '../../data/profiles';

const profilePhoto = require('../../components/images/profile.png');

  

export default function HomeScreen() {

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <ScrollView
    style={styles.page}
    contentContainerStyle={[
      styles.container,
      isDesktop && styles.desktopContainer,
    ]}
    showsVerticalScrollIndicator={isDesktop}
  >
      <View style={styles.header}>
        <Text style={styles.logo}>
          Date<Text style={styles.logoAccent}>Mate</Text>
        </Text>

        <Text style={styles.subtitle}>
          Find someone who makes every day special.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discover People</Text>
        <Text style={styles.sectionSubtitle}>
          Meet people who share your interests
        </Text>
      </View>

      <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={[
    styles.profilesList,
    isDesktop && styles.desktopProfilesList,
  ]}
>
        {profiles.map((profile, index) => (
          <DateMateCard
            key={profile.id}
            profileId={profile.id}
            photo={profilePhoto}
            name={profile.name}
            age={String(profile.age)}
            status={index % 2 === 0 ? 'Online' : 'Offline'}
          />
        ))}
      </ScrollView>

      <Text style={styles.footer}>
        Your next connection could be just one tap away ≡ƒÆù
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
  flex: 1,
  backgroundColor: '#FFFFFF',
},

  container: {
  flexGrow: 1,
  backgroundColor: '#FFFFFF',
  paddingTop: 30,
  paddingBottom: 24,
},
  header: {
    paddingHorizontal: 22,
    marginBottom: 28,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#292929',
  },
  logoAccent: {
    color: '#E85D75',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 6,
  },
  sectionHeader: {
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#292929',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 5,
  },
  profilesList: {
    paddingLeft: 22,
    paddingRight: 22,
    paddingBottom: 24,
  },
  footer: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 20,
  },

desktopContainer: {
  paddingTop: 30,
  paddingBottom: 30,
},

desktopProfilesList: {
  paddingBottom: 24,
  },
});
