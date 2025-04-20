
import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, User, Send, Volume2, VolumeX } from "lucide-react";

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
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const sentimentScore = analyzeSentiment(userMessage);
    let response = "";
    
    if (sentimentScore < -0.5) {
      // Negative sentiment
      response = "I notice you seem to be feeling down. Would you like to talk about what's troubling you? Remember, acknowledging difficult emotions is an important first step.";
    } else if (sentimentScore > 0.5) {
      // Positive sentiment
      response = "It's wonderful to hear you're feeling positive! What specifically has been bringing you joy today?";
    } else {
      // Neutral or mixed sentiment
      response = "Thank you for sharing. Would you like to explore these feelings further, or perhaps try a mindfulness exercise to help center yourself?";
    }
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        content: response,
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
    
    if (isSpeechEnabled) {
      // In a real implementation, this would use the Web Speech API or a TTS service
      console.log("Text-to-speech would read:", response);
    }
    
    setIsLoading(false);
  };

  // Simple mock sentiment analysis (would use a real API in production)
  const analyzeSentiment = (text: string): number => {
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
    
    return Math.max(-1, Math.min(1, score)); // Clamp between -1 and 1
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
    setInputMessage("");
    
    await generateResponse(inputMessage);
  };

  const toggleRecording = () => {
    // This would be implemented with the Web Speech API in a real application
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      console.log("Would start speech recognition here");
      // Simulate receiving speech after 3 seconds
      setTimeout(() => {
        setInputMessage("I've been feeling a bit anxious about my upcoming presentation.");
        setIsRecording(false);
      }, 3000);
    } else {
      console.log("Would stop speech recognition here");
    }
  };

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
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
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
