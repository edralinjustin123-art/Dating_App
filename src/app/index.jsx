import { Redirect } from 'expo-router';
import { hasActiveSession } from '../lib/api';

export default function Index() {
  return <Redirect href={hasActiveSession() ? '/(tabs)/home' : '/(auth)/login'} />;
}
