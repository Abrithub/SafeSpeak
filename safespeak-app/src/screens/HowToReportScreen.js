import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Linking, Animated, Dimensions,
} from 'react-native';
import { colors, spacing, radius, font, shadow } from '../theme';

const { width: W } = Dimensions.get('window');

// ── Steps data ────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1, icon: '🔒', color: '#8b5cf6', bg: '#f5f3ff',
    title: 'You Are Safe Here',
    desc: 'Your identity is protected. Most fields are optional. Reports are end-to-end encrypted — no IP addresses stored.',
    preview: [
      { label: 'Name', note: 'optional' },
      { label: 'Email', note: 'optional' },
      { label: 'Phone', note: 'optional' },
    ],
    previewNote: '✓ You control what you share',
  },
  {
    id: 2, icon: '📋', color: '#0ea5e9', bg: '#e0f2fe',
    title: 'Fill Out the Form',
    desc: 'Describe what happened in your own words. Select the incident type and share as much or as little as you\'re comfortable with.',
    preview: [
      { label: '1. Who are you reporting for?' },
      { label: '2. Describe the incident' },
      { label: '3. When & where did it happen?' },
      { label: '4. Upload evidence (optional)' },
    ],
    previewNote: '⏱ Takes about 3–5 minutes',
  },
  {
    id: 3, icon: '🛡️', color: '#10b981', bg: '#d1fae5',
    title: 'Submit Securely',
    desc: 'Hit submit and your report is instantly encrypted and sent to our response team. You\'ll receive a unique Case ID.',
    preview: [
      { label: '0s — Report encrypted & submitted' },
      { label: '~5s — AI urgency analysis runs' },
      { label: '~1min — Case assigned to officer' },
      { label: 'Ongoing — Track via Case ID' },
    ],
    previewNote: '🤖 AI prioritizes urgent cases instantly',
  },
  {
    id: 4, icon: '🔍', color: '#f59e0b', bg: '#fef3c7',
    title: 'Track Your Case',
    desc: 'Use your Case ID to check status anytime. No account needed. Admins can send you secure messages.',
    preview: [
      { label: 'Pending', badge: '#fef9c3', badgeText: '#854d0e' },
      { label: 'Under Review', badge: '#dbeafe', badgeText: '#1e40af' },
      { label: 'In Progress', badge: '#ede9fe', badgeText: '#5b21b6' },
      { label: 'Resolved', badge: '#dcfce7', badgeText: '#166534' },
    ],
    previewNote: '🔔 Get notified when status changes',
    isBadges: true,
  },
];

const FAQS = [
  { q: 'How long does it take?', a: 'Most reports take 3–5 minutes. Many fields are optional.' },
  { q: 'Do I have to share my contact info?', a: 'No. Name, email, and phone are all optional. You can report completely anonymously.' },
  { q: 'Is my report secure?', a: 'Yes. All reports are end-to-end encrypted. No IP addresses are stored.' },
  { q: 'What happens after I submit?', a: 'Our AI analyzes urgency and routes your case to the right team. You\'ll get a Case ID to track progress.' },
  { q: 'Can I report for someone else?', a: 'Yes. The form lets you specify if you\'re reporting for yourself, a child, or another person.' },
];

