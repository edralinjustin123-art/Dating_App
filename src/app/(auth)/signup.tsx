import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen () {
  return (
  <SafeAreaView style={{flex: 1}}>
  <View style={styles.background}>
    <View style={styles.mainCont}>
      <Text style={styles.title}>Create Account</Text>
      
      <Text style={styles.Description}>First Name</Text>
      <TextInput style={styles.Input} placeholder='Enter First Name' 
      placeholderTextColor="rgba(0, 0, 0, 0.4)">
      </TextInput>

      <Text style={styles.Description}>Last Name</Text>
      <TextInput style={styles.Input} placeholder='Enter Last Name' 
      placeholderTextColor="rgba(0, 0, 0, 0.4)" >
      </TextInput>

      <Text style={styles.Description}>Username</Text>
      <TextInput style={styles.Input} placeholder='Enter Username' 
      placeholderTextColor="rgba(0, 0, 0, 0.4)" >
      </TextInput>

      <Text style={styles.Description}>Age</Text>
      <TextInput style={styles.Input} placeholder='Enter Age' 
      placeholderTextColor="rgba(0, 0, 0, 0.4)" >
      </TextInput>

      <Text style={styles.Description}>Password</Text>
      <TextInput style={styles.Input} placeholder='Enter Password' 
      secureTextEntry={true}
      placeholderTextColor="rgba(0, 0, 0, 0.4)">
      </TextInput>

      <View style={styles.accountHandling}>
        <View style={styles.rememberMeCont}>
          <View style={styles.checkBox}></View>
          <Text style={styles.rememberMe}>Remember Me</Text>
        </View>
        <Text style={styles.forgPass}>Forgot Password</Text>

      </View>

      <TouchableOpacity style={styles.regBtn} onPress={() => router.replace('/(tabs)/home')}>
        <Text style={styles.regText}>Register</Text>
      </TouchableOpacity>
    </View>
  </View>
  </SafeAreaView>

  );
}

const styles = StyleSheet.create ({

  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCont: {
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    height: "80%",
    borderRadius: 20,
    backgroundColor: 'grey'
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  Description: {
    width: '80%',
    fontSize: 16,
    fontWeight: 'bold',
    
    marginBottom: 5,
    marginTop: 10,
   
    
  },

  Input: {
    width: '80%',
    height: '5%',
    backgroundColor: 'white',
    borderRadius: 100,
    
    
    paddingLeft: 15,
  },

  accountHandling: {
    height: '4%',
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },

  rememberMeCont: {
    flexDirection: 'row',
    marginTop: 10,
  },

  checkBox: {
    height: 10,
    width: 10,
    backgroundColor: 'white',
    margin: 5 ,
  },

  rememberMe: {
    textDecorationLine: 'underline',
    
  },

  forgPass: {
    textDecorationLine: 'underline',
    marginTop: 10,
  },


  regBtn: {
    backgroundColor: 'blue',
    width: '80%',
    height: '8%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },

  regText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },




})
