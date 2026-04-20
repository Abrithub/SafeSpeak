import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { colors, spacing, radius, font, shadow } from '../theme';

const VALUES = [
  { icon: '🛡️', title: 'Quality First',   sub: 'Committed to excellence in every report handled.' },
  { icon: '🤝', title: 'Transparency',    sub: 'Clear communication with reporters and partners.' },
  { icon: '⚙️', title: 'Scalable',        sub: 'Built to grow with communities across Ethiopia.' },
  { icon: '✅', title: 'End-to-End',      sub: 'From report submission to case resolution.' },
];

const TRUST = [
  'We are committed to quality.',
  'We believe in transparency.',
  'Scalable solutions for every need.',
  'We provide end-to-end support.',
];

export default function AboutScreen() {
  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroLabel}>TRUSTED BY</Text>
        <Text style={s.heroTitle}>Our Partners</Text>
        <Text style={s.heroSub}>Together With Us</Text>
      </View>

      {/* Partner logos */}
      <View style={s.partnerRow}>
        <Image source={require('../../assets/association.png')} style={s.partnerImg} resizeMode="contain" />
        <Image source={require('../../assets/child.png')} style={s.partnerImg} resizeMode="contain" />
      </View>
      <Text style={s.partnerNote}>Official partnership agreements and association memberships</Text>

      {/* Trusted partner section */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>What makes us a <Text style={{ color: colors.accent }}>Trusted Partner?</Text></Text>
        {TRUST.map((t, i) => (
          <View key={i} style={s.trustRow}>
            <Text style={s.trustCheck}>✓</Text>
            <Text style={s.trustText}>{t}</Text>
          </View>
        ))}
      </View>

      {/* Value cards */}
      <View style={s.valuesGrid}>
        {VALUES.map((v) => (
          <View key={v.title} style={s.valueCard}>
            <Text style={s.valueIcon}>{v.icon}</Text>
            <Text style={s.valueTitle}>{v.title}</Text>
            <Text style={s.valueSub}>{v.sub}</Text>
          </View>
        ))}
      </View>

      {/* CTA banner */}
      <View style={s.banner}>
        <Text style={s.bannerTitle}>EMPOWERING YOUR GROWTH WITH RELIABLE SOLUTIONS</Text>
        <View style={s.bannerRow}>
          <TouchableOpacity style={s.bannerBtn} onPress={() => {}}>
            <Text style={s.bannerBtnText}>Contact Us →</Text>
          </TouchableOpacity>
          <View>
            <Text style={s.bannerEmail}>abbetterment@gmail.com</Text>
            <Text style={s.bannerPhone}>022-46134613</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bg },
  hero:         { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xl, alignItems: 'center' },
  heroLabel:    { fontSize: font.xs, fontWeight: '700', color: colors.accent, letterSpacing: 2, marginBottom: 4 },
  heroTitle:    { fontSize: font.xxl, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroSub:      { fontSize: font.md, color: 'rgba(255,255,255,0.65)' },
  partnerRow:   { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, padding: spacing.lg, backgroundColor: colors.card },
  partnerImg:   { width: 130, height: 90, borderRadius: radius.md, backgroundColor: '#f8fafc' },
  partnerNote:  { textAlign: 'center', fontSize: font.xs, color: colors.textSub, fontStyle: 'italic', paddingBottom: spacing.md, backgroundColor: colors.card },
  section:      { backgroundColor: colors.card, margin: spacing.md, borderRadius: radius.lg, padding: spacing.lg, ...shadow },
  sectionTitle: { fontSize: font.lg, fontWeight: 'bold', color: colors.text, marginBottom: spacing.md, lineHeight: 26 },
  trustRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  trustCheck:   { color: colors.accent, fontSize: font.lg, fontWeight: 'bold', marginTop: 1 },
  trustText:    { flex: 1, fontSize: font.md, color: colors.text, lineHeight: 22 },
  valuesGrid:   { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.md, gap: spacing.sm },
  valueCard:    { width: '47%', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, ...shadow },
  valueIcon:    { fontSize: 28, marginBottom: spacing.sm },
  valueTitle:   { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: 4 },
  valueSub:     { fontSize: font.xs, color: colors.textSub, lineHeight: 17 },
  banner:       { backgroundColor: colors.accent, margin: spacing.md, borderRadius: radius.lg, padding: spacing.lg },
  bannerTitle:  { fontSize: font.md, fontWeight: 'bold', color: '#fff', lineHeight: 22, marginBottom: spacing.md },
  bannerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm },
  bannerBtn:    { backgroundColor: '#fff', paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.full },
  bannerBtnText:{ color: colors.accent, fontWeight: '700', fontSize: font.sm },
  bannerEmail:  { color: 'rgba(255,255,255,0.85)', fontSize: font.xs },
  bannerPhone:  { color: '#fff', fontWeight: 'bold', fontSize: font.md },
});
