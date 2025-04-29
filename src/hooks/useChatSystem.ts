
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export function useChatSystem() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your virtual therapy assistant. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorRetries, setErrorRetries] = useState(0);
  const [connectionError, setConnectionError] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingError, setRecordingError] = useState("");

  const { toast } = useToast();

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
    }
    return () => {
      audioContext?.close();
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Text to speech functionality
  const playTextToSpeech = async (text: string) => {
    if (!isSpeechEnabled) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'nova' },
      });

      if (error) {
        console.error("Text-to-speech error:", error);
        throw error;
      }

      if (!data || !data.audioContent) {
        throw new Error("No audio content received");
      }

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.play();
    } catch (error) {
      console.error("Error playing text-to-speech:", error);
      toast({
        title: "Speech Error",
        description: "Could not play the audio response.",
        variant: "destructive"
      });
    }
  };

  // AI chat functionality
  const generateResponse = async (userMessage: string) => {
    setIsLoading(true);
    setConnectionError(false);
    
    try {
      const fallbackResponses = [
        "I understand how you're feeling. Would you like to talk more about that?",
        "Thank you for sharing. Sometimes expressing our thoughts can help us process them better.",
        "I appreciate you opening up. What do you think might help in this situation?",
        "That's a valid feeling. Would it help to explore some coping strategies together?",
        "I'm here to listen. Would you like to tell me more about what's on your mind?"
      ];
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          previousMessages: messages.slice(-5),
        },
      });

      if (error) {
        console.error("Error invoking Edge Function:", error);
        
        if (errorRetries > 1) {
          const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
          const fallbackResponse = fallbackResponses[randomIndex];
          
          const newMessage: Message = {
            id: Date.now().toString(),
            content: fallbackResponse,
            sender: "ai",
            timestamp: new Date(),
            sentiment: { score: 0, dominant: "neutral" }
          };
          
          setMessages(prev => [...prev, newMessage]);
          setErrorRetries(0);
          
          if (isSpeechEnabled) {
            playTextToSpeech(fallbackResponse);
          }
          
          return;
        }
        
        setErrorRetries(prev => prev + 1);
        throw new Error(error.message || "Failed to get a response");
      }

      setErrorRetries(0);

      if (!data) {
        throw new Error("No response received from AI");
      }
      
      if (data.error) {
        console.warn("AI chat function returned an error:", data.error);
        if (data.response) {
          const newMessage: Message = {
            id: Date.now().toString(),
            content: data.response,
            sender: "ai",
            timestamp: new Date(),
            sentiment: { score: 0, dominant: "neutral" }
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          toast({
            title: "Connection Issue",
            description: "Using fallback response. The issue has been logged.",
            variant: "destructive"
          });
          
          setConnectionError(true);
          
          if (isSpeechEnabled) {
            playTextToSpeech(data.response);
          }
          
          return;
        }
        throw new Error(data.error);
      }

      if (!data.response) {
        throw new Error("No valid response received");
      }

      const aiResponse = data.response;
      const sentimentData = data.sentiment;
      
      const newMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
        sentiment: sentimentData
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (isSpeechEnabled) {
        playTextToSpeech(aiResponse);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        title: "Connection Error",
        description: "Could not connect to the AI assistant. Please try again.",
        variant: "destructive"
      });
      setConnectionError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    const messageToSend = inputMessage;
    setInputMessage("");
    
    await generateResponse(messageToSend);
  };

  // Voice recording functionality
  const startRecording = async () => {
    try {
      setRecordingError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks(prev => [...prev, e.data]);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setRecordingError("Microphone access denied. Please check your browser permissions.");
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Voice to text processing
  const processAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64Data = reader.result.split(',')[1];
            resolve(base64Data);
          }
        };
      });
      
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;
      
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio },
      });
      
      if (error) {
        console.error("Voice-to-text error:", error);
        throw error;
      }
      
      if (data?.text) {
        setInputMessage(data.text);
        setTimeout(() => {
          handleSendMessage();
        }, 500);
      } else {
        toast({
          title: "Transcription empty",
          description: "Could not detect any speech. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Processing failed",
        description: "Could not convert speech to text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle speech functionality
  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    toast({
      title: isSpeechEnabled ? "Voice disabled" : "Voice enabled",
      description: isSpeechEnabled ? "Text-to-speech is now off." : "Text-to-speech is now on.",
    });
  };

  // Reset connection
  const resetConnection = () => {
    setConnectionError(false);
    setErrorRetries(0);
    toast({
      title: "Reconnecting",
      description: "Attempting to reconnect to the AI service...",
    });
  };

  return {
    // Chat state
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    connectionError,
    endOfMessagesRef,
    
    // Voice state
    isRecording,
    isSpeechEnabled,
    recordingError,
    
    // Chat actions
    handleSendMessage,
    resetConnection,
    
    // Voice actions
    toggleRecording,
    toggleSpeech
  };
}
