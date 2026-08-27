import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENROUTER_API_KEY = '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';
const AI_HISTORY_STORAGE_KEY = '@real_estate_ai_chat_history_v1';

// Active free models on OpenRouter (ordered by reliability & quality)
const FREE_MODELS = [
  'minimax/minimax-m3:free',
  'openrouter/free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'liquid/lfm-2.5-2.6b:free',
];

const SYSTEM_PROMPT = `You are "EstateAI", an intelligent, friendly, and expert Real Estate Assistant for a premium Real Estate platform.
Your expertise covers:
1. Property search assistance, neighborhood advice (e.g., Nairobi areas like Westlands, Kilimani, Karen, Runda, Lavington, Kileleshwa, Kiambu Road, Kitengela, etc.), and market trends.
2. Financial guidance: Mortgage estimation (loan repayments, interest rates ~12-15% in Kenya), rental yield calculations, capital appreciation, and closing costs.
3. Transaction process: Title deed verification, land searches, sales agreements, stamp duty (4% urban, 2% rural), legal conveyancing, and escrow safety.
4. Property types: Luxury villas, modern apartments, townhouses, commercial offices, and prime land.

Response guidelines:
- Be concise, professional, warm, and structured.
- Use clear bullet points and bold highlights for key numbers, prices, and locations.
- When answering mortgage or investment questions, provide clear estimated numbers.
- If relevant, suggest asking follow-up questions.`;

export const AI_QUICK_PROMPTS = [
  { id: '1', title: 'Top Investment Areas', prompt: 'What are the top 3 high-yield neighborhoods to invest in Nairobi in 2025/2026?' },
  { id: '2', title: 'Mortgage Calculator', prompt: 'How is a mortgage calculated for a 25 Million KES property with a 20% deposit?' },
  { id: '3', title: 'Buying Process Guide', prompt: 'What are the essential steps and closing costs to safely buy property in Kenya?' },
  { id: '4', title: 'Rental Yields', prompt: 'What is the average rental yield for 1-bed vs 2-bed apartments in Westlands and Kilimani?' },
  { id: '5', title: 'First-time Buyer Tips', prompt: 'What are the top 5 mistakes first-time home buyers should avoid?' },
];

/**
 * Send a message to the AI Assistant via OpenRouter with automatic fallback across free models.
 */
export async function sendAIMessage(messages = [], customContext = '') {
  let combinedMessages = [
    { role: 'system', content: customContext ? `${SYSTEM_PROMPT}\n\nAdditional Context:\n${customContext}` : SYSTEM_PROMPT },
    ...messages.map(m => ({ role: m.role || (m.sender === 'user' ? 'user' : 'assistant'), content: m.content || m.text }))
  ];

  let lastError = null;

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://realestateapp.local',
          'X-Title': 'Real Estate AI Assistant',
        },
        body: JSON.stringify({
          model: model,
          messages: combinedMessages,
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (response.ok && data?.choices?.[0]?.message?.content) {
        return {
          success: true,
          content: data.choices[0].message.content.trim(),
          model: model,
        };
      }

      if (data?.error) {
        lastError = data.error.message || 'Model error';
      }
    } catch (err) {
      lastError = err.message || 'Network error';
    }
  }

  // Fallback intelligent response if all remote free tiers are temporarily rate-limited
  return {
    success: true,
    content: getIntelligentFallback(messages[messages.length - 1]?.content || ''),
    model: 'offline-assistant',
    fallback: true,
    note: lastError,
  };
}

/**
 * Persist AI chat history in AsyncStorage
 */
export async function getStoredAIHistory() {
  try {
    const raw = await AsyncStorage.getItem(AI_HISTORY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function storeAIHistory(messages) {
  try {
    await AsyncStorage.setItem(AI_HISTORY_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.warn('Failed to save AI history', e);
  }
}

export async function clearStoredAIHistory() {
  try {
    await AsyncStorage.removeItem(AI_HISTORY_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear AI history', e);
  }
}

/**
 * Knowledge-base fallback in case of rate-limiting
 */
function getIntelligentFallback(userQuery) {
  const q = (userQuery || '').toLowerCase();

  if (q.includes('mortgage') || q.includes('loan') || q.includes('interest')) {
    return `**Mortgage Guide & Estimation**\n\n- **Interest Rates**: Typically **12% - 15% p.a.** in Kenya (or ~9.5% with KMRC-backed schemes).\n- **Typical Deposit**: 10% to 20% down payment is required by most commercial banks.\n- **Example for a 20M KES Property**:\n  • 20% Down payment: **4,000,000 KES**\n  • Loan amount: **16,000,000 KES**\n  • Estimated monthly repayment (20 years @ 13%): **~187,000 KES/month**.\n\nWould you like a custom mortgage estimate for a different property value?`;
  }

  if (q.includes('area') || q.includes('neighborhood') || q.includes('invest') || q.includes('yield') || q.includes('kilimani') || q.includes('westlands')) {
    return `**Top Investment Areas in Nairobi**\n\n1. **Westlands & Riverside**: Premium corporate and expatriate demand. High rental yields (~8-10%) for 1 & 2-bedroom furnished units.\n2. **Kilimani & Kileleshwa**: Fast-growing residential hub with steady tenant occupancy and strong short-stay (Airbnb) demand.\n3. **Karen & Runda**: High-end luxury villas and family homes with long-term capital appreciation and diplomatic tenancy.\n4. **Kitengela & Ruiru / Kiambu Rd**: High capital growth for land and suburban family gated estates.`;
  }

  if (q.includes('buy') || q.includes('step') || q.includes('process') || q.includes('cost') || q.includes('title')) {
    return `**Key Steps to Buying Property in Kenya**\n\n1. **Property Search & Site Visit**: Inspect property condition, boundary beacons, and amenities.\n2. **Official Land Registry Search**: Verify ownership, title deed status, encumbrances, or caveats.\n3. **Sale Agreement & 10% Deposit**: Drafted by an Advocate under the Law Society of Kenya guidelines.\n4. **Valuation & Stamp Duty Payment**: 4% for urban properties, 2% for agricultural land.\n5. **Transfer & Registration**: Title deed transferred into your name upon final payment.`;
  }

  return `Hello! I am your **Real Estate AI Assistant**. I can help you with:\n\n• **Property Valuations & Neighborhood Insights** (Kilimani, Westlands, Karen, etc.)\n• **Mortgage & ROI Calculations**\n• **Land Verification & Legal Purchase Steps**\n• **Finding suitable listings on our platform**\n\nFeel free to ask any question or pick one of the quick suggestions below!`;
}
