import {View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native';

export default function SignupScreen () {
  return (
    <View style={styles.mainCont}>
      <Text style={styles.title}>Create Account</Text>
      
      <Text style={styles.Description}>First Name</Text>
      <TextInput style={styles.Input} placeholder='Enter First Name'></TextInput>

      <Text style={styles.Description}>First Name</Text>
      <TextInput style={styles.Input} placeholder='Enter Last Name'></TextInput>

      <Text style={styles.Description}>Age</Text>
      <TextInput style={styles.Input} placeholder='Enter Age'></TextInput>

      <Text style={styles.Description}>First Name</Text>
      <TextInput style={styles.Input} placeholder='Enter Username'></TextInput>

      <TouchableOpacity style={styles.regBtn}>
        <Text style={styles.regText}>Register</Text>
      </TouchableOpacity>
    </View>

  );
}

const styles = StyleSheet.create ({
  mainCont: {
    flex: 1,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  Description: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  Input: {
    width: 200,
    height: 50,
    backgroundColor: 'grey',
    borderRadius: 100,
  },

  regBtn: {
    backgroundColor: 'blue',
    width: 150,
    height: 50,
    borderRadius: 100,
  },

  regText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },




})
