import axios from 'axios';

const AI_PROVIDER = process.env.AI_PROVIDER || 'openrouter';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-3.5-turbo';
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS) || 500;

const SYSTEM_PROMPTS = {
  generateProductDescription: `You are an expert e-commerce copywriter. Generate a compelling, SEO-friendly product description based on the product name and category. The description should be:
- 2-3 paragraphs
- Highlight key features and benefits
- Be persuasive but not exaggerate
- Professional tone
- Around 150-200 words`,

  generateBlogDescription: `You are an expert content writer. Generate an engaging blog post description based on the title and category. The description should be:
- 3-4 paragraphs
- Hook the reader from the start
- Be informative and engaging
- Professional tone
- Around 200-300 words`,

  summarizeProduct: `You are a helpful shopping assistant. Summarize the given product description into a concise, easy-to-read format. Include:
- Key features (bullet points)
- What's included
- Why it's special
- Keep it under 100 words`,

  analyzeDemand: `You are a data analyst specializing in e-commerce trends. Based on the sales data provided, analyze which products have:
- High demand (best sellers)
- Low demand (slow movers)
- Seasonal trends if any
Provide actionable recommendations in a structured format.`
};

async function callAI(prompt, systemPrompt) {
  if (!AI_API_KEY) {
    throw new Error('AI_API_KEY not configured');
  }

  try {
    let response;
    
    if (AI_PROVIDER === 'openrouter') {
      response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: AI_MAX_TOKENS,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_API_KEY}`,
            'HTTP-Referer': 'http://localhost:4000',
            'X-Title': 'Dhanush E-commerce'
          }
        }
      );
    } else {
      response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: AI_MAX_TOKENS,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_API_KEY}`
          }
        }
      );
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'AI service failed');
  }
}

export const generateProductDescription = async (productName, category) => {
  const prompt = `Product Name: ${productName}\nCategory: ${category}\n\nPlease generate a compelling product description.`;
  return callAI(prompt, SYSTEM_PROMPTS.generateProductDescription);
};

export const generateBlogDescription = async (title, category) => {
  const prompt = `Blog Title: ${title}\nCategory: ${category}\n\nPlease generate an engaging blog post description.`;
  return callAI(prompt, SYSTEM_PROMPTS.generateBlogDescription);
};

export const summarizeProductDescription = async (description) => {
  const prompt = `Product Description:\n${description}\n\nPlease summarize this into a concise format for shoppers.`;
  return callAI(prompt, SYSTEM_PROMPTS.summarizeProduct);
};

export const analyzeProductDemand = async (products) => {
  const productData = products.map(p => ({
    name: p.name,
    category: p.category,
    stock: p.stock,
    soldCount: p.soldCount || 0,
    price: p.price
  }));

  const prompt = `Sales Data:\n${JSON.stringify(productData, null, 2)}\n\nPlease analyze this data and provide:
1. High demand products (top sellers)
2. Low demand products (slow movers)
3. Recommendations for inventory management`;

  return callAI(prompt, SYSTEM_PROMPTS.analyzeDemand);
};
