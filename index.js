// index.js
const express = require('express');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { OpenAI } = require('openai');
const fs = require('fs');
const util = require('util');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new TextToSpeechClient();

app.use(express.json());

app.post('/speak', async (req, res) => {
  try {
    const { text, languageCode = 'he-IL', voiceName = 'he-IL-Standard-D' } = req.body;

    // תרגום בעזרת OpenAI
    const translation = await openai.chat.completions.create({
      messages: [{ role: 'user', content: `Translate this into fluent Hebrew: ${text}` }],
      model: 'gpt-3.5-turbo'
    });

    const translatedText = translation.choices[0].message.content;

    // דיבור עם Google TTS
    const [response] = await client.synthesizeSpeech({
      input: { text: translatedText },
      voice: { languageCode, name: voiceName },
      audioConfig: { audioEncoding: 'MP3' },
    });

    res.set('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

app.get('/', (req, res) => {
  res.send('Cliptalk API is live 🚀');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