// ── Animated step card ────────────────────────────────────────────────────────
function StepCard({ step, isActive, onPress }) {
  const scale = useRef(new Animated.Value(isActive ? 1 : 0.97)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1 : 0.97,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  }, [isActive]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}
        style={[s.stepCard, isActive && { borderColor: step.color, borderWidth: 2 }]}>
        <View style={[s.stepIconWrap, { backgroundColor: step.bg }]}>
          <Text style={s.stepEmoji}>{step.icon}</Text>
        </View>
        <View style={s.stepCardContent}>
          <Text style={[s.stepCardTitle, isActive && { color: step.color }]}>
            Step {step.id}: {step.title}
          </Text>
          {isActive && <Text style={s.stepCardDesc}>{step.desc}</Text>}
        </View>
        <Text style={[s.stepArrow, isActive && { color: step.color }]}>
          {isActive ? '▼' : '›'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Step detail panel ─────────────────────────────────────────────────────────
function StepDetail({ step }) {
  return (
    <View style={[s.detailPanel, { borderLeftColor: step.color }]}>
      {step.isBadges ? (
        <View style={s.badgeRow}>
          {step.preview.map((p, i) => (
            <View key={i} style={[s.badge, { backgroundColor: p.badge }]}>
              <Text style={[s.badgeText, { color: p.badgeText }]}>{p.label}</Text>
            </View>
          ))}
        </View>
      ) : (
        step.preview.map((p, i) => (
          <View key={i} style={s.previewRow}>
            <View style={[s.previewDot, { backgroundColor: step.color }]} />
            <Text style={s.previewLabel}>{p.label}</Text>
            {p.note && <Text style={[s.previewNote, { color: step.color }]}>{p.note}</Text>}
          </View>
        ))
      )}
      <Text style={[s.previewFooter, { color: step.color }]}>{step.previewNote}</Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function HowToReportScreen({ navigation }) {
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq]       = useState(null);
  const scrollRef = useRef(null);

  const toggleStep = (i) => {
    setActiveStep(activeStep === i ? -1 : i);
  };

  return (
    <ScrollView ref={scrollRef} style={s.container} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroBadge}>
          <Text style={s.heroBadgeText}>🔒 Anonymous & Secure</Text>
        </View>
        <Text style={s.heroTitle}>How to Make a Report</Text>
        <Text style={s.heroSub}>
          Follow the interactive guide below. It takes less than 5 minutes.
        </Text>
        <TouchableOpacity style={s.heroBtn} onPress={() => navigation.navigate('Report')}>
          <Text style={s.heroBtnText}>Start Report →</Text>
        </TouchableOpacity>
      </View>

      {/* Trust badges */}
      <View style={s.trustRow}>
        {[
          { icon: '🔒', label: 'Encrypted' },
          { icon: '👤', label: 'Anonymous' },
          { icon: '⏱', label: '< 5 min' },
        ].map(({ icon, label }) => (
          <View key={label} style={s.trustBadge}>
            <Text style={s.trustIcon}>{icon}</Text>
            <Text style={s.trustLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Video placeholder */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>📹 Tutorial Video</Text>
        <TouchableOpacity style={s.videoBox}
          onPress={() => Linking.openURL('https://www.youtube.com/results?search_query=how+to+report+abuse+safely')}>
          <View style={s.videoInner}>
            <View style={s.playBtn}><Text style={s.playIcon}>▶</Text></View>
            <Text style={s.videoTitle}>How to Make a Report</Text>
            <Text style={s.videoSub}>Tap to watch tutorial</Text>
          </View>
          {/* Chapter pills */}
          <View style={s.chapterRow}>
            {['👋 Intro', '🔒 Privacy', '📋 Form', '🛡️ Submit', '🔍 Track'].map((c) => (
              <View key={c} style={s.chapterPill}>
                <Text style={s.chapterPillText}>{c}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
        <Text style={s.videoNote}>Tap chapters to jump to that section</Text>
      </View>

      {/* Interactive step guide */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>🗺️ Interactive Step Guide</Text>
        <Text style={s.sectionSub}>Tap each step to learn more</Text>

        {/* Progress bar */}
        <View style={s.progressBar}>
          {STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <View style={[
                s.progressDot,
                { backgroundColor: i <= activeStep ? step.color : colors.border }
              ]}>
                <Text style={s.progressDotText}>{i < activeStep ? '✓' : step.icon}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[s.progressLine, { backgroundColor: i < activeStep ? STEPS[i].color : colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Step cards */}
        <View style={s.stepsContainer}>
          {STEPS.map((step, i) => (
            <View key={step.id}>
              <StepCard step={step} isActive={activeStep === i} onPress={() => toggleStep(i)} />
              {activeStep === i && <StepDetail step={step} />}
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={s.startBtn} onPress={() => navigation.navigate('Report')}>
          <Text style={s.startBtnText}>I'm Ready — Start My Report</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>❓ Frequently Asked Questions</Text>
        {FAQS.map((f, i) => (
          <TouchableOpacity key={i} style={s.faqItem} onPress={() => setOpenFaq(openFaq === i ? null : i)}>
            <View style={s.faqHeader}>
              <Text style={s.faqQ}>{f.q}</Text>
              <Text style={s.faqArrow}>{openFaq === i ? '▲' : '▼'}</Text>
            </View>
            {openFaq === i && (
              <Text style={s.faqA}>{f.a}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>📞 Need Immediate Help?</Text>
        <View style={s.contactRow}>
          {[
            { e: '📞', l: 'Call', u: 'tel:+251965485715', c: '#fee2e2' },
            { e: '✉️', l: 'Email', u: 'mailto:support@safespeak.org', c: '#dcfce7' },
            { e: '💬', l: 'WhatsApp', u: 'https://wa.me/251960255733', c: '#e0f2fe' },
          ].map(({ e, l, u, c }) => (
            <TouchableOpacity key={l} style={[s.contactBtn, { backgroundColor: c }]}
              onPress={() => Linking.openURL(u)}>
              <Text style={s.contactEmoji}>{e}</Text>
              <Text style={s.contactLabel}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick exit */}
      <View style={s.exitRow}>
        <Text style={s.exitText}>⚠️ In immediate danger? Call emergency services first.</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.bg },

  // Hero
  hero:           { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl, alignItems: 'center' },
  heroBadge:      { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 5, marginBottom: spacing.md },
  heroBadgeText:  { color: '#93c5fd', fontSize: font.xs, fontWeight: '600' },
  heroTitle:      { fontSize: font.xxl, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: spacing.sm },
  heroSub:        { fontSize: font.sm, color: 'rgba(255,255,255,0.65)', textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  heroBtn:        { backgroundColor: colors.accent, paddingHorizontal: spacing.xl, paddingVertical: 12, borderRadius: radius.full },
  heroBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: font.md },

  // Trust
  trustRow:       { flexDirection: 'row', margin: spacing.md, gap: spacing.sm },
  trustBadge:     { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', ...shadow },
  trustIcon:      { fontSize: 20, marginBottom: 4 },
  trustLabel:     { fontSize: font.xs, fontWeight: '600', color: colors.text },

  // Section
  section:        { backgroundColor: colors.card, margin: spacing.md, marginTop: 0, borderRadius: radius.lg, padding: spacing.md, ...shadow },
  sectionTitle:   { fontSize: font.lg, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  sectionSub:     { fontSize: font.xs, color: colors.textSub, marginBottom: spacing.md },

  // Video
  videoBox:       { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.primary },
  videoInner:     { height: 180, justifyContent: 'center', alignItems: 'center' },
  playBtn:        { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  playIcon:       { fontSize: 22, color: colors.accent, marginLeft: 4 },
  videoTitle:     { color: '#fff', fontSize: font.md, fontWeight: 'bold' },
  videoSub:       { color: 'rgba(255,255,255,0.6)', fontSize: font.xs, marginTop: 4 },
  chapterRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: spacing.sm, backgroundColor: 'rgba(0,0,0,0.3)' },
  chapterPill:    { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  chapterPillText:{ color: '#fff', fontSize: font.xs },
  videoNote:      { fontSize: font.xs, color: colors.textSub, marginTop: spacing.sm },

  // Progress bar
  progressBar:    { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  progressDot:    { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  progressDotText:{ fontSize: 16 },
  progressLine:   { flex: 1, height: 2 },

  // Step cards
  stepsContainer: { gap: spacing.sm, marginBottom: spacing.md },
  stepCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  stepIconWrap:   { width: 40, height: 40, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  stepEmoji:      { fontSize: 20 },
  stepCardContent:{ flex: 1 },
  stepCardTitle:  { fontSize: font.sm, fontWeight: '700', color: colors.text },
  stepCardDesc:   { fontSize: font.xs, color: colors.textSub, marginTop: 4, lineHeight: 17 },
  stepArrow:      { fontSize: font.md, color: colors.textLight },

  // Detail panel
  detailPanel:    { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, marginTop: 2, marginBottom: spacing.sm, borderLeftWidth: 3 },
  previewRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
  previewDot:     { width: 6, height: 6, borderRadius: 3 },
  previewLabel:   { flex: 1, fontSize: font.xs, color: colors.text },
  previewNote:    { fontSize: font.xs, fontWeight: '600' },
  previewFooter:  { fontSize: font.xs, fontWeight: '600', marginTop: spacing.sm },
  badgeRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  badge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeText:      { fontSize: font.xs, fontWeight: '600' },

  // Start button
  startBtn:       { backgroundColor: colors.accent, borderRadius: radius.full, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm },
  startBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: font.md },

  // FAQ
  faqItem:        { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  faqHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  faqQ:           { flex: 1, fontSize: font.sm, fontWeight: '600', color: colors.text, marginRight: spacing.sm, lineHeight: 20 },
  faqArrow:       { color: colors.accent, fontSize: font.xs },
  faqA:           { fontSize: font.sm, color: colors.textSub, marginTop: spacing.sm, lineHeight: 20 },

  // Contact
  contactRow:     { flexDirection: 'row', gap: spacing.sm },
  contactBtn:     { flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: 4 },
  contactEmoji:   { fontSize: 22 },
  contactLabel:   { fontSize: font.xs, fontWeight: '600', color: colors.text },

  // Exit
  exitRow:        { margin: spacing.md, marginTop: 0, backgroundColor: '#fee2e2', borderRadius: radius.md, padding: spacing.md },
  exitText:       { fontSize: font.xs, color: '#dc2626', textAlign: 'center', lineHeight: 18 },
});
