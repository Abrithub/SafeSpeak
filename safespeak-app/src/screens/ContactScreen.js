import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { colors, spacing, radius, font, shadow } from '../theme';

const RESOURCES = [
  {
    id: 'ncmec', icon: '👶', title: 'National Center for Missing & Exploited Children',
    desc: 'Report child exploitation or get help removing online imagery',
    links: [
      { label: 'Missinks.org', sub: 'Remove exploit content', url: 'https://missinks.org' },
      { label: 'TakeItDown.ncmec.org', sub: 'Stop circulation of images', url: 'https://takeitdown.ncmec.org' },
    ],
  },
  {
    id: '24hour', icon: '📞', title: '24-Hour Call Center',
    desc: 'Report information about a missing or exploited child',
    links: [
      { label: '1-800-THE-LOST', sub: '(1-800-843-5678)', url: 'tel:1-800-843-5678' },
      { label: 'missingskills.org', sub: 'General inquiries', url: 'https://missingskills.org' },
    ],
  },
  {
    id: 'support', icon: '✉️', title: 'Email Support',
    desc: 'General inquiries and support',
    links: [
      { label: 'info@safespeak.org', sub: 'General inquiries', url: 'mailto:info@safespeak.org' },
      { label: 'support@safespeak.org', sub: 'Support', url: 'mailto:support@safespeak.org' },
      { label: 'emergency@safespeak.org', sub: 'Emergency reports', url: 'mailto:emergency@safespeak.org' },
    ],
  },
  {
    id: 'messaging', icon: '💬', title: 'Messaging Apps',
    desc: 'Chat with us on your favorite app',
    links: [
      { label: 'WhatsApp', sub: '+251 960 255 733', url: 'https://wa.me/251960255733' },
      { label: 'Telegram', sub: '@safespeak_support', url: 'https://t.me/safespeak_support' },
      { label: 'Signal', sub: '+251 986 197 824', url: 'sms:+251986197824' },
    ],
  },
  {
    id: 'location', icon: '📍', title: 'Visit Us',
    desc: 'Our physical locations',
    links: [
      { label: 'Head Office', sub: 'Addis Ababa, Bole Road, Ethiopia', hours: 'Mon-Fri 9AM-5PM' },
      { label: 'Regional Office', sub: 'Bahir Dar, Piazza, Ethiopia', hours: 'Mon-Fri 9AM-5PM' },
    ],
  },
];

const SOCIAL = [
  { icon: '🐦', name: 'Twitter', url: 'https://twitter.com' },
  { icon: '📘', name: 'Facebook', url: 'https://facebook.com' },
  { icon: '✈️', name: 'Telegram', url: 'https://t.me/safespeak_support' },
  { icon: '💬', name: 'WhatsApp', url: 'https://wa.me/251960255733' },
];

export default function ContactScreen() {
  const [expanded, setExpanded] = useState(null);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>CyberTipline & Support</Text>
        <Text style={s.headerSub}>
          Report missing or exploited children, get help removing online imagery, or contact our support team.
        </Text>
      </View>

      {/* Emergency banner */}
      <View style={s.emergencyBanner}>
        <View style={s.emergencyLeft}>
          <Text style={s.emergencyIcon}>🚨</Text>
          <View>
            <Text style={s.emergencyTitle}>Immediate Danger?</Text>
            <Text style={s.emergencySub}>Call 911 or your local police immediately</Text>
          </View>
        </View>
        <TouchableOpacity style={s.emergencyBtn} onPress={() => Linking.openURL('tel:911')}>
          <Text style={s.emergencyBtnText}>Call 911</Text>
        </TouchableOpacity>
      </View>

      {/* Resources */}
      <View style={s.section}>
        {RESOURCES.map((r) => (
          <View key={r.id} style={s.resourceCard}>
            <TouchableOpacity onPress={() => setExpanded(expanded === r.id ? null : r.id)}
              style={s.resourceHeader}>
              <View style={s.resourceHeaderLeft}>
                <View style={s.resourceIconBox}><Text style={s.resourceIcon}>{r.icon}</Text></View>
                <View style={s.resourceHeaderText}>
                  <Text style={s.resourceTitle}>{r.title}</Text>
                  <Text style={s.resourceDesc}>{r.desc}</Text>
                </View>
              </View>
              <Text style={s.resourceArrow}>{expanded === r.id ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {expanded === r.id && (
              <View style={s.resourceBody}>
                {r.links.map((link, i) => (
                  <TouchableOpacity key={i} style={s.linkRow}
                    onPress={() => link.url && Linking.openURL(link.url)}>
                    <View style={s.linkContent}>
                      <Text style={s.linkLabel}>{link.label}</Text>
                      <Text style={s.linkSub}>{link.sub}</Text>
                      {link.hours && <Text style={s.linkHours}>{link.hours}</Text>}
                    </View>
                    {link.url && <Text style={s.linkArrow}>›</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Social */}
      <View style={s.socialSection}>
        <Text style={s.socialTitle}>Connect With Us</Text>
        <View style={s.socialGrid}>
          {SOCIAL.map((soc) => (
            <TouchableOpacity key={soc.name} style={s.socialBtn}
              onPress={() => Linking.openURL(soc.url)}>
              <Text style={s.socialIcon}>{soc.icon}</Text>
              <Text style={s.socialName}>{soc.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer */}
      <Text style={s.footer}>🌐 All communications are encrypted and secure</Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: colors.bg },
  header:            { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xl },
  headerTitle:       { fontSize: font.xl, fontWeight: 'bold', color: '#fff', marginBottom: spacing.sm },
  headerSub:         { fontSize: font.sm, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  emergencyBanner:   { backgroundColor: '#fee2e2', margin: spacing.md, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  emergencyLeft:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  emergencyIcon:     { fontSize: 24 },
  emergencyTitle:    { fontSize: font.sm, fontWeight: '700', color: '#dc2626' },
  emergencySub:      { fontSize: font.xs, color: '#7f1d1d' },
  emergencyBtn:      { backgroundColor: '#dc2626', paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.md },
  emergencyBtnText:  { color: '#fff', fontWeight: '700', fontSize: font.sm },
  section:           { padding: spacing.md, gap: spacing.sm },
  resourceCard:      { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', ...shadow },
  resourceHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  resourceHeaderLeft:{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  resourceIconBox:   { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  resourceIcon:      { fontSize: 20 },
  resourceHeaderText:{ flex: 1 },
  resourceTitle:     { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: 2 },
  resourceDesc:      { fontSize: font.xs, color: colors.textSub, lineHeight: 17 },
  resourceArrow:     { fontSize: font.xs, color: colors.textLight },
  resourceBody:      { backgroundColor: colors.bg, padding: spacing.md, gap: spacing.sm },
  linkRow:           { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkContent:       { flex: 1 },
  linkLabel:         { fontSize: font.sm, fontWeight: '600', color: colors.accent },
  linkSub:           { fontSize: font.xs, color: colors.textSub, marginTop: 2 },
  linkHours:         { fontSize: font.xs, color: colors.textLight, marginTop: 2 },
  linkArrow:         { fontSize: 20, color: colors.textLight },
  socialSection:     { backgroundColor: colors.card, margin: spacing.md, borderRadius: radius.lg, padding: spacing.md, ...shadow },
  socialTitle:       { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  socialGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  socialBtn:         { width: '47%', backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 4 },
  socialIcon:        { fontSize: 24 },
  socialName:        { fontSize: font.xs, color: colors.text, fontWeight: '600' },
  footer:            { textAlign: 'center', fontSize: font.xs, color: colors.textSub, marginTop: spacing.md },
});
