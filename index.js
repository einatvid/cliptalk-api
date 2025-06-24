const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const textToSpeech = require('@google-cloud/text-to-speech');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const client = new textToSpeech.TextToSpeechClient();

app.post('/translate', async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).send({ error: 'No URL provided' });

  const audioOutput = 'output_audio.mp3';

  exec(`yt-dlp -x --audio-format mp3 -o ${audioOutput} ${videoUrl}`, async (err) => {
    if (err) return res.status(500).send({ error: 'Download failed', details: err.message });

    try {
      const transcription = await openai.createTranscription(
        fs.createReadStream(audioOutput),
        "whisper-1"
      );

      const originalText = transcription.data.text;

      const gptResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "תרגם את הטקסט הבא לעברית תקינה, כאילו קריין מדבר אותו." },
          { role: "user", content: originalText }
        ],
      });

      const translatedText = gptResponse.data.choices[0].message.content;

      const [response] = await client.synthesizeSpeech({
        input: { text: translatedText },
        voice: { languageCode: 'he-IL', ssmlGender: 'MALE' },
        audioConfig: { audioEncoding: 'MP3' },
      });

      const finalAudio = 'final_output.mp3';
      fs.writeFileSync(finalAudio, response.audioContent, 'binary');

      res.download(finalAudio, 'cliptalk.mp3');
    } catch (error) {
      res.status(500).send({ error: 'Processing failed', details: error.message });
    }
  });
});

app.listen(port, () => {
  console.log(`Cliptalk API running on port ${port}`);
});