import { HfInference } from '@huggingface/inference';
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN);
hf.textToSpeech({
  model: 'facebook/mms-tts-eng',
  inputs: 'Hello world'
}).then(console.log).catch(console.error);
