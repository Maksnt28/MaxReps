import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'
import { colors } from '@/lib/theme'
import { CustomTabBar } from '@/components/ui/CustomTabBar'

export default function TabLayout() {
  const { t } = useTranslation()

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.gray1,
        },
        headerTintColor: colors.gray12,
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: t('tabs.home'),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: t('tabs.workout'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: t('tabs.workout'),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: t('tabs.exercises'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: t('tabs.exercises'),
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: t('tabs.programs'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: t('tabs.programs'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: t('tabs.profile'),
        }}
      />
    </Tabs>
  )
}
