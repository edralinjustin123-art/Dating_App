import AsyncStorage from '@react-native-async-storage/async-storage';

interface Credentials {
  email: string;
  password: string;
  remember: boolean;
}

export const saveCredentials = async (email: string, _password: string, remember: boolean) => {
  try {
    if (remember) {
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('rememberMe', 'true');
    } else {
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userPassword');
      await AsyncStorage.setItem('rememberMe', 'false');
    }
  } catch (error) {
    console.log('Error saving credentials:', error);
  }
};

export const loadCredentials = async (): Promise<Credentials> => {
  try {
    const email = await AsyncStorage.getItem('userEmail');
    const remember = await AsyncStorage.getItem('rememberMe');
    return { 
      email: email || '', 
      password: '',
      remember: remember === 'true' 
    };
  } catch (error) {
    console.log('Error loading credentials:', error);
    return { email: '', password: '', remember: false };
  }
};

export const clearCredentials = async () => {
  try {
    await AsyncStorage.removeItem('userEmail');
    await AsyncStorage.removeItem('userPassword');
    await AsyncStorage.setItem('rememberMe', 'false');
  } catch (error) {
    console.log('Error clearing credentials:', error);
  }
};
