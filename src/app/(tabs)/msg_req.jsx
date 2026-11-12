import { Redirect } from 'expo-router';

// Kept as a route for existing links; messages now live with matches.
export default function MessageRequestsRoute() {
  return <Redirect href="/(tabs)/mate" />;
}
