// index.js
const express = require('express');
const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

app.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;

    // תרגום לעברית עם OpenAI
    const translation = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `Translate this into fluent Hebrew: ${text}` }],
      model: 'gpt-3.5-turbo'
    });

    const translatedText = translation.choices[0].message.content;

    // דיבור עם ElevenLabs
    const voiceId = 'TxGEqnHWrfWFTfGW9XjX'; // זה קול גברי בעברית – אפשר להחליף אם נרצה
    const audioResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: translatedText,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    res.set('Content-Type', 'audio/mpeg');
    res.send(audioResponse.data);

  } catch (error) {
    console.error('Error:', error?.response?.data || error.message);
    res.status(500).send('Error processing your request.');
  }
});

app.get('/', (req, res) => {
  res.send('Cliptalk API with ElevenLabs is live 🎙️');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
