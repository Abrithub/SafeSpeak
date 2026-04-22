require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const key = process.env.GEMINI_API_KEY;
console.log('Key loaded:', key ? `${key.substring(0, 10)}...` : 'MISSING');

const TESTS = [
  { model: 'gemini-1.5-flash', api: 'v1beta' },
  { model: 'gemini-2.0-flash', api: 'v1beta' },
  { model: 'gemini-2.0-flash-lite', api: 'v1beta' },
  { model: 'gemini-1.5-flash-8b', api: 'v1beta' },
];

async function test() {
  for (const { model, api } of TESTS) {
    try {
      const genAI = new GoogleGenerativeAI(key);
      const m = genAI.getGenerativeModel({ model }, { apiVersion: api });
      const result = await m.generateContent('Say hello in one word.');
      console.log(`✅ WORKS: ${model} (${api}) — "${result.response.text().trim()}"`);
      return model;
    } catch (e) {
      const code = e.message.match(/\[(\d{3})/)?.[1] || '???';
      console.log(`❌ ${model} (${api}): HTTP ${code} — ${e.message.substring(0, 60)}`);
    }
  }
  console.log('\n⚠️  No model worked. Options:');
  console.log('  1. Wait 24h for quota reset');
  console.log('  2. Add billing at console.cloud.google.com');
  console.log('  3. Use a completely new Google account at aistudio.google.com');
}

test();
