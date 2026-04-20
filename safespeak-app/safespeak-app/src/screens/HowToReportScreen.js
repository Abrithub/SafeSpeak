import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { colors, spacing, radius, font, shadow } from '../theme';

const faqs = [
  { q: 'How long does it take to complete a report?', a: 'The form can be completed in just a few minutes. Many fields are optional so you can choose what information to provide.' },
  { q: 'Do I have to share my contact information?', a: 'No, you decide if you want to share your contact information. Many fields are optional to protect your privacy.' },
  { q: 'Is my report secure?', a: 'Yes, all reports are encrypted and secure. Your information is protected and handled with strict confidentiality.' },
  { q: 'What happens after I submit a report?', a: 'Our team reviews the report and takes appropriate action. You\'ll receive updates if you provided contact information.' },
];

const steps = [
  { icon: '📋', title: 'Fill Out the Form', desc: 'Complete the secure online form with details about the incident. Most fields are optional.' },
  { icon: '✅', title: 'Review Information', desc: 'Double-check the information you\'ve provided before submitting.' },
  { icon: '🛡️', title: 'Submit Securely', desc: 'Your report is encrypted and sent to our response team.' },
  { icon: '🕐', title: 'Get Follow-up', desc: 'If you provided contact info, our team will reach out with updates.' },
];

export default function HowToReportScreen({ navigation }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Have questions before starting?</Text>
        <Text style={s.headerSub}>Watch the video or read the guide below</Text>
      </View>

      {/* Intro card */}
      <View style={s.card}>
        <Text style={s.cardText}>
          Making a report is secure and easy. The form can be completed in just a few minutes, and you decide if you want to share your contact information. Many fields are optional.
        </Text>
        <TouchableOpacity style={s.startBtn} onPress={() => navigation.navigate('Report')}>
          <Text style={s.startBtnText}>Get Started →</Text>
        </TouchableOpacity>
      </View>

      {/* Video player */}
      <View style={s.videoSection}>
        <Text style={s.sectionTitle}>📹 Tutorial Video</Text>
        <TouchableOpacity style={s.videoContainer} onPress={() => Linking.openURL('https://www.youtube.com/results?search_query=how+to+report+abuse')}>
          <View style={s.videoPlaceholder}>
            <Text style={s.videoPlayIcon}>▶</Text>
            <Text style={s.videoPlaceholderText}>How to Make a Report</Text>
            <Text style={s.videoPlaceholderSub}>Tap to watch tutorial</Text>
          </View>
          <View style={s.videoLabel}>
            <Text style={s.videoLabelText}>How to Make a Report • Tutorial</Text>
          </View>
        </TouchableOpacity>
        <Text style={s.videoNote}>Learn how to submit a report in just a few minutes</Text>
      </View>

      {/* Steps */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>How It Works</Text>
        {steps.map((step, i) => (
          <View key={i} style={s.stepRow}>
            <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
            <View style={s.stepIconBox}><Text style={s.stepEmoji}>{step.icon}</Text></View>
            <View style={s.stepContent}>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* FAQ */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Frequently Asked Questions</Text>
        {faqs.map((f, i) => (
          <TouchableOpacity key={i} style={s.faqItem} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
            <View style={s.faqHeader}>
              <Text style={s.faqQ}>{f.q}</Text>
              <Text style={s.faqArrow}>{openFaq === i ? '▲' : '▼'}</Text>
            </View>
            {openFaq === i && <Text style={s.faqA}>{f.a}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Need Immediate Help?</Text>
        <View style={s.contactGrid}>
          {[['📞','Call Us','tel:+251911123456'],['✉️','Email','mailto:support@safespeak.org'],['💬','WhatsApp','https://wa.me/251911123456']].map(([e,l,u]) => (
            <TouchableOpacity key={l} style={s.contactBtn} onPress={() => Linking.openURL(u)}>
              <Text style={s.contactEmoji}>{e}</Text>
              <Text style={s.contactLabel}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xl },
  headerTitle: { fontSize: font.xl, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  headerSub: { fontSize: font.sm, color: 'rgba(255,255,255,0.7)' },
  card: { backgroundColor: colors.card, margin: spacing.md, borderRadius: radius.lg, padding: spacing.lg, ...shadow },
  cardText: { fontSize: font.sm, color: colors.textSub, lineHeight: 22, marginBottom: spacing.md },
  startBtn: { backgroundColor: colors.accent, paddingVertical: 12, borderRadius: radius.full, alignItems: 'center' },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: font.md },
  videoSection: { backgroundColor: colors.card, margin: spacing.md, borderRadius: radius.lg, overflow: 'hidden', ...shadow },
  sectionTitle: { fontSize: font.lg, fontWeight: 'bold', color: colors.text, padding: spacing.md, paddingBottom: spacing.sm },
  videoContainer: { position: 'relative' },
  videoPlaceholder: { width: '100%', height: 200, backgroundColor: '#1a2340', justifyContent: 'center', alignItems: 'center' },
  videoPlayIcon: { fontSize: 48, color: '#fff', marginBottom: 8 },
  videoPlaceholderText: { color: '#fff', fontSize: font.md, fontWeight: 'bold' },
  videoPlaceholderSub: { color: 'rgba(255,255,255,0.6)', fontSize: font.xs, marginTop: 4 },
  videoLabel: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  videoLabelText: { color: '#fff', fontSize: font.xs },
  videoNote: { fontSize: font.xs, color: colors.textSub, padding: spacing.md, paddingTop: spacing.sm },
  section: { backgroundColor: colors.card, margin: spacing.md, marginTop: 0, borderRadius: radius.lg, padding: spacing.md, ...shadow },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  stepNum: { width: 24, height: 24, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  stepNumText: { color: '#fff', fontSize: font.xs, fontWeight: 'bold' },
  stepIconBox: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center' },
  stepEmoji: { fontSize: 18 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: font.sm, fontWeight: '700', color: colors.text, marginBottom: 2 },
  stepDesc: { fontSize: font.xs, color: colors.textSub, lineHeight: 17 },
  faqItem: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  faqQ: { flex: 1, fontSize: font.sm, fontWeight: '600', color: colors.text, marginRight: spacing.sm, lineHeight: 20 },
  faqArrow: { color: colors.accent, fontSize: font.xs },
  faqA: { fontSize: font.sm, color: colors.textSub, marginTop: spacing.sm, lineHeight: 20 },
  contactGrid: { flexDirection: 'row', gap: spacing.sm },
  contactBtn: { flex: 1, backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 4 },
  contactEmoji: { fontSize: 24 },
  contactLabel: { fontSize: font.xs, color: colors.text, fontWeight: '600' },
});
