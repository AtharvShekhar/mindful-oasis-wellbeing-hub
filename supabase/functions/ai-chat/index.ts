
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
      throw new Error("No message provided in the request body");
    }

    if (!openAIApiKey) {
      throw new Error("OpenAI API key is not configured");
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

    console.log("Sending request to OpenAI with messages:", JSON.stringify(messages));

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
            model: 'gpt-4o',
            messages,
            temperature: 0.7,
            max_tokens: 800,
            frequency_penalty: 0.5,
            presence_penalty: 0.5,
          }),
        });

        // Check if the response is ok (status in the range 200-299)
        if (response.ok) {
          const data = await response.json();
          
          // Validate response format
          if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error("Unexpected response format from OpenAI");
          }

          const aiResponse = data.choices[0].message.content;
          console.log("Received valid response from OpenAI");

          return new Response(
            JSON.stringify({ 
              response: aiResponse,
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        // If we get a rate limit error, wait and retry
        if (response.status === 429) {
          console.log(`Rate limited, retrying after delay. Attempt ${retryCount + 1} of ${maxRetries}`);
          await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
          retryCount++;
        } else {
          // For other errors, get response text and throw
          const errorText = await response.text();
          throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
        }
      } catch (error) {
        console.error("Error in OpenAI API call:", error);
        if (retryCount < maxRetries) {
          console.log(`Retrying after error. Attempt ${retryCount + 1} of ${maxRetries}`);
          await new Promise(r => setTimeout(r, 1000));
          retryCount++;
        } else {
          throw error;
        }
      }
    }

    // If we've exhausted retries or had other errors
    throw new Error("Failed to get response after retries");

  } catch (error) {
    console.error("Error in AI chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: `Error processing request: ${error.message}`
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
