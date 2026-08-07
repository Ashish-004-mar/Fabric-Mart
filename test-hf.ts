import { HfInference } from '@huggingface/inference';
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN);
hf.chatCompletion({
  model: 'mistralai/Mistral-7B-Instruct-v0.3',
  messages: [{role: 'user', content: 'hello'}]
}).then(console.log).catch(console.error);
