import { HfInference } from '@huggingface/inference';

const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || '';
const hf = hfToken ? new HfInference(hfToken) : null;

const TTS_MODEL = 'microsoft/speecht5_tts';

export async function generateSpeech(text: string): Promise<{ audioBuffer: Buffer | null; modelUsed: string }> {
  if (hf && text) {
    try {
      const audioBlob = await hf.textToSpeech({
        model: TTS_MODEL,
        inputs: text,
      });

      if (audioBlob) {
        const arrayBuffer = await audioBlob.arrayBuffer();
        return {
          audioBuffer: Buffer.from(arrayBuffer),
          modelUsed: TTS_MODEL,
        };
      }
    } catch (err: any) {
      // Silently fall back to Web Speech API if HF Inference Provider is unavailable
      if (err?.message?.includes('No Inference Provider')) {
        // Suppress expected provider errors on free tier
      } else {
        console.warn('Hugging Face TTS unavailable, falling back to Web Speech API.');
      }
    }
  }

  return {
    audioBuffer: null,
    modelUsed: 'Fabric Mart Speech Synthesis Engine (Web Speech API)',
  };
}
