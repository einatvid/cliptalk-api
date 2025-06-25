const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

// Print env variable to log for debugging
console.log("deepseektranslate env value:", process.env.deepseektranslate);

app.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;
    console.log("BODY TEXT:", text);

    // Translate to Hebrew with DeepSeek
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
    console.log("TRANSLATED TEXT:", translatedText);

    // Text-to-speech with ElevenLabs
    const voiceId = 'TxGEqnHWrfWFTfGW9XjX';
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
    // Print full error details to log
    console.error('FULL ERROR:', error?.response?.data || error.message, error?.response?.status);
    res.status(500).send(error?.response?.data || error.message);
  }
});

app.get('/', (req, res) => {
  res.send('Cliptalk API with ElevenLabs and DeepSeek is live');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
