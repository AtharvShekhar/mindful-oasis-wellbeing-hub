
import { Button } from "@/components/ui/button";
import { RefreshCw, Volume2, VolumeX, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
          {connectionError ? <AlertCircle className="w-5 h-5" /> : "AI"}
        </div>
        <div className="ml-3">
          <h2 className="font-semibold">Mindful Assistant</h2>
          <p className="text-xs text-gray-500">
            {connectionError ? 'Connection issues detected' : 'AI-powered therapeutic chat assistant'}
          </p>
        </div>
        <div className="ml-auto flex space-x-2">
          {connectionError && resetConnection && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-yellow-500 border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    onClick={resetConnection}
                  >
                    <RefreshCw size={18} className="animate-spin-once" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reconnect to AI service</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSpeech}
                >
                  {isSpeechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSpeechEnabled ? "Disable voice responses" : "Enable voice responses"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
