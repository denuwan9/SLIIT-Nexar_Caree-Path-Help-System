require('dotenv').config();
const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

async function test() {
    try {
        console.log('Testing Groq with model: llama-3.3-70b-versatile...');
        const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: 'Hello' }],
        });
        console.log('Response:', completion.choices[0].message.content);
    } catch (error) {
        console.error('Groq Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

test();
