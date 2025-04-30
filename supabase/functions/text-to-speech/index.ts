
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPEN_API_KEY');

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
    if (!openAIApiKey) {
      throw new Error("Missing OpenAI API key. Please set the OPEN_API_KEY in your Supabase environment variables.");
    }
    
    const { text, voice = 'nova' } = await req.json();

    if (!text) {
      throw new Error("No text provided");
    }

    // Truncate text if it's too long (OpenAI has limits)
    const truncatedText = text.length > 4000 ? text.substring(0, 4000) + "..." : text;

    // Call OpenAI API to convert text to speech
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1', // Text-to-speech model
        input: truncatedText,
        voice: voice, // 'alloy', 'echo', 'fable', 'nova', 'onyx', or 'shimmer'
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI TTS API error:", response.status, errorData);
      throw new Error(`OpenAI TTS API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    // Convert the audio to base64
    const audioArrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(audioArrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    return new Response(
      JSON.stringify({ 
        error: `Error processing request: ${error.message}`,
        errorDetails: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
