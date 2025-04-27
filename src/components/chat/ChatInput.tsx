
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mic, MicOff, Send } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSendMessage: (e?: React.FormEvent) => Promise<void>;
  isRecording: boolean;
  toggleRecording: () => void;
  recordingError: string;
  isLoading: boolean;
}

export const ChatInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isRecording,
  toggleRecording,
  recordingError,
  isLoading,
}: ChatInputProps) => {
  return (
    <div className="bg-white dark:bg-black/20 rounded-b-2xl shadow-sm p-4 border-t border-therapy-softPurple/20">
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <Button
          type="button"
          variant={isRecording ? "destructive" : "ghost"}
          size="icon"
          className={`rounded-full ${isRecording ? "animate-pulse" : ""}`}
          onClick={toggleRecording}
          disabled={isLoading}
          title={isRecording ? "Stop recording" : "Start voice recording"}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </Button>
        
        <Input
          type="text"
          placeholder={recordingError || "Type your message..."}
          className="flex-grow input-therapy"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading || isRecording}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="rounded-full bg-therapy-primary text-white hover:bg-therapy-secondary"
          disabled={!inputMessage.trim() || isLoading || isRecording}
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </Button>
      </form>
      
      <div className="mt-2 text-xs text-center text-muted-foreground">
        <p>Ask any question about mental health, coping strategies, or how you're feeling today</p>
      </div>
    </div>
  );
};
