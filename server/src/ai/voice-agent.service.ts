import { HfInference } from '@huggingface/inference';
import { VOICE_AGENT_SYSTEM_PROMPT, buildSupportPrompt } from './prompt-templates';

const hfToken = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || '';
const hf = hfToken ? new HfInference(hfToken) : null;

const SUPPORT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

export async function runVoiceAgentSupport({
  role = 'BUYER',
  query,
  userId,
  orderContext = {},
}: {
  role?: 'BUYER' | 'SUPPLIER';
  query: string;
  userId?: string;
  orderContext?: any;
}) {
  const prompt = buildSupportPrompt(role, query, orderContext);

  if (hf) {
    try {
      const response = await hf.chatCompletion({
        model: SUPPORT_MODEL,
        messages: [
          { role: 'system', content: VOICE_AGENT_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        max_tokens: 250,
        temperature: 0.5,
      });

      const reply = response.choices[0]?.message?.content;
      if (reply && reply.trim()) {
        return {
          responseText: reply.trim(),
          modelUsed: SUPPORT_MODEL,
        };
      }
    } catch (err: any) {
      if (err?.message?.includes('provider')) {
        // Suppress expected provider errors on free tier
      } else {
        console.warn('Voice agent HF call failed, switching to support fallback engine.');
      }
    }
  }

  // Voice Customer Support Domain Fallback Engine
  return generateVoiceSupportFallback(role, query, orderContext);
}

function generateVoiceSupportFallback(role: 'BUYER' | 'SUPPLIER', query: string, orderContext: any) {
  const lower = query.toLowerCase();
  const activeOrders = orderContext.recentOrders || [];

  if (lower.includes('return') || lower.includes('defective')) {
    return {
      responseText: `You can initiate a return for defective fabric rolls within 7 days of delivery by visiting your Buyer Dashboard, selecting the specific order, and clicking "Request Return". Please ensure you have clear photos of the defect ready to upload.`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }
  
  if (lower.includes('address') || lower.includes('change my shipping address')) {
    return {
      responseText: `Yes, you can update your default shipping address at any time in your Account Profile Settings. If you need to change the shipping address for an active, unfulfilled order, please contact our support team immediately.`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }

  if (lower.includes('order') || lower.includes('track') || lower.includes('status') || lower.includes('where')) {
    if (activeOrders.length > 0) {
      const latest = activeOrders[0];
      return {
        responseText: `Your latest order #${latest.id || 'ORD-1025'} is currently ${latest.status || 'CONFIRMED'}. Estimated dispatch is within 24 to 48 business hours from our verified mill partner!`,
        modelUsed: 'Fabric Mart Voice Customer Support Engine',
      };
    }
    return {
      responseText: `I checked your account. You currently have no active pending orders. You can browse our marketplace catalog or request sample swatches anytime!`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }

  if (lower.includes('shipping') || lower.includes('delivery')) {
    return {
      responseText: `Standard express freight delivery takes 3 to 5 business days for domestic shipments and 5 to 8 days for international fabric shipments. You can update your default shipping address in your Profile Settings.`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }

  if (lower.includes('payout') || lower.includes('schedule')) {
    return {
      responseText: `As a verified supplier, you can view your detailed payout schedule, upcoming transfers, and history in the "Finances" or "Wallet" tab of your Supplier Dashboard. Payouts are processed on a rolling 14-day schedule.`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }

  if (lower.includes('loading') || lower.includes('not loading')) {
    return {
      responseText: `If you experience loading issues, please try clearing your browser cache or switching to a supported modern browser like Chrome, Firefox, or Safari. If the issue persists across devices, please email support@fabricmart.com.`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }
  
  if (lower.includes('contact the supplier') || lower.includes('contact')) {
    return {
      responseText: `Once an order is confirmed, you can communicate directly with the supplier via the built-in messaging system in your Buyer Dashboard. For pre-sales inquiries, you can use the "Message Supplier" button on the product page.`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }
  
  if (lower.includes('export') || lower.includes('sales report')) {
    return {
      responseText: `Yes! Suppliers can export their sales reports by navigating to the "Analytics" tab in the Supplier Dashboard and clicking the "Export CSV" button in the top right corner of the sales graph.`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }
  
  if (lower.includes('analytics') || lower.includes('missing')) {
    return {
      responseText: `Analytics are refreshed every 24 hours. If your recent sales are not showing, please allow up to 24 hours for the data to aggregate. If the entire page is blank, please check your internet connection or contact technical support.`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }

  if (lower.includes('password') || lower.includes('login') || lower.includes('account')) {
    return {
      responseText: `To update your password or profile credentials, navigate to your Account Settings from the top right user menu. If you are locked out, tap Forgot Password on the login screen.`,
      modelUsed: 'Fabric Mart Voice Customer Support Engine',
    };
  }

  if (role === 'SUPPLIER') {
    if (lower.includes('stock') || lower.includes('quantity') || lower.includes('update')) {
      return {
        responseText: `To update your fabric inventory stock levels, open your Supplier Dashboard, go to Products, select the fabric item, and edit the Available Meters field.`,
        modelUsed: 'Fabric Mart Voice Operations Support Engine',
      };
    }
    if (lower.includes('pending') || lower.includes('approval') || lower.includes('visible')) {
      return {
        responseText: `New fabric listings undergo quality verification by our admin team within 2 to 4 business hours. Once verified, your fabric will immediately appear on the marketplace!`,
        modelUsed: 'Fabric Mart Voice Operations Support Engine',
      };
    }
  }

  return {
    responseText: `I am your Fabric Mart Voice Agent. I can assist you with tracking orders, managing account settings, answering platform FAQs, or troubleshooting checkout questions. How can I help you today?`,
    modelUsed: 'Fabric Mart Voice Customer Support Engine',
  };
}