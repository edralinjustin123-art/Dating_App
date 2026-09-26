import { View, Text, StyleSheet } from 'react-native';

export default function Profile() {
  return (
  <View style={styles.mainContainer}>
      <Text style={styles.title}>Welcome Back!</Text>
    <View style={styles.profileContainer}>

      <View style={styles.photo}>
        <Text>PHOTO</Text>
      </View>

      <View style={styles.info}>

        <Text style={styles.name}>Justin</Text>
          <View style={styles.status}>
            <View style={styles.statusCircle}></View>
            <Text style={styles.statusText}>Online</Text>
          </View>
        
      </View>

      
    </View>
  </View>
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
    backgroundColor: 'blue',
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

})