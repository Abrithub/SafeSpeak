import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, font } from '../theme';

const MENU = [
  { icon: '🏠', label: 'Home',         route: 'Home' },
  { icon: '📋', label: 'Report',        route: 'Report' },
  { icon: '❓', label: 'FAQ',           route: 'FAQ' },
  { icon: '🎬', label: 'How to Report', route: 'HowToReport' },
  { icon: '👤', label: 'My Cases',      route: 'MyCases' },
  { icon: '🔐', label: 'Sign In',       route: 'Login' },
  { icon: '📝', label: 'Sign Up',       route: 'SignUp' },
];

export default function DrawerContent(props) {
  const { navigation, state } = props;
  const currentRoute = state.routes[state.index]?.name;

  const handleNav = async (route) => {
    navigation.closeDrawer();
    if (route === 'MyCases') {
      const token = await AsyncStorage.getItem('token');
      const user = JSON.parse(await AsyncStorage.getItem('currentUser') || '{}');
      if (!token) { navigation.navigate('Login'); return; }
      if (user.role === 'admin') { navigation.navigate('Dashboard'); return; }
    }
    navigation.navigate(route);
  };

  return (
    <DrawerContentScrollView {...props} style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" onError={() => {}} />
        <Text style={s.appName}>SafeSpeak</Text>
        <Text style={s.tagline}>Secure. Anonymous. Trusted.</Text>
      </View>

      {/* Nav items */}
      <View style={s.nav}>
        {MENU.map(item => {
          const active = currentRoute === item.route;
          return (
            <TouchableOpacity key={item.route} style={[s.navItem, active && s.navItemActive]}
              onPress={() => handleNav(item.route)}>
              <Text style={s.navIcon}>{item.icon}</Text>
              <Text style={[s.navLabel, active && s.navLabelActive]}>{item.label}</Text>
              {active && <View style={s.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.divider} />
        <Text style={s.footerText}>🛡️ All reports are encrypted</Text>
        <Text style={s.footerSub}>© 2025 SafeSpeak</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  header: { padding: spacing.lg, paddingTop: spacing.xl, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.md },
  logo: { width: 56, height: 56, marginBottom: spacing.sm },
  appName: { fontSize: font.xl, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: font.xs, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  nav: { paddingHorizontal: spacing.sm },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: spacing.md, borderRadius: radius.md, marginBottom: 2 },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  navIcon: { fontSize: 18, width: 32 },
  navLabel: { flex: 1, fontSize: font.md, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  navLabelActive: { color: '#fff', fontWeight: '700' },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  footer: { padding: spacing.lg, marginTop: spacing.xl },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.md },
  footerText: { fontSize: font.xs, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },
  footerSub: { fontSize: font.xs, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 4 },
});
