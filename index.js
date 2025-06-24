const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const { OpenAI } = require('openai');
const textToSpeech = require('@google-cloud/text-to-speech');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new textToSpeech.TextToSpeechClient();

app.post('/translate', async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).send({ error: 'No URL provided' });

  res.send({ status: 'working on it (demo)' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
