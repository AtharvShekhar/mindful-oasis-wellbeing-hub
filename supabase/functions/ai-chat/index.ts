
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, previousMessages } = await req.json();

    if (!message) {
      throw new Error('No message provided');
    }

    // Default system message for therapy context
    const systemMessage = {
      role: "system",
      content: `You are a compassionate virtual therapy assistant named Mindful. Your purpose is to provide supportive, empathetic responses that help users process their emotions and thoughts. 
      
      Guidelines:
      - Respond with empathy and understanding
      - Ask thoughtful follow-up questions to help users explore their feelings
      - Suggest evidence-based coping strategies when appropriate
      - Never diagnose or prescribe medication
      - If someone is in crisis, gently suggest professional help and crisis resources
      - Keep responses concise (2-4 sentences) but warm
      - Use a supportive, calm tone
      
      Your goal is to help users feel heard and provide them with tools to manage their mental wellbeing.`
    };

    // Format conversation for the API
    const formattedPreviousMessages = previousMessages?.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content
    })) || [];

    const messages = [
      systemMessage,
      ...formattedPreviousMessages,
      { role: "user", content: message }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from OpenAI');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        sentiment: analyzeSentiment(message) // Basic sentiment analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in AI chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    );
  }
});

// Simple sentiment analysis function (more basic than what was in the Chat.tsx)
function analyzeSentiment(text) {
  const positiveWords = ["happy", "joy", "good", "great", "excellent", "wonderful", "better", "positive", "calm", "relaxed"];
  const negativeWords = ["sad", "depressed", "anxious", "worried", "bad", "terrible", "worse", "negative", "stress", "angry"];
  
  let score = 0;
  const lowerText = text.toLowerCase();
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.2;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.2;
  });
  
  // Clamp between -1 and 1
  const sentimentScore = Math.max(-1, Math.min(1, score));
  
  return sentimentScore;
}
