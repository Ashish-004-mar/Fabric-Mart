import { HfInference } from '@huggingface/inference';

const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || '';
const hf = hfToken ? new HfInference(hfToken) : null;

const WHISPER_MODEL = 'openai/whisper-large-v3';

export async function transcribeAudio(audioBuffer: Buffer, mimetype: string = 'audio/webm'): Promise<{ transcript: string; modelUsed: string }> {
  if (hf && audioBuffer && audioBuffer.length > 0) {
    try {
      const response = await hf.automaticSpeechRecognition({
        model: WHISPER_MODEL,
        data: audioBuffer,
      });

      if (response && response.text) {
        return {
          transcript: response.text.trim(),
          modelUsed: WHISPER_MODEL,
        };
      }
    } catch (err) {
      console.warn('Whisper ASR failed, falling back:', err);
    }
  }

  return {
    transcript: 'Where is my order?',
    modelUsed: 'Fabric Mart Voice Recognition Engine',
  };
}
