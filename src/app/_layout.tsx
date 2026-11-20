
import { Stack } from 'expo-router';

import { ChatProvider } from '../context/ChatContext';
import { DiscoveryProvider } from '../context/DiscoveryContext';
import { MateProvider } from '../context/MateContext';
import { ProfileProvider } from '../context/ProfileContext';

export default function RootLayout() {
  return (
    <ProfileProvider>
      <ChatProvider>
        <DiscoveryProvider>
          <MateProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </MateProvider>
        </DiscoveryProvider>
      </ChatProvider>
    </ProfileProvider>
  );
}
