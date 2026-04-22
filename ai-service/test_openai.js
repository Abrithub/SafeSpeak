require('dotenv').config();
const { OpenAI } = require('openai');

const key = process.env.OPENAI_API_KEY;
console.log('Key loaded:', key ? `${key.substring(0, 10)}...` : 'MISSING');

async function test() {
  try {
    const client = new OpenAI({ apiKey: key });
    const res = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say hello in one word.' }],
      max_tokens: 10,
    });
    console.log('✅ OpenAI works:', res.choices[0].message.content.trim());
  } catch (e) {
    console.error('❌ OpenAI error:', e.message);
  }
}

test();
