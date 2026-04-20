import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { colors, spacing, radius, font, shadow } from '../theme';

const SECTIONS = [
  {
    id: 'report',
    title: 'Making a SafeSpeak Report',
    questions: [
      {
        q: 'What should be reported to SafeSpeak?',
        a: 'Any incident involving abuse, harassment, or exploitation — physical, emotional, sexual, online, domestic violence, child abuse or neglect, or any situation where someone\'s safety is at risk.',
      },
      {
        q: 'How do I know if I should make a SafeSpeak report?',
        a: 'You should make a report if you are, or were at the time, under 18 and may have been a victim of abuse or exploitation. Also report if you have information about the possible abuse of a child or vulnerable person.',
      },
      {
        q: 'Do I have to share my name, phone number, email, etc.?',
        a: 'No. You can make an anonymous report. While providing contact information helps our team follow up, it is not required. Your privacy and safety are important to us.',
      },
      {
        q: 'Do I have to live in a specific country to make a report?',
        a: 'No. SafeSpeak accepts reports from anywhere in the world. Reports are shared with appropriate local authorities and support services globally.',
      },
    ],
  },
  {
    id: 'after',
    title: 'What happens after I make a report?',
    questions: [
      {
        q: 'What is the review process?',
        a: 'After you submit, our team reviews the report for completeness, assesses immediate safety concerns, refers to relevant local support services, coordinates with authorities if needed, and follows up if additional information is required.',
      },
      {
        q: 'How long does it take to get a response?',
        a: 'High-urgency cases are flagged immediately by our AI system. A case officer is typically assigned within 24 hours. You can track your case status anytime using your Case ID.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    questions: [
      {
        q: 'Is my report secure?',
        a: 'Yes. All reports are end-to-end encrypted and handled with strict confidentiality. No IP addresses are stored. Your identity is protected.',
      },
      {
        q: 'Can I report completely anonymously?',
        a: 'Yes. Name, email, and phone are all optional. You can submit a report without providing any personal information.',
      },
      {
        q: 'Who can see my report?',
        a: 'Only authorized SafeSpeak officers and relevant support organizations can access your report. It is never shared publicly.',
      },
    ],
  },
  {
    id: 'tracking',
    title: 'Tracking Your Case',
    questions: [
      {
        q: 'How do I track my case?',
        a: 'Use the "Track My Case" option in the menu. Enter your Case ID (shown after submission) to see real-time status updates.',
      },
      {
        q: 'What do the case statuses mean?',
        a: 'Pending: received and awaiting review. Under Review: being assessed. In Progress: actively being handled. Resolved: case closed. Rejected: could not be processed.',
      },
      {
        q: 'Can I receive messages from the support team?',
        a: 'Yes. If you provided an email or are logged in, the support team can send you secure messages about your case.',
      },
    ],
  },
];

export default function FAQScreen() {
  const [openSection, setOpenSection] = useState('report');
  const [openQ, setOpenQ] = useState(null);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Frequently Asked Questions</Text>
        <Text style={s.headerSub}>Everything you need to know before making a report.</Text>
      </View>

      <View style={s.content}>
        {SECTIONS.map((sec) => (
          <View key={sec.id} style={s.sectionCard}>
            {/* Section toggle */}
            <TouchableOpacity
              style={s.sectionHeader}
              onPress={() => { setOpenSection(openSection === sec.id ? null : sec.id); setOpenQ(null); }}>
              <Text style={[s.sectionTitle, openSection === sec.id && { color: colors.accent }]}>{sec.title}</Text>
              <Text style={s.sectionArrow}>{openSection === sec.id ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {openSection === sec.id && (
              <View style={s.questionsWrap}>
                {sec.questions.map((item, i) => {
                  const key = `${sec.id}-${i}`;
                  return (
                    <TouchableOpacity key={key} style={s.qItem}
                      onPress={() => setOpenQ(openQ === key ? null : key)}>
                      <View style={s.qHeader}>
                        <Text style={s.qText}>{item.q}</Text>
                        <Text style={s.qArrow}>{openQ === key ? '▲' : '▼'}</Text>
                      </View>
                      {openQ === key && (
                        <Text style={s.aText}>{item.a}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ))}

        {/* Immediate help */}
        <View style={s.helpBox}>
          <Text style={s.helpTitle}>Need immediate help?</Text>
          <Text style={s.helpBody}>
            If you or someone you know is in immediate danger, please contact emergency services right away.
          </Text>
          <View style={s.helpBtns}>
            <TouchableOpacity style={s.helpBtn} onPress={() => Linking.openURL('tel:+251911123456')}>
              <Text style={s.helpBtnText}>📞 Emergency: +251 911 123 456</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bg },
  header:        { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xl },
  headerTitle:   { fontSize: font.xl, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSub:     { fontSize: font.sm, color: 'rgba(255,255,255,0.65)' },
  content:       { padding: spacing.md, gap: spacing.sm },
  sectionCard:   { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', ...shadow },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  sectionTitle:  { flex: 1, fontSize: font.md, fontWeight: '700', color: colors.text, lineHeight: 22 },
  sectionArrow:  { color: colors.accent, fontSize: font.xs, marginLeft: spacing.sm },
  questionsWrap: { backgroundColor: colors.bg, padding: spacing.sm, gap: spacing.xs },
  qItem:         { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md },
  qHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  qText:         { flex: 1, fontSize: font.sm, fontWeight: '600', color: colors.text, lineHeight: 20, marginRight: spacing.sm },
  qArrow:        { color: colors.accent, fontSize: font.xs },
  aText:         { fontSize: font.sm, color: colors.textSub, marginTop: spacing.sm, lineHeight: 20 },
  helpBox:       { backgroundColor: '#fef2f2', borderRadius: radius.lg, padding: spacing.lg, borderLeftWidth: 3, borderLeftColor: colors.danger },
  helpTitle:     { fontSize: font.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  helpBody:      { fontSize: font.sm, color: colors.textSub, lineHeight: 20, marginBottom: spacing.md },
  helpBtns:      { gap: spacing.sm },
  helpBtn:       { backgroundColor: '#dc2626', paddingVertical: 12, borderRadius: radius.full, alignItems: 'center' },
  helpBtnText:   { color: '#fff', fontWeight: '700', fontSize: font.sm },
});
