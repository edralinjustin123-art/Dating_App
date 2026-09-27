import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


export default function SignupScreen () {
  return (
  <View style={styles.backGround}>
    <View style={styles.mainCont}>
      <Text style={styles.title}>Create Account</Text>
      
      <Text style={styles.Description}>First Name</Text>
      <TextInput style={styles.Input} placeholder='Enter First Name'></TextInput>

      <Text style={styles.Description}>Last Name</Text>
      <TextInput style={styles.Input} placeholder='Enter Last Name'></TextInput>

      <Text style={styles.Description}>Username</Text>
      <TextInput style={styles.Input} placeholder='Enter Username'></TextInput>

      <Text style={styles.Description}>Age</Text>
      <TextInput style={styles.Input} placeholder='Enter Age'></TextInput>

      <Text style={styles.Description}>Password</Text>
      <TextInput style={styles.Input} placeholder='Enter Password' secureTextEntry={true}></TextInput>

      <View style={styles.accountHandling}>
        <View style={styles.rememberMeCont}>
          <View style={styles.checkBox}></View>
          <Text style={styles.rememberMe}>Remember Me</Text>
        </View>
        <Text style={styles.forgPass}>Forgot Password</Text>

      </View>

      <TouchableOpacity style={styles.regBtn} onPress={() => console.log('Registration button pressed!')}>
        <Text style={styles.regText}>Register</Text>
      </TouchableOpacity>
    </View>
  </View>

  );
}

const styles = StyleSheet.create ({

  backGround: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCont: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 650,
    width: 400,
    borderRadius: 50,
    backgroundColor: 'grey'
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  Description: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
    marginLeft: 40,
  },

  Input: {
    width: 340,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginLeft: 30,
    padding: 15,
  },

  accountHandling: {
    height: 30,
    width: 340,
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
    width: 340,
    height: 50,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },

  regText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },




})
