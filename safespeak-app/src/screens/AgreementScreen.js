import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, font, shadow } from '../theme';

export default function AgreementScreen({ navigation }) {
  const [agreed, setAgreed] = useState(false);

  const handleEnter = async () => {
    if (!agreed) return;
    await AsyncStorage.setItem('agreed', 'true');
    navigation.replace('Main');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={s.bg}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          <View style={s.card}>
            {/* Logo */}
            <View style={s.logoRow}>
              <Image source={require('../../assets/newsafe.png')} style={s.logoImg} resizeMode="contain" />
            </View>

            <Text style={s.title}>SafeSpeak Platform</Text>

            <Text style={s.body}>
              This platform allows victims to report abuse safely and anonymously.
              False reporting may lead to legal consequences according to legal regulations.
            </Text>

            {/* Amharic */}
            <View style={s.amharicBox}>
              <Text style={s.amharicText}>
                ይህ መድረክ ሰለባዎች ጥቃትን በደህንነት እና ስም-አልባ ሆነው ሪፖርት እንዲያደርጉ ያስችላቸዋል።
                የሐሰት ሪፖርት ማቅረብ በሕግ ደንቦች መሠረት ሕጋዊ ውጤቶችን ሊያስከትል ይችላል።
              </Text>
            </View>

            {/* Terms list */}
            <View style={s.termsList}>
              {[
                'All reports are encrypted and confidential',
                'You can report anonymously — no personal info required',
                'False reports may result in legal action',
                'This platform is not a substitute for emergency services',
              ].map((t, i) => (
                <View key={i} style={s.termRow}>
                  <Text style={s.termDot}>•</Text>
                  <Text style={s.termText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* Checkbox */}
            <TouchableOpacity style={s.checkRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
              <View style={[s.checkbox, agreed && s.checkboxChecked]}>
                {agreed && <Text style={s.checkmark}>✓</Text>}
              </View>
              <Text style={s.checkLabel}>I agree to the terms and conditions</Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={s.btnRow}>
              <TouchableOpacity
                style={[s.enterBtn, !agreed && s.enterBtnDisabled]}
                onPress={handleEnter}
                disabled={!agreed}
              >
                <Text style={s.enterBtnText}>Enter Platform</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.footer}>🔒 Your privacy is our priority</Text>
          </View>

        </ScrollView>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  bg:              { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center' },
  content:         { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  card:            { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, ...shadow },
  logoRow:         { alignItems: 'center', marginBottom: spacing.md },
  logoImg:         { width: 120, height: 120 },
  title:           { fontSize: font.xl, fontWeight: 'bold', color: '#dc2626', textAlign: 'center', marginBottom: spacing.md },
  body:            { fontSize: font.sm, color: colors.textSub, textAlign: 'center', lineHeight: 22, marginBottom: spacing.md },
  amharicBox:      { backgroundColor: '#fef9c3', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  amharicText:     { fontSize: font.xs, color: '#78350f', lineHeight: 20 },
  termsList:       { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, gap: spacing.xs },
  termRow:         { flexDirection: 'row', gap: spacing.sm },
  termDot:         { color: colors.accent, fontWeight: 'bold', fontSize: font.md },
  termText:        { flex: 1, fontSize: font.xs, color: colors.text, lineHeight: 18 },
  checkRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  checkbox:        { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  checkmark:       { color: '#fff', fontWeight: 'bold', fontSize: font.sm },
  checkLabel:      { flex: 1, fontSize: font.sm, color: colors.text },
  btnRow:          { gap: spacing.sm },
  enterBtn:        { backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: radius.full, alignItems: 'center' },
  enterBtnDisabled:{ backgroundColor: colors.border },
  enterBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  footer:          { textAlign: 'center', fontSize: font.xs, color: colors.textSub, marginTop: spacing.md },
});
