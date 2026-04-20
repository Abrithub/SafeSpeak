import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, font } from '../theme';

const MENU = [
  { icon: '🏠', label: 'Home',          route: 'Main' },
  { icon: '📋', label: 'Report Incident', route: 'Report' },
  { icon: '❓', label: 'FAQ',            route: 'FAQ' },
  { icon: '🎬', label: 'How to Report',  route: 'HowToReport' },
  { icon: '👤', label: 'My Cases',       route: 'MyCases' },
  { icon: '🔐', label: 'Sign In',        route: 'Login' },
  { icon: '📝', label: 'Sign Up',        route: 'SignUp' },
];

export default function SideMenuScreen({ navigation }) {
  const handleNav = async (route) => {
    navigation.goBack();
    setTimeout(async () => {
      if (route === 'MyCases') {
        const token = await AsyncStorage.getItem('token');
        const user = JSON.parse(await AsyncStorage.getItem('currentUser') || '{}');
        if (!token) { navigation.navigate('Login'); return; }
        if (user.role === 'admin') { navigation.navigate('Dashboard'); return; }
      }
      navigation.navigate(route);
    }, 100);
  };

  return (
    <View style={s.overlay}>
      <StatusBar barStyle="light-content" />
      {/* Backdrop */}
      <TouchableOpacity style={s.backdrop} onPress={() => navigation.goBack()} activeOpacity={1} />

      {/* Drawer */}
      <SafeAreaView style={s.drawer}>
        {/* Header */}
        <View style={s.header}>
          <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" onError={() => {}} />
          <Text style={s.appName}>SafeSpeak</Text>
          <Text style={s.tagline}>Secure · Anonymous · Trusted</Text>
        </View>

        {/* Close button */}
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={s.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Menu items */}
        <View style={s.menu}>
          {MENU.map((item) => (
            <TouchableOpacity key={item.route} style={s.menuItem} onPress={() => handleNav(item.route)}>
              <View style={s.menuIconBox}>
                <Text style={s.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Text style={s.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.divider} />
          <Text style={s.footerText}>🛡️ All reports are encrypted and secure</Text>
          <Text style={s.footerSub}>© 2025 SafeSpeak</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: { width: 280, backgroundColor: colors.primary, height: '100%' },
  header: { padding: spacing.lg, paddingTop: spacing.xl, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.sm },
  logo: { width: 52, height: 52, marginBottom: spacing.sm },
  appName: { fontSize: font.xl, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: font.xs, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  closeBtn: { position: 'absolute', top: spacing.lg, right: spacing.md, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  closeText: { color: '#fff', fontSize: font.md },
  menu: { paddingHorizontal: spacing.sm, flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: spacing.sm, borderRadius: radius.md, marginBottom: 2 },
  menuIconBox: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  menuIcon: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: font.md, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  menuArrow: { fontSize: 20, color: 'rgba(255,255,255,0.3)' },
  footer: { padding: spacing.lg },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.md },
  footerText: { fontSize: font.xs, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  footerSub: { fontSize: font.xs, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 4 },
});
