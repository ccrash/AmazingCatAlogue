import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { useVotesStore } from '@store/useVotesStore';
import { usePhotosStore } from '@store/usePhotosStore';

import { HapticTab } from '@components/haptic-tab';
import { useTheme } from '@theme/ThemeProvider';
import HeaderLogo from '@/components/header/lLogo';
import HeaderTitle from '@components/header/title';
import HeaderThemeSwitch from '@/components/header/themeSwitch';

import Images from '@assets/images.svg'
import Heart from '@assets/heart_fill.svg'
import Plus from '@assets/plus-circle.svg'
import Search from '@assets/search.svg'

export default function TabLayout() {
  const theme = useTheme();
  const loadVotes = useVotesStore(s => s.loadVotes)
  const loadFavourites = usePhotosStore(s => s.loadFavourites)

  useEffect(() => {
    loadVotes()
    loadFavourites()
  }, [loadVotes, loadFavourites])

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
        tabBarButton: HapticTab,
        headerStyle: { backgroundColor: theme.colors.card },
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
        name="favorite"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <Heart width={24} height={24} fill={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search width={24} height={24} fill={color} />,
        }}
      />
    </Tabs>
  );
}
