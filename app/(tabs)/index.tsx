
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [name, setName] = useState("User");
  const [age, setAge] = useState("20");
  const [gender, setGender] = useState("Not set");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [editingAge, setEditingAge] = useState(false);
  const [showGenderOptions, setShowGenderOptions] = useState(false);

  const editProfilePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Error", "Unable to open your photos.");
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>≡ƒÆò DateMate</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>

          {/* Profile Picture */}
          <View style={styles.photoContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>≡ƒæñ</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.photoButton}
              onPress={editProfilePhoto}
            >
              <Text style={styles.photoButtonText}>Edit Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={styles.label}>Name</Text>

          <View style={styles.row}>
            {editingName ? (
              <TextInput
                style={styles.editInput}
                value={name}
                onChangeText={setName}
                autoFocus
                placeholder="Enter your name"
                placeholderTextColor="#999999"
              />
            ) : (
              <Text style={styles.textValue}>{name}</Text>
            )}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditingName(!editingName)}
            >
              <Text style={styles.editText}>
                {editingName ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Age */}
          <Text style={styles.label}>Age</Text>

          <View style={styles.row}>
            {editingAge ? (
              <TextInput
                style={styles.editInput}
                value={age}
                onChangeText={(text) =>
                  setAge(text.replace(/[^0-9]/g, ""))
                }
                keyboardType="number-pad"
                maxLength={2}
                placeholder="Enter age"
                placeholderTextColor="#999999"
              />
            ) : (
              <Text style={styles.textValue}>{age}</Text>
            )}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditingAge(!editingAge)}
            >
              <Text style={styles.editText}>
                {editingAge ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Gender */}
          <Text style={styles.label}>Gender</Text>

          <View style={styles.row}>
            <Text style={styles.textValue}>{gender}</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowGenderOptions(true)}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Gender Popup */}
          <Modal
            visible={showGenderOptions}
            transparent
            animationType="fade"
            onRequestClose={() => setShowGenderOptions(false)}
          >
            <View style={styles.popupOverlay}>
              <View style={styles.popup}>
                <Text style={styles.popupTitle}>Select Gender</Text>

                <TouchableOpacity
                  style={[
                    styles.popupOption,
                    styles.maleOption,
                    gender === "Male" && styles.maleOptionSelected,
                  ]}
                  onPress={() => {
                    setGender("Male");
                    setShowGenderOptions(false);
                  }}
                >
                  <Text
                    style={[
                      styles.maleText,
                      gender === "Male" && styles.selectedGenderText,
                    ]}
                  >
                    ΓÖé Male
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.popupOption,
                    styles.femaleOption,
                    gender === "Female" && styles.femaleOptionSelected,
                  ]}
                  onPress={() => {
                    setGender("Female");
                    setShowGenderOptions(false);
                  }}
                >
                  <Text
                    style={[
                      styles.femaleText,
                      gender === "Female" && styles.selectedGenderText,
                    ]}
                  >
                    ΓÖÇ Female
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.popupCancel}
                  onPress={() => setShowGenderOptions(false)}
                >
                  <Text style={styles.popupCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Password */}
          <Text style={styles.label}>Password</Text>

          <View style={styles.row}>
            <Text style={styles.textValue}>ΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇóΓÇó</Text>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                Alert.alert(
                  "Password",
                  "Password changing is not available yet."
                )
              }
            >
              <Text style={styles.editText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#292929",
    textAlign: "center",
    marginTop: 100,
    marginBottom: 15,
    alignSelf: "center",
  },

  card: {
    padding: 25,
    borderRadius: 15,
  },

  cardTitle: {
    fontSize: 22,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 15,
    color: "#292929",
  },

  photoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },

  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DDDDDD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  placeholderText: {
    fontSize: 55,
  },

  photoButton: {
    backgroundColor: "#FCE8EC",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  photoButtonText: {
    color: "#E85D75",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },

  label: {
    fontSize: 14,
    color: "#666666",
    marginTop: 10,
    marginBottom: 3,
    fontFamily: "Poppins_400Regular",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
  },

  textValue: {
    flex: 1,
    fontSize: 18,
    color: "#292929",
    paddingVertical: 5,
    fontFamily: "Poppins_400Regular",
  },

  editInput: {
    flex: 1,
    fontSize: 18,
    color: "#292929",
    borderBottomWidth: 1,
    borderBottomColor: "#AAAAAA",
    paddingVertical: 5,
    fontFamily: "Poppins_400Regular",
  },

  editButton: {
    backgroundColor: "#FCE8EC",
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 8,
    marginLeft: 8,
  },

  editText: {
    color: "#E85D75",
    fontFamily: "Poppins_500Medium",
  },

  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  popup: {
    width: 250,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },

  popupTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#292929",
    marginBottom: 15,
  },

  popupOption: {
    width: "100%",
    paddingVertical: 12,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },

  maleOption: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },

  maleOptionSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },

  maleText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#1565C0",
  },

  femaleOption: {
    backgroundColor: "#FCE4EC",
    borderColor: "#E91E63",
  },

  femaleOptionSelected: {
    backgroundColor: "#E91E63",
    borderColor: "#E91E63",
  },

  femaleText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#C2185B",
  },

  selectedGenderText: {
    color: "#FFFFFF",
  },

  popupCancel: {
    marginTop: 10,
    padding: 8,
  },

  popupCancelText: {
    color: "#570606",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },

  logoutButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -10,
  },

  logoutButtonText: {
    color: "#E85D75",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
});
