import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@theme/ThemeProvider';
import HeaderLogo from '@components/header/Logo';
import HeaderTitle from '@components/header/Title';
import HeaderThemeSwitch from '@components/header/ThemeSwitch';

import Images from '@assets/images.svg'
import Heart from '@assets/heart_fill.svg'
import Plus from '@assets/plus.svg'

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
        tabBarButton: HapticTab,
        headerStyle: { backgroundColor: theme.colors.card, justifyContent: 'flex-start' },
        headerLeft: () => <HeaderLogo />,
        headerTitle: () => <HeaderTitle />,
        headerRight: () => <HeaderThemeSwitch />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Photos',
          tabBarIcon: ({ color }) => <Images width={24} height={24} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color }) => <Plus width={24} height={24} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="likedPhotos"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <Heart width={24} height={24} fill={color} />,
        }}
      />
    </Tabs>
  );
}
