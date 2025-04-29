
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

    // Check if OpenAI API key exists and has valid format
    if (!openAIApiKey) {
      console.error("OpenAI API key is not configured");
      return new Response(
        JSON.stringify({
          error: "API key configuration error",
          status: "error",
          code: "auth_error",
          response: "I'm unable to connect to my AI service due to a missing API key. Please add an OpenAI API key in your Supabase Edge Function secrets."
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate API key format separately - don't throw immediately
    if (!openAIApiKey.startsWith("sk-") || openAIApiKey.length < 40) {
      console.error("Invalid OpenAI API key format detected");
      return new Response(
        JSON.stringify({
          error: "Invalid API key format",
          status: "error",
          code: "auth_error",
          response: "I'm unable to connect due to an invalid API key format. Please ensure you've added a valid OpenAI API key that starts with 'sk-' and is at least 40 characters long."
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
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
    const maxRetries = 3;

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
            timeout: 30000,
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
              status: "success"
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        // If we get a rate limit error, wait and retry
        if (response.status === 429) {
          console.log(`Rate limited, retrying after delay. Attempt ${retryCount + 1} of ${maxRetries}`);
          await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
          retryCount++;
          continue;
        }

        // For authentication errors, provide a clear message
        if (response.status === 401) {
          const errorText = await response.text();
          console.error("Authentication error with OpenAI API:", errorText);
          
          return new Response(
            JSON.stringify({ 
              error: "OpenAI API authentication failed",
              status: "error",
              code: "auth_error",
              response: "I'm unable to connect to OpenAI. Your API key appears to be invalid or has expired. Please add a valid OpenAI API key in your Supabase Edge Function secrets."
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
        
        // For other errors, get response text and throw
        const errorText = await response.text();
        console.error(`OpenAI API error (${response.status}): ${errorText}`);
        
        // If we haven't reached max retries, wait and try again
        if (retryCount < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
          retryCount++;
          continue;
        }
        
        // If we've exhausted retries, return a meaningful error
        return new Response(
          JSON.stringify({
            error: `OpenAI service error (${response.status})`,
            status: "error",
            code: "api_error",
            response: "I'm having difficulty processing your request right now. Let's try again in a moment."
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        console.error("Error in OpenAI API call:", error);
        
        // Network errors or unexpected exceptions
        if (retryCount < maxRetries) {
          console.log(`Retrying after error. Attempt ${retryCount + 1} of ${maxRetries}`);
          await new Promise(r => setTimeout(r, 1500 * (retryCount + 1)));
          retryCount++;
        } else {
          // If we've exhausted retries, return a meaningful error response
          return new Response(
            JSON.stringify({
              error: `API communication error: ${error.message}`,
              status: "error",
              code: "network_error",
              response: "I'm having trouble connecting right now. Please check your internet connection and try again."
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }
    }

    // This should never be reached due to the return statements above
    throw new Error("Failed to get response after retries");

  } catch (error) {
    console.error("Error in AI chat function:", error);
    
    // Return a more detailed error message
    return new Response(
      JSON.stringify({ 
        error: `Error processing request: ${error.message}`,
        status: "error",
        code: error.message.includes("API key") ? "auth_error" : "server_error",
        response: "I'm having trouble connecting right now. Please ensure you've added a valid OpenAI API key and try again."
      }),
      { 
        status: 200, // Return 200 even for errors so the frontend can handle it gracefully
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
