
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type DateMateCardProps = {
  profileId: string;
  photo: any;
  name: string;
  age: string;
  status: string;
};

const reportReasons = [
  'Fake or spam profile',
  'Inappropriate content',
  'Harassment',
  'Other',
];

export default function DateMateCard({
  profileId,
  photo,
  name,
  age,
  status,
}: DateMateCardProps) {
  const [liked, setLiked] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const submitReport = () => {
    if (!selectedReason) {
      Alert.alert(
        'Select a reason',
        'Please select a reason for reporting this profile.'
      );
      return;
    }

    // Demo only: this does not send or save a report.
    setReportVisible(false);
    setSelectedReason('');

    Alert.alert(
      'Report Submitted',
      `Your report about ${name} has been recorded for this demo.`
    );
  };

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
          <Text style={styles.restoreButtonText}>
            Restore Profile
          </Text>
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

        <Pressable
          style={styles.viewProfileButton}
          onPress={() =>
            router.push({
              pathname: '/profile/[id]',
              params: { id: profileId },
            })
          }
        >
          <Text style={styles.viewProfileText}>
            View Profile
          </Text>
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

        <Pressable
          style={styles.reportButton}
          onPress={() => setReportVisible(true)}
        >
          <Text style={styles.reportButtonText}>
            ⚑ Report Profile
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={reportVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Report {name}
            </Text>

            <Text style={styles.modalDescription}>
              Why are you reporting this profile?
            </Text>

            {reportReasons.map((reason) => (
              <Pressable
                key={reason}
                style={styles.reasonOption}
                onPress={() => setSelectedReason(reason)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    selectedReason === reason &&
                      styles.radioSelected,
                  ]}
                >
                  {selectedReason === reason && (
                    <View style={styles.radioInner} />
                  )}
                </View>

                <Text style={styles.reasonText}>
                  {reason}
                </Text>
              </Pressable>
            ))}

            <Pressable
              style={styles.submitButton}
              onPress={submitReport}
            >
              <Text style={styles.submitButtonText}>
                Submit Report
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setReportVisible(false);
                setSelectedReason('');
              }}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
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
    marginBottom: 10,
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

  reportButton: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 12,
    marginTop: 12,
  },

  reportButtonText: {
    color: '#777777',
    fontWeight: '600',
    fontSize: 14,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#292929',
    marginBottom: 8,
  },

  modalDescription: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 16,
  },

  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BBBBBB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  radioSelected: {
    borderColor: '#E85D75',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E85D75',
  },

  reasonText: {
    fontSize: 15,
    color: '#444444',
  },

  submitButton: {
    backgroundColor: '#E85D75',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 18,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },

  cancelButtonText: {
    color: '#777777',
    fontWeight: '600',
  },
});
