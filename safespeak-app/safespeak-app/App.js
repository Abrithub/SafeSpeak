import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, Text } from 'react-native';

import HomeScreen        from './src/screens/HomeScreen';
import FAQScreen         from './src/screens/FAQScreen';
import HowToReportScreen from './src/screens/HowToReportScreen';
import ReportScreen      from './src/screens/ReportScreen';
import LoginScreen       from './src/screens/LoginScreen';
import SignUpScreen      from './src/screens/SignUpScreen';
import MyCasesScreen     from './src/screens/MyCasesScreen';
import DashboardScreen   from './src/screens/DashboardScreen';
import SideMenuScreen    from './src/screens/SideMenuScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const NAV_STYLE = {
  headerStyle: { backgroundColor: '#1a2340' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

const HamburgerBtn = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ padding: 8, marginRight: 4 }}>
    <View style={{ gap: 5 }}>
      <View style={{ width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2 }} />
      <View style={{ width: 16, height: 2.5, backgroundColor: '#fff', borderRadius: 2 }} />
      <View style={{ width: 22, height: 2.5, backgroundColor: '#fff', borderRadius: 2 }} />
    </View>
  </TouchableOpacity>
);

function MainTabs({ navigation }) {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      ...NAV_STYLE,
      headerLeft: () => <HamburgerBtn onPress={() => navigation.navigate('SideMenu')} />,
      headerTitle: () => <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>🛡️ SafeSpeak</Text>,
      tabBarStyle: { backgroundColor: '#1a2340', borderTopColor: '#ffffff15', height: 58, paddingBottom: 6 },
      tabBarActiveTintColor: '#0ea5e9',
      tabBarInactiveTintColor: '#ffffff50',
      tabBarIcon: ({ size }) => {
        const icons = { Home: '🏠', FAQ: '❓', Report: '📋', 'Sign In': '🔐' };
        return <Text style={{ fontSize: size - 4 }}>{icons[route.name] || '•'}</Text>;
      },
    })}>
      <Tab.Screen name="Home"    component={HomeScreen}   />
      <Tab.Screen name="FAQ"     component={FAQScreen}    />
      <Tab.Screen name="Report"  component={ReportScreen} />
      <Tab.Screen name="Sign In" component={LoginScreen}  />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={NAV_STYLE}>
        <Stack.Screen name="Main"        component={MainTabs}         options={{ headerShown: false }} />
        <Stack.Screen name="SideMenu"    component={SideMenuScreen}   options={{ headerShown: false, presentation: 'transparentModal', animation: 'slide_from_left' }} />
        <Stack.Screen name="HowToReport" component={HowToReportScreen} options={{ title: 'How to Report' }} />
        <Stack.Screen name="Login"       component={LoginScreen}      options={{ title: 'Sign In' }} />
        <Stack.Screen name="SignUp"      component={SignUpScreen}     options={{ title: 'Create Account' }} />
        <Stack.Screen name="MyCases"     component={MyCasesScreen}    options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard"   component={DashboardScreen}  options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
