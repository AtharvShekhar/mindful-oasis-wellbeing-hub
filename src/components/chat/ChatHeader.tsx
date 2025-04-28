
import { Button } from "@/components/ui/button";
import { RefreshCw, Volume2, VolumeX } from "lucide-react";

interface ChatHeaderProps {
  isSpeechEnabled: boolean;
  toggleSpeech: () => void;
  connectionError?: boolean;
  resetConnection?: () => void;
}

export const ChatHeader = ({ 
  isSpeechEnabled, 
  toggleSpeech, 
  connectionError = false,
  resetConnection
}: ChatHeaderProps) => {
  return (
    <div className="bg-white dark:bg-black/20 rounded-t-2xl shadow-sm p-4 border-b border-therapy-softPurple/20">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full ${connectionError ? 'bg-yellow-500' : 'bg-therapy-primary'} flex items-center justify-center text-white`}>
          AI
        </div>
        <div className="ml-3">
          <h2 className="font-semibold">Mindful Assistant</h2>
          <p className="text-xs text-gray-500">
            {connectionError ? 'Connection issues detected' : 'AI-powered therapeutic chat assistant'}
          </p>
        </div>
        <div className="ml-auto flex space-x-2">
          {connectionError && resetConnection && (
            <Button
              variant="outline"
              size="icon"
              className="text-yellow-500 border-yellow-500"
              onClick={resetConnection}
              title="Reconnect to AI service"
            >
              <RefreshCw size={18} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSpeech}
            title={isSpeechEnabled ? "Disable voice responses" : "Enable voice responses"}
          >
            {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
