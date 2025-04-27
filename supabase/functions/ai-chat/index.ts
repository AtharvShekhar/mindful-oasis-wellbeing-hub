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
    // Create a mock AI response if the OpenAI API key is not available
    // This ensures the chat functions even without a valid API key
    if (!openAIApiKey) {
      console.log("No OpenAI API key found, using mock response");
      const { message } = await req.json();
      
      // Generate a mock response based on the user's message
      const mockResponse = generateMockResponse(message);
      
      // Generate a simple sentiment analysis
      const sentiment = enhancedSentimentAnalysis(message);
      
      return new Response(
        JSON.stringify({ 
          response: mockResponse,
          sentiment: sentiment
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { message, previousMessages } = await req.json();

    if (!message) {
      throw new Error("No message provided in the request body");
    }

    // Enhanced system message for better therapy responses
    const systemMessage = {
      role: "system",
      content: `You are Mindful, a compassionate and supportive AI therapy assistant. Your goal is to provide empathetic responses, active listening, and evidence-based guidance.

      Guidelines:
      - Respond with warmth and empathy
      - Ask thoughtful follow-up questions to help users explore their thoughts
      - Suggest practical coping strategies when appropriate
      - Maintain a supportive, non-judgmental tone
      - Recognize signs of distress and provide appropriate resources
      - Encourage mindfulness and self-compassion
      - If someone seems to be in crisis, gently encourage them to seek professional help
      
      Remember that your role is supportive, not to replace professional mental health care.`
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

    console.log("Sending request to OpenAI API");
    
    // Call OpenAI API with improved error handling and retry mechanism
    let response;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 800,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
          }),
        });

        if (response.ok) break;
        
        // If we get a rate limit error, wait and retry
        if (response.status === 429) {
          console.log(`Rate limited, retrying after delay. Attempt ${retryCount + 1} of ${maxRetries}`);
          await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
          retryCount++;
        } else {
          // For other errors, don't retry
          break;
        }
      } catch (error) {
        console.error("Network error in OpenAI API call:", error);
        if (retryCount < maxRetries) {
          console.log(`Retrying after network error. Attempt ${retryCount + 1} of ${maxRetries}`);
          await new Promise(r => setTimeout(r, 1000));
          retryCount++;
        } else {
          throw error;
        }
      }
    }

    // Handle case when all retries failed or we had a non-retryable error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", response.status, errorData);
      
      // Return a friendly error message to the user
      return new Response(
        JSON.stringify({ 
          response: "I'm having trouble connecting to my knowledge base right now. Could you please try again in a moment?",
          sentiment: enhancedSentimentAnalysis(message),
          error: `OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Still return 200 to handle the error gracefully in the UI
        }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected response format from OpenAI:", data);
      
      // Return a fallback response instead of an error
      return new Response(
        JSON.stringify({ 
          response: "I received an unexpected response. Let's try a different approach. How else can I help you today?",
          sentiment: enhancedSentimentAnalysis(message)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const aiResponse = data.choices[0].message.content;

    // Enhanced sentiment analysis
    const sentiment = enhancedSentimentAnalysis(message);

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        sentiment: sentiment
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in AI chat function:", error);
    
    // Return a user-friendly error message
    return new Response(
      JSON.stringify({ 
        response: "I apologize, but I encountered an issue while processing your message. Please try again or ask a different question.",
        error: `Error processing request: ${error.message}`,
        errorDetails: error.stack
      }),
      { 
        status: 200, // Use 200 status even for errors to handle them gracefully in the UI
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Generate a mock response when the OpenAI API key is not available
function generateMockResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How are you feeling today? I'm here to listen and support you.";
  }
  
  if (lowerMessage.includes("depress") || lowerMessage.includes("sad") || lowerMessage.includes("unhappy")) {
    return "I'm sorry to hear you're feeling down. Remember that it's okay to have these feelings, and they don't define you. Would you like to talk more about what's been on your mind? Sometimes just expressing our thoughts can help lighten the burden.";
  }
  
  if (lowerMessage.includes("anxious") || lowerMessage.includes("worry") || lowerMessage.includes("stress")) {
    return "It sounds like you're experiencing some anxiety. Let's take a deep breath together. In through your nose for 4 counts, hold for 3, and out through your mouth for 6. Remember that these feelings will pass, and you have the strength to manage them.";
  }
  
  if (lowerMessage.includes("happy") || lowerMessage.includes("good") || lowerMessage.includes("great")) {
    return "I'm glad to hear you're feeling positive! These moments are wonderful to acknowledge and savor. What has been bringing you joy recently?";
  }
  
  if (lowerMessage.includes("advice") || lowerMessage.includes("help") || lowerMessage.includes("tip")) {
    return "One thing that might help is practicing mindfulness - simply being present in the moment without judgment. Even just 5 minutes a day of mindful breathing can make a difference. Would you like me to suggest a simple mindfulness exercise you could try?";
  }
  
  // Default response for other inputs
  return "Thank you for sharing that with me. How does talking about this make you feel? Remember, I'm here to listen and support you through whatever you're experiencing.";
}

// Enhanced sentiment analysis with more nuanced emotional understanding
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
