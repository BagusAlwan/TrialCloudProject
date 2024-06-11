const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const fs = require("fs");
const path = require("path");
const axios = require('axios');
const { Polly } = require("@aws-sdk/client-polly");

const API_URL = 'https://api.awanllm.com/v1/chat/completions';
const AWANLLM_API_KEY = 'f553dd76-0c1f-41f0-8732-d0047c63af23'; 

app.use(bodyParser.json());
app.use(cors());

app.post('/api/text-to-audio-file', async (req, res) => {
    try {
        const prompt = req.body.text;
        const data = {
            model: 'Awanllm-Llama-3-8B-Dolfin',
            messages: [
                { role: 'user', content: prompt }
            ],
            repetition_penalty: 1.1,
            temperature: 0.7,
            top_p: 0.9,
            top_k: 40,
            max_tokens: 1024
        };
        const config = {
            headers: {
                'Authorization': `Bearer ${AWANLLM_API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.post(API_URL, data, config);

        if (!response.data || !response.data.choices || response.data.choices.length === 0) {
            console.error('Invalid response structure', response.data);
            return res.status(500).json({ error: 'Invalid response from AwanLLM API' });
        }

        const completionText = response.data.choices[0].message.content;

        // Log the LLM response to the console
        console.log('LLM Response:', completionText);

        let num = Math.floor(Math.random() * 10000000000).toString();

        const polly = new Polly({
            region: "ap-southeast-2",
            credentials: {
                accessKeyId: process.env.ACSKEY,
                secretAccessKey: process.env.SECKEY
            }
        });

        const params = {
            OutputFormat: "mp3",
            Text: completionText,
            VoiceId: "Matthew"
        };

        polly.synthesizeSpeech(params, async (err, data) => {
            if (err) {
                console.error('Error synthesizing speech', err);
                return res.status(500).json({ error: 'Error synthesizing speech' });
            }

            let filePath = path.join(__dirname, "../public/voice/");
            let fileName = `${num}.mp3`;

            try {
                // Ensure the directory exists
                await fs.promises.mkdir(filePath, { recursive: true });
                await fs.promises.writeFile(path.join(filePath, fileName), data.AudioStream);
                res.status(200).json({ fileName: num });
            } catch (err) {
                console.error('Error writing audio file', err);
                return res.status(500).json({ error: 'Error writing audio file' });
            }
        });
    } catch (error) {
        console.error('Internal Server Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(4001, () => {
    console.log('Server is ready at PORT 4001');
});
