import { HfInference } from '@huggingface/inference';
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN);
hf.chatCompletion({
  model: 'HuggingFaceH4/zephyr-7b-beta',
  messages: [{role: 'user', content: 'hello'}]
}).then(console.log).catch(console.error);
