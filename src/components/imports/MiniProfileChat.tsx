import { Image, StyleSheet, Text, View } from 'react-native';

type MiniProfileChatProps = {
    image: any;
    name: string;
    note: string;
    isOnline: boolean;
};

export function MiniProfileChat (props: MiniProfileChatProps) {

    return (

        <View style={styles.container}>
            <View style={styles.profileCont}>
                <Image style={styles.profilePic} source={props.image}/>
                <View style={[styles.isOnline, {backgroundColor: props.isOnline ? 'green' : 'red',}]}> </View>
            </View>

            <View style={styles.nameCont}>
                <Text style={styles.name}>{props.name}</Text>
                <Text style={styles.note}>{props.note}</Text>
            </View>
       
        </View>
   
    );
}

const styles = StyleSheet.create ({


    container: {
        width: '100%',
        height: '15%',
        flexDirection: 'row',
        backgroundColor: 'orange',
        justifyContent: 'flex-start',
        padding: 10,
        alignItems: 'center',

    },

    profileCont: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        width: '25%',
        
    },

    profilePic: {
        height: 100,
        width: 100,
        borderRadius: 50,
    },

    isOnline: {
        position: 'absolute',
        right: 15,
        bottom: 5,
        borderRadius: 10,
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: 'black',
    },

    nameCont: {
       width: '35%' ,
       height: '100%',
       marginLeft: 20,
    },

    name: {
        fontSize: 36,
        fontWeight: 'bold',
    },

    note: {
        fontSize: 21,      
    },

})