
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { useChatSystem } from "@/hooks/useChatSystem";

export const ChatContainer = () => {
  const {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    connectionError,
    endOfMessagesRef,
    handleSendMessage,
    resetConnection,
    isRecording,
    isSpeechEnabled,
    recordingError,
    toggleRecording,
    toggleSpeech
  } = useChatSystem();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-therapy-softPurple/10 dark:bg-therapy-dark/20 flex flex-col">
      <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col px-4 py-6">
        <ChatHeader 
          isSpeechEnabled={isSpeechEnabled} 
          toggleSpeech={toggleSpeech} 
          connectionError={connectionError} 
          resetConnection={resetConnection} 
        />
        
        <div className="flex-grow bg-white dark:bg-black/20 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-therapy-softPurple/30 dark:bg-therapy-dark/50 rounded-tl-none">
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
            
            {connectionError && !isLoading && (
              <div className="flex justify-center my-4">
                <button 
                  onClick={resetConnection}
                  className="px-4 py-2 bg-therapy-primary text-white rounded-full hover:bg-therapy-secondary transition-colors"
                >
                  Reconnect to AI Service
                </button>
              </div>
            )}
            
            <div ref={endOfMessagesRef} />
          </div>
        </div>
        
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSendMessage}
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          recordingError={recordingError}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
