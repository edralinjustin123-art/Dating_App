
import { Image, StyleSheet, Text, View } from 'react-native';

type MiniProfileChatProps = {
  image: any;
  name: string;
  note: string;
  isOnline: boolean;
};

export function MiniProfileChat(props: MiniProfileChatProps) {
  return (
    <View style={styles.container}>
      <View style={styles.profileCont}>
        <Image
          style={styles.profilePic}
          source={props.image}
          resizeMode="cover"
        />

        <View
          style={[
            styles.isOnline,
            {
              backgroundColor: props.isOnline
                ? '#2DBE75'
                : '#AAAAAA',
            },
          ]}
        />
      </View>

      <View style={styles.nameCont}>
        <Text style={styles.name} numberOfLines={1}>
          {props.name}
        </Text>

        <Text style={styles.note} numberOfLines={1}>
          {props.isOnline ? 'Online now' : props.note}
        </Text>
      </View>

      <View style={styles.headerIcon}>
        <Text style={styles.iconText}>⋯</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  profileCont: {
    width: 48,
    height: 48,
    position: 'relative',
    marginRight: 12,
  },

  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#F8E8EC',
  },

  isOnline: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  nameCont: {
    flex: 1,
    justifyContent: 'center',
  },

  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222222',
  },

  note: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },

  headerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconText: {
    fontSize: 27,
    color: '#666666',
    lineHeight: 30,
  },
});
