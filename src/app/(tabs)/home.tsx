import { DateMateCard } from '@/components/imports/DateMateCard';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen() {
  return (
  <SafeAreaView style={{flex: 1}}>
  <View style={styles.background}> 
    <Text style={styles.title}>Home</Text>
    <View style={styles.container}>
      
      <ScrollView horizontal={true}>
      <DateMateCard
      photo={require('../../components/images/profile.png')}
      name="Juan"
      age="25"
      status="Online"
      message="h3110 p0,<3"
      />

      <DateMateCard
      photo={require('../../components/images/profile.png')}
      name="Pedro"
      age="26"
      status="Online"
      message="wassup mga mananap"
      />

      <DateMateCard
      photo={require('../../components/images/profile.png')}
      name="Maria"
      age="23"
      status="Online"
      message="Hi Pu"
      />
      </ScrollView> 
     
    </View>
  </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  background: {
    flex: 1,
    alignItems: 'center',
  },

  container: {
    backgroundColor: 'grey',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});