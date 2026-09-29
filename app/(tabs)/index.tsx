import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [name, setName] = useState("User");
  const [age, setAge] = useState("20");
  const [gender, setGender] = useState("Not set");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [editingAge, setEditingAge] = useState(false);

  const editProfilePhoto = async () => {
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
  };

  const editGender = () => {
    Alert.alert("Select Gender", "", [
      {
        text: "Male",
        onPress: () => setGender("Male"),
      },
      {
        text: "Female",
        onPress: () => setGender("Female"),
      },
      {
        text: "Other",
        onPress: () => setGender("Other"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  return (
    <LinearGradient
      colors={["#6A0DAD", "#7B1E4B", "#8B0000"]}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      {/* Title */}
      <Text style={styles.title}>💕 DateMate</Text>

      {/* Profile Card */}
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
              <Text style={styles.placeholderText}>👤</Text>
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
              onChangeText={setAge}
              keyboardType="numeric"
              autoFocus
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
            onPress={editGender}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>

        <View style={styles.row}>
          <Text style={styles.textValue}>••••••••</Text>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Find Your Date */}
      <TouchableOpacity style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Find Your Date</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#fff",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#eee",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
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
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  placeholderText: {
    fontSize: 55,
  },

  photoButton: {
    backgroundColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  photoButtonText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 13,
  },

  label: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
    marginBottom: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
  },

  textValue: {
    flex: 1,
    fontSize: 18,
    color: "#333",
    paddingVertical: 5,
  },

  editInput: {
    flex: 1,
    fontSize: 18,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    paddingVertical: 5,
  },

  editButton: {
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 8,
    marginLeft: 8,
  },

  editText: {
    color: "#333",
    fontWeight: "bold",
  },

  dateButton: {
    backgroundColor: "#ff4f81",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  dateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});