import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    
    <Tabs 
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="mate"
        options={{
          title: 'Mate',
        }}
      />

      <Tabs.Screen
        name="msg_req"
        options={{
          title: 'Message Requests',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}