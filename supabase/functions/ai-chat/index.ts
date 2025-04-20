
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

    // Enhanced system message for improved therapy context
    const systemMessage = {
      role: "system",
      content: `You are a compassionate virtual therapy assistant named Mindful. Your purpose is to provide supportive, empathetic responses that help users process their emotions and thoughts. 
      
      Guidelines:
      - Respond with empathy and understanding, acknowledge emotions
      - Ask thoughtful follow-up questions to help users explore their feelings
      - Suggest evidence-based coping strategies when appropriate
      - Use a warm, supportive tone with a balance of professional insight and compassion
      - When users seem distressed, focus on immediate coping tools and validation
      - If mental health concepts are mentioned, briefly explain them in accessible language
      - Recognize achievements and progress, no matter how small
      - Maintain privacy and confidentiality in all interactions
      - Always suggest professional help for serious mental health concerns
      - Provide holistic recommendations that may include exercise, nutrition, sleep, meditation, and social connection
      - Recognize cultural and individual differences in mental health experiences
      - Avoid making assumptions about the user's experiences or feelings
      
      Your goal is to help users feel heard, understood, and empowered with tools to manage their mental wellbeing.`
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

    // Call OpenAI API with enhanced parameters
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using a more capable model
        messages,
        temperature: 0.7,
        max_tokens: 800, // Increased for more comprehensive responses
        top_p: 1,
        frequency_penalty: 0.5, // Helps prevent repetitive responses
        presence_penalty: 0.5, // Helps encourage more diverse responses
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from OpenAI');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Enhanced sentiment analysis for more nuanced emotional understanding
    const sentiment = enhancedSentimentAnalysis(message);

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        sentiment: sentiment
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

// Enhanced sentiment analysis with more categories and nuanced scoring
function enhancedSentimentAnalysis(text) {
  // Expanded emotion categories
  const emotions = {
    joy: ["happy", "excited", "delighted", "pleased", "content", "thrilled", "ecstatic", "joyful", "great", "awesome", "wonderful"],
    gratitude: ["thankful", "grateful", "appreciate", "blessed", "fortunate", "thank you"],
    calm: ["peaceful", "relaxed", "serene", "tranquil", "calm", "centered", "balanced", "mindful"],
    sadness: ["sad", "unhappy", "depressed", "gloomy", "disappointed", "heartbroken", "grief", "sorrow", "crying", "tears"],
    anxiety: ["anxious", "worried", "nervous", "uneasy", "frightened", "panic", "stress", "tense", "overwhelmed"],
    anger: ["angry", "frustrated", "annoyed", "irritated", "furious", "mad", "resentful", "hatred", "rage"],
    fear: ["afraid", "scared", "terrified", "fearful", "dread", "horror", "alarmed", "phobia"],
    shame: ["ashamed", "embarrassed", "guilty", "remorseful", "regret", "humiliated", "awkward"],
    confusion: ["confused", "unsure", "uncertain", "puzzled", "perplexed", "lost", "don't understand", "unclear"]
  };
  
  // Initialize emotion scores
  const emotionScores = {
    joy: 0,
    gratitude: 0,
    calm: 0, 
    sadness: 0,
    anxiety: 0,
    anger: 0,
    fear: 0,
    shame: 0,
    confusion: 0
  };
  
  const lowerText = text.toLowerCase();
  
  // Score each emotion category
  for (const [emotion, wordList] of Object.entries(emotions)) {
    wordList.forEach(word => {
      if (lowerText.includes(word)) {
        emotionScores[emotion] += 1;
      }
    });
  }
  
  // Calculate overall positive vs negative sentiment
  const positiveEmotions = emotionScores.joy + emotionScores.gratitude + emotionScores.calm;
  const negativeEmotions = emotionScores.sadness + emotionScores.anxiety + emotionScores.anger + 
                          emotionScores.fear + emotionScores.shame;
  
  // Normalized sentiment score between -1 and 1
  let sentimentScore = 0;
  const totalEmotions = positiveEmotions + negativeEmotions;
  
  if (totalEmotions > 0) {
    sentimentScore = (positiveEmotions - negativeEmotions) / totalEmotions;
  }
  
  // Find dominant emotion
  let dominantEmotion = "neutral";
  let highestScore = 0;
  
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > highestScore) {
      highestScore = score;
      dominantEmotion = emotion;
    }
  }
  
  // If no strong emotion detected
  if (highestScore === 0) {
    dominantEmotion = "neutral";
  }
  
  return {
    score: Math.max(-1, Math.min(1, sentimentScore)), // Clamp between -1 and 1
    dominant: dominantEmotion,
    emotions: emotionScores
  };
}
