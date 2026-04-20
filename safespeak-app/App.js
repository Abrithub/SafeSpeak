import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  TouchableOpacity, View, Text, Modal, FlatList,
  StyleSheet, SafeAreaView, ActivityIndicator, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen           from './src/screens/HomeScreen';
import FAQScreen            from './src/screens/FAQScreen';
import HowToReportScreen    from './src/screens/HowToReportScreen';
import ReportScreen         from './src/screens/ReportScreen';
import LoginScreen          from './src/screens/LoginScreen';
import SignUpScreen         from './src/screens/SignUpScreen';
import MyCasesScreen        from './src/screens/MyCasesScreen';
import DashboardScreen      from './src/screens/DashboardScreen';
import SideMenuScreen       from './src/screens/SideMenuScreen';
import AIChatScreen         from './src/screens/AIChatScreen';
import TrackCaseScreen      from './src/screens/TrackCaseScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import AboutScreen          from './src/screens/AboutScreen';
import ContactScreen        from './src/screens/ContactScreen';
import AgreementScreen      from './src/screens/AgreementScreen';
import { LangProvider, useLang } from './src/context/LangContext';
import { LANGUAGES } from './src/utils/i18n';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const NAV_STYLE = {
  headerStyle: { backgroundColor: '#1a2340' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

/* ── Hamburger (right side) ── */
const HamburgerBtn = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ padding: 8, marginLeft: 4 }}>
    <View style={{ gap: 5 }}>
      <View style={{ width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2 }} />
      <View style={{ width: 16, height: 2.5, backgroundColor: '#fff', borderRadius: 2 }} />
      <View style={{ width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2 }} />
    </View>
  </TouchableOpacity>
);

/* ── Language picker button + modal ── */
function LangBtn() {
  const { lang, changeLang } = useLang();
  const [visible, setVisible] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={ls.btn}>
        <Text style={ls.globe}>🌐</Text>
        <Text style={ls.label}>{current.label}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={ls.backdrop} activeOpacity={1} onPress={() => setVisible(false)} />
        <SafeAreaView pointerEvents="box-none" style={ls.dropdownWrap}>
          <View style={ls.dropdown}>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.code}
                style={[ls.option, l.code === lang && ls.optionActive]}
                onPress={() => { changeLang(l.code); setVisible(false); }}
              >
                <Text style={[ls.optionText, l.code === lang && ls.optionTextActive]}>
                  {l.full}
                </Text>
                {l.code === lang && <Text style={ls.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const ls = StyleSheet.create({
  btn:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, marginRight: 2 },
  globe:          { fontSize: 16 },
  label:          { color: '#fff', fontSize: 12, marginLeft: 3, fontWeight: '600' },
  backdrop:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  dropdownWrap:   { position: 'absolute', top: 56, right: 12 },
  dropdown:       { backgroundColor: '#1a2340', borderRadius: 10, overflow: 'hidden', minWidth: 160, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', elevation: 8 },
  option:         { paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  optionActive:   { backgroundColor: 'rgba(14,165,233,0.2)' },
  optionText:     { color: 'rgba(255,255,255,0.75)', fontSize: 14, flex: 1 },
  optionTextActive: { color: '#fff', fontWeight: '700' },
  check:          { color: '#0ea5e9', fontSize: 14 },
});

/* ── Header right: lang + hamburger ── */
const HeaderRight = ({ onMenuPress }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <LangBtn />
    <HamburgerBtn onPress={onMenuPress} />
  </View>
);

/* ── Logo title (left) ── */
const LogoTitle = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <Image source={require('./assets/newsafe.png')} style={{ width: 28, height: 28 }} resizeMode="contain" />
    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>SafeSpeak</Text>
  </View>
);

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      ...NAV_STYLE,
      headerTitle: () => <LogoTitle />,
      headerRight: () => <HeaderRight onMenuPress={() => navigation.navigate('SideMenu')} />,
      tabBarStyle: { backgroundColor: '#1a2340', borderTopColor: '#ffffff15', height: 58, paddingBottom: 6 },
      tabBarActiveTintColor: '#0ea5e9',
      tabBarInactiveTintColor: '#ffffff50',
      tabBarIcon: ({ size }) => {
        const icons = { Home: '🏠', FAQ: '❓', Report: '📋', 'AI Chat': '🤖', 'Sign In': '🔐' };
        return <Text style={{ fontSize: size - 4 }}>{icons[route.name] || '•'}</Text>;
      },
    })}>
      <Tab.Screen name="Home"    component={HomeScreen}   />
      <Tab.Screen name="FAQ"     component={FAQScreen}    />
      <Tab.Screen name="Report"  component={ReportScreen} />
      <Tab.Screen name="AI Chat" component={AIChatScreen} />
      <Tab.Screen name="Sign In" component={LoginScreen}  />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('agreed').then(val => {
      setInitialRoute(val === 'true' ? 'Main' : 'Agreement');
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator color="#0ea5e9" size="large" />
      </View>
    );
  }

  return (
    <LangProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={NAV_STYLE}>
          <Stack.Screen name="Agreement"      component={AgreementScreen}     options={{ headerShown: false }} />
          <Stack.Screen name="Main"           component={MainTabs}            options={{ headerShown: false }} />
          <Stack.Screen name="SideMenu"       component={SideMenuScreen}      options={{ headerShown: false, presentation: 'transparentModal', animation: 'slide_from_left' }} />
          <Stack.Screen name="HowToReport"    component={HowToReportScreen}   options={{ title: 'How to Report' }} />
          <Stack.Screen name="Login"          component={LoginScreen}         options={{ title: 'Sign In' }} />
          <Stack.Screen name="SignUp"         component={SignUpScreen}        options={{ title: 'Create Account' }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
          <Stack.Screen name="MyCases"        component={MyCasesScreen}       options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard"      component={DashboardScreen}     options={{ headerShown: false }} />
          <Stack.Screen name="AIChat"         component={AIChatScreen}        options={{ title: 'AI Support Chat', ...NAV_STYLE }} />
          <Stack.Screen name="TrackCase"      component={TrackCaseScreen}     options={{ title: 'Track Your Case', ...NAV_STYLE }} />
          <Stack.Screen name="About"          component={AboutScreen}         options={{ title: 'About Us', ...NAV_STYLE }} />
          <Stack.Screen name="Contact"        component={ContactScreen}       options={{ title: 'Contact & Resources', ...NAV_STYLE }} />
        </Stack.Navigator>
      </NavigationContainer>
    </LangProvider>
  );
}
