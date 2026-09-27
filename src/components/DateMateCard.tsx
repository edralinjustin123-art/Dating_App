import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

 export function DateMateCard(props) {
    return (
      <View style={styles.cardCont}>
        <Image style={styles.profilePic} 
        source={props.photo}/>

        <Text style={styles.name}>{props.name}</Text>
        <Text style={styles.age}>{props.age} yrs old</Text> 

        <View style={styles.statusCont}>
          <View style={styles.statusCircle}></View>
          <Text style={styles.status}>{props.status}</Text>
        </View>

        <Text style={styles.message}>{props.message}</Text>

        <View style={styles.btnCont}>
          <TouchableOpacity style={styles.skipBtn}>
            <Text style={styles.skipBtntxt}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.heartBtn}>
            <Text style={styles.heartBtntxt}>Heart</Text>
          </TouchableOpacity>
          </View>
      </View>
    );
}

const styles = StyleSheet.create({
  cardCont: {
    backgroundColor: 'white',
    width: 200,
    height:  400,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 50,
  },

  profilePic: {
    height: 70,
    width: 70,
  },

  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black'
  },

  age: {
    fontSize: 24,
    color: 'black'
  },

  statusCont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    
  },

  statusCircle: {
    height: 10,
    width: 10,
    backgroundColor: 'green',
    borderRadius: 10,
    margin: 5,
  },

  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black'
  },

  message: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black'
  },

  btnCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 150,
    marginTop: 15,
  },

  skipBtn: {
    height: 50,
    width: 50,
    borderRadius: 20,
    backgroundColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
  },

  skipBtntxt: {
    fontWeight: 'bold',
    color: 'white',
  },

  heartBtn: {
    height: 50,
    width: 50,
    borderRadius: 20,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heartBtntxt: {
    fontWeight: 'bold',
    color: 'white',
  },
})