import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


export function InputChat () {
    return (
        <View style={styles.Cont}>
            <TouchableOpacity >
                <Text style={styles.streak}>🔥</Text>
            </TouchableOpacity>
            <TextInput style={styles.InputtxtChat} placeholder='Message'/>
            <TouchableOpacity >
                <Text style={styles.emoji}>👍</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create ({
    Cont: {
        width: '100%',
        height: '10%',
        flexDirection: 'row',
    },

    streak: {
       width: '10%',
        height: '100%',
    },

    emoji: {
        width: '10%',
        height: '100%',

    },

    InputtxtChat: {
        height: '100%',
        width: '80%',
        borderRadius: 40,
        backgroundColor: 'grey',
        fontSize: 20,
        
        paddingLeft: 20,    
    },
})