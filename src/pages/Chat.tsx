
import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your virtual therapy assistant. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the chat.",
        variant: "destructive"
      });
      navigate("/login");
    }
  }, [user, navigate, toast]);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup audio context for recording
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
    }
    return () => {
      audioContext?.close();
    };
  }, []);

  const generateResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage,
          previousMessages: messages.slice(-5), // Send last 5 messages for context
        },
      });

      if (error) throw error;

      const aiResponse = data.response;
      const sentimentScore = data.sentiment;
      
      const newMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (isSpeechEnabled) {
        playTextToSpeech(aiResponse);
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playTextToSpeech = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'nova' }, // 'nova' has a pleasant, warm voice
      });

      if (error) throw error;

      // Play the audio
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.play();
    } catch (error) {
      console.error("Error playing text-to-speech:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  const startRecording = async () => {
    try {
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
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
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

  const processAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Extract the base64 data
            const base64Data = reader.result.split(',')[1];
            resolve(base64Data);
          }
        };
      });
      
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;
      
      // Call the voice-to-text edge function
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio },
      });
      
      if (error) throw error;
      
      if (data.text) {
        setInputMessage(data.text);
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

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
    toast({
      title: isSpeechEnabled ? "Voice disabled" : "Voice enabled",
      description: isSpeechEnabled ? "Text-to-speech is now off." : "Text-to-speech is now on.",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] bg-therapy-softPurple/10 dark:bg-therapy-dark/20 flex flex-col">
        <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col px-4 py-6">
          <div className="bg-white dark:bg-black/20 rounded-t-2xl shadow-sm p-4 border-b border-therapy-softPurple/20">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-therapy-primary flex items-center justify-center text-white">
                AI
              </div>
              <div className="ml-3">
                <h2 className="font-semibold">Mindful Assistant</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI-powered therapeutic support
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={toggleSpeech}
                title={isSpeechEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
              >
                {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </Button>
            </div>
          </div>
          
          <div className="flex-grow bg-white dark:bg-black/20 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-therapy-primary text-white rounded-tr-none"
                        : "bg-therapy-softPurple/30 dark:bg-therapy-dark/50 rounded-tl-none"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        {message.sender === "ai" ? (
                          <span className="text-xs font-medium">Mindful Assistant</span>
                        ) : (
                          <span className="text-xs font-medium">You</span>
                        )}
                      </div>
                      <span className="text-xs opacity-70 ml-2">{formatTime(message.timestamp)}</span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-therapy-softPurple/30 dark:bg-therapy-dark/50 rounded-tl-none">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                        <span className="text-xs font-medium">Mindful Assistant</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-therapy-primary animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-therapy-primary animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-therapy-primary animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={endOfMessagesRef} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-black/20 rounded-b-2xl shadow-sm p-4 border-t border-therapy-softPurple/20">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`rounded-full ${isRecording ? "text-red-500 bg-red-100 dark:bg-red-900/20 animate-pulse" : ""}`}
                onClick={toggleRecording}
                disabled={isLoading}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
              
              <Input
                type="text"
                placeholder="Type your message..."
                className="flex-grow input-therapy"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="rounded-full bg-therapy-primary text-white hover:bg-therapy-secondary"
                disabled={!inputMessage.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
