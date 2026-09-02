import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";

export default function App() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setRegistered(true);
  };

  if (registered) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>💕 DateMate</Text>
        <Text style={styles.subtitle}>Welcome!</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>

          <View style={styles.row}>
            <View style={styles.details}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.info}>{name}</Text>
            </View>

            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

 
          <Text style={styles.label}>Age</Text>
          <Text style={styles.info}>{age}</Text>


          <Text style={styles.label}>Gender</Text>
          <Text style={styles.info}>{gender}</Text>


          <View style={styles.row}>
            <View style={styles.details}>
              <Text style={styles.label}>Password</Text>
              <Text style={styles.info}>••••••••</Text>
            </View>

            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>


        <TouchableOpacity style={styles.dateButton}>
          <Text style={styles.dateButtonText}>Find Your Date</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>💕 DateMate</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 25,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#f8f8f8",
    padding: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  details: {
    flex: 1,
  },

  label: {
    fontSize: 14,
    color: "gray",
    marginTop: 10,
  },

  info: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 3,
  },

  editButton: {
    backgroundColor: "#ddd",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },

  editText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 13,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#ff4f81",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  dateButton: {
    backgroundColor: "#ff4f81",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  dateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});



/*
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function App() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
  
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    console.log("===== REGISTERED USER =====");
    console.log("Name:", name);
    console.log("Age:", age);
    console.log("Gender:", gender);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);
    console.log("===========================");

    Alert.alert("Success", "Registration successful!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💕 DateMate</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 25,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
    marginBottom: 30,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#ff4f81",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

*/