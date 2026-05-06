import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderTopColor: '#1f1f1f',
          borderTopWidth: 1.5,
          paddingTop: 8,
          paddingBottom: 12,
          height: 70,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#ffffff',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
        tabBarActiveBackgroundColor: 'transparent',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🔊' : '🔈'}</Text>
          ),
          tabBarItemStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'FAVOURITES',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '⭐' : '☆'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '⚙️' : '⚙️'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}