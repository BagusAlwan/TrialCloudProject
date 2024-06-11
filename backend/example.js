const axios = require('axios');

const API_URL = 'https://api.awanllm.com/v1/chat/completions';
const AWANLLM_API_KEY = 'f553dd76-0c1f-41f0-8732-d0047c63af23'; 

const prompt = 'Hello, how are you?';

const data = {
  model: 'Awanllm-Llama-3-8B-Dolfin',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
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
  },
};

axios
  .post(API_URL, data, config)
  .then((response) => {
    console.log(response.data.choices[0].message.content);
  })
  .catch((error) => {
    console.error(error);
  });
