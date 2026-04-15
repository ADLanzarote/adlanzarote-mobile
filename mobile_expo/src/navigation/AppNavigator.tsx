import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import ComentariosBiblicosScreen from '../screens/ComentariosBiblicosScreen';
import AportesScreen from '../screens/AportesScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Comentarios: '📖',
  Aportes: '💰',
  Configuracion: '⚙️',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.6 }}>
      {TAB_ICONS[name]}
    </Text>
  );
}

function MainTabs() {
  const { canAccessAportes } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 4,
          height: 62,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Comentarios"
        component={ComentariosBiblicosScreen}
        options={{ tabBarLabel: t('navComentarios') }}
      />
      {canAccessAportes() && (
        <Tab.Screen
          name="Aportes"
          component={AportesScreen}
          options={{ tabBarLabel: t('navAportes') }}
        />
      )}
      <Tab.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{ tabBarLabel: t('navConfig') }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>AD Lanzarote</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
