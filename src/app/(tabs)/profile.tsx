import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';



export default function Profile() {

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('justin');

  const [age, setAge] = useState('');
  const [displayAge, setDisplayAge] = useState('21');

  const changeProfilePress = () => {
    setDisplayName(name);
    setDisplayAge(age);
  };

  const [isOnline, setisOnline] = useState(true);

  return (
  <SafeAreaView style={{flex: 1}}>
  <View style={styles.mainContainer}>
      <Text style={styles.title}>Welcome Back!</Text>
    <View style={styles.profileContainer}>

      <Image style={styles.photo} 
      source={require('../../components/images/profile.png')}/>

      <View style={styles.info}>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.age}>{displayAge} yrs old</Text>
          <View style={styles.status}>
            <View style={[styles.statusCircle, {backgroundColor: isOnline ? 'green' : 'red',}]}></View>
            <Text style={styles.statusText}>{isOnline}</Text>
          </View>

      </View>

      
      
    </View>
      <View style={styles.changeNameCont}>
        <Text style={styles.changeNameTitle}>Edit Profile</Text>
        <Text style={styles.editinfotitle}>Name</Text>
        <TextInput style={styles.input} placeholder='Enter Name' value={name} onChangeText={setName}/>
        <Text style={styles.editinfotitle}>Age</Text>
        <TextInput style={styles.input} placeholder='Enter Age' value={age} onChangeText={setAge}/>
        <TouchableOpacity style={styles.editNameBtn} onPress ={changeProfilePress}>
          <Text style={styles.editNameTxt}>Change Name</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.statusBtnOff} 
                        onPress={ () => {setisOnline(!isOnline);
                        }}>
        <Text>Go Offline/Online</Text>
      </TouchableOpacity>

     
  </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create ({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
    
  },

  title: {
    fontWeight: 'bold',
    fontSize: 30,
    
    
  },

  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,

  },

  photo: {
    backgroundColor: 'grey',
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,

  },

  info: {
    margin: 10,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  age: {
    fontSize: 16,
  },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  statusCircle: {
    height: 10,
    width: 10,
    marginRight: 10,
    backgroundColor: 'green',
    borderRadius: 20,
  },

  statusText: {
    fontSize: 15,
  },

  changeNameCont: {
    backgroundColor: 'grey',
    borderRadius: 20,
    alignItems: 'center',
    padding: 10,
  },

  changeNameTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    
  },

  editinfotitle: {
    fontSize: 16,
    alignSelf: 'flex-start',
    marginLeft: 30,
    fontWeight: 'bold'
  },

  input: {
    height: 50,
    width: 300,
    borderRadius: 50,
    backgroundColor: 'white',
    paddingLeft: 10,
    margin: 5,
  },

  editNameBtn: {
    backgroundColor: 'blue',
    width: 250,
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },

  editNameTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  statusBtnOn: {
    backgroundColor: 'green',
    width: 100,
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },

  statusBtnOff: {
    backgroundColor: 'red',
    width: 100,
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },

})