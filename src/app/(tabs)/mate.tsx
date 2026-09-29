import { InputChat } from '@/components/imports/InputChat';
import { MiniProfileChat } from '@/components/imports/MiniProfileChat';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function MatchScreen() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.background}>
        <View style={styles.container}>

          <MiniProfileChat 
          image={require('../../components/images/profile.png')}
          name="juan"
          note="namimiss ka"
          isOnline={true}
          />

          <View style={styles.mainChat}>
          </View>

          <InputChat />


        </View>
      
      </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  

  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  mainChat: {
    width: '100%',
    height: '70%',
    backgroundColor: 'grey',
  }
});