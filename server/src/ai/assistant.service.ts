import { HfInference } from '@huggingface/inference';
import { ASSISTANT_SYSTEM_PROMPT, buildAssistantPrompt } from './prompt-templates';

const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || '';
const hf = hfToken ? new HfInference(hfToken) : null;

// Primary instruction-tuned model from Hugging Face
const PRIMARY_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

export async function runAssistantChat({
  role = 'BUYER',
  message,
  chatHistory = [],
  marketplaceContext = {},
}: {
  role?: 'BUYER' | 'SUPPLIER';
  message: string;
  chatHistory?: Array<{ sender: string; text: string }>;
  marketplaceContext?: any;
}) {
  const userPrompt = buildAssistantPrompt(role, message, marketplaceContext);

  if (hf) {
    try {
      const response = await hf.chatCompletion({
        model: PRIMARY_MODEL,
        messages: [
          { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
          ...chatHistory.slice(-4).map((h) => ({
            role: h.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: h.text,
          })),
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const reply = response.choices[0]?.message?.content;
      if (reply && reply.trim()) {
        return {
          reply: reply.trim(),
          modelUsed: PRIMARY_MODEL,
        };
      }
    } catch (err) {
      console.warn('Hugging Face Inference call failed, switching to local intelligence fallback:', err);
    }
  }

  // Smart Domain Fallback for Sales & Business Assistant
  return generateDomainAssistantFallback(role, message, marketplaceContext);
}

function generateDomainAssistantFallback(role: 'BUYER' | 'SUPPLIER', message: string, context: any) {
  const lower = message.toLowerCase();
  const products = context.productsSnippet || [];

  if (role === 'SUPPLIER') {
    if (lower.includes('description') || lower.includes('write')) {
      return {
        reply: `Here is a high-converting B2B product description for your listing:
"Engineered for high-end fashion and industrial applications, this premium textile combines superior tactile softness with institutional durability. Featuring verified GOTS/OEKO-TEX compliance, low shrinkage rates, and excellent dye affinity. Ideal for brands targeting sustainable luxury collections."`,
        modelUsed: 'Fabric Mart Business Intelligence Engine',
      };
    }
    if (lower.includes('tag') || lower.includes('seo') || lower.includes('title')) {
      return {
        reply: `Recommended SEO Title & Keywords:
• Title: Premium Organic Cotton 300TC | Sustainable GOTS Certified Wholesale
• Tags: #SustainableTextile #OrganicCotton #GOTSCertified #ApparelFabric #B2BWholesale #LowMOQ`,
        modelUsed: 'Fabric Mart Business Intelligence Engine',
      };
    }
    return {
      reply: `As your Supplier Business Assistant, I can help optimize your inventory listings! Try asking me to generate a product description, suggest SEO tags, recommend MOQ pricing tiers, or format care instructions for your mill products.`,
      modelUsed: 'Fabric Mart Business Intelligence Engine',
    };
  }

  // Buyer Role Fallback
  if (lower.includes('egyptian') || lower.includes('pima') || lower.includes('cotton')) {
    return {
      reply: `Egyptian Cotton utilizes extra-long staple (ELS) fibers grown in the Nile River basin, resulting in silky smoothness and high durability. Pima (Supima) Cotton is also extra-long staple but grown in the Americas, offering comparable softness with higher moisture retention. For breathable summer shirts or bed sheets, both 300TC+ options provide unmatched comfort!`,
      modelUsed: 'Fabric Mart Sales Intelligence Engine',
    };
  }

  if (lower.includes('silk') || lower.includes('wool') || lower.includes('cashmere')) {
    return {
      reply: `Mulberry Silk Charmeuse provides a lustrous satin drape perfect for evening wear and luxury linings. Cashmere and Merino Wool offer natural temperature regulation and moisture wicking, making them ideal for high-end tailored suits and knitwear.`,
      modelUsed: 'Fabric Mart Sales Intelligence Engine',
    };
  }

  if (lower.includes('upholstery') || lower.includes('durable') || lower.includes('curtain')) {
    return {
      reply: `For high-traffic upholstery and curtains, we recommend heavy-duty Duck Canvas (350+ GSM), Elephant Corduroy, or Full-Grain Leather. These fabrics feature high Martindale abrasion ratings and flame-retardant finishes.`,
      modelUsed: 'Fabric Mart Sales Intelligence Engine',
    };
  }

  return {
    reply: `Welcome to Fabric Mart! As your Senior Fabric Sales Consultant, I can help you search our catalog of 80+ certified fabrics, compare technical specifications (GSM, width, MOQ), find sustainable eco-friendly textiles, or suggest fabrics tailored to your apparel collection.`,
    modelUsed: 'Fabric Mart Sales Intelligence Engine',
  };
}

export async function runAssistantGenerateDescription({
  fabricName,
  category,
  fiberOrigin,
  weaveType,
  gsm,
  useCase,
}: {
  fabricName: string;
  category?: string;
  fiberOrigin?: string;
  weaveType?: string;
  gsm?: number;
  useCase?: string;
}) {
  const prompt = `Write a professional B2B textile description for a fabric product listing:
Fabric Name: ${fabricName}
Category: ${category || 'Woven / Knitted Textile'}
Fiber Origin: ${fiberOrigin || 'Natural / Eco-certified'}
Weave Type: ${weaveType || 'Standard'}
GSM: ${gsm || 180}
Recommended Applications: ${useCase || 'Apparel & Fashion'}`;

  if (hf) {
    try {
      const response = await hf.chatCompletion({
        model: PRIMARY_MODEL,
        messages: [
          { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      });

      const reply = response.choices[0]?.message?.content;
      if (reply) {
        return { description: reply.trim(), modelUsed: PRIMARY_MODEL };
      }
    } catch (e) {
      console.warn('HF description generation fallback used:', e);
    }
  }

  return {
    description: `Crafted with premium grade fibers, ${fabricName} offers an exceptional handfeel, superior dimensional stability, and consistent dye affinity. Weighing ${gsm || 180} GSM with a ${weaveType || 'refined'} construction, this textile is specially optimized for ${useCase || 'apparel, tailoring, and home furnishings'}. Sourced through certified ethical mills with strict quality control.`,
    modelUsed: 'Fabric Mart Supplier Intelligence Engine',
  };
}
