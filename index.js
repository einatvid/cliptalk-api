const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

app.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;
    console.log("BODY TEXT:", text);

    // תרגום לעברית עם LibreTranslate (ללא צורך במפתח)
    const translationResponse = await axios.post(
      'https://libretranslate.com/translate',
      {
        q: text,
        source: "auto",
        target: "he",
        format: "text"
      }
    );
    const translatedText = translationResponse.data.translatedText;
    console.log("TRANSLATED TEXT:", translatedText);

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
    // Print full error details to log
    console.error('FULL ERROR:', error?.response?.data || error.message, error?.response?.status);
    res.status(500).send(error?.response?.data || error.message);
  }
});

app.get('/', (req, res) => {
  res.send('Cliptalk API with ElevenLabs and LibreTranslate is live');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
