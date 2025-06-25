// index.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

app.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;

    // תרגום לעברית עם DeepSeek
    const translationResponse = await axios.post(
      'https://api.deepseek.com/v1/translate',
      {
        text: text,
        source_lang: "auto",
        target_lang: "he"
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.deepseektranslate}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const translatedText = translationResponse.data.translated_text;

    // דיבור עם ElevenLabs (אותו קוד)
    const voiceId = 'TxGEqnHWrfWFTfGW9XjX'; // קול גברי בעברית
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
  res.send('Cliptalk API with ElevenLabs and DeepSeek is live 🎙️');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
