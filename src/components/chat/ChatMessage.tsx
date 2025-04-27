
import { format } from 'date-fns';
import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const getSentimentEmoji = (sentiment?: Message['sentiment']) => {
    if (!sentiment) return "";
    
    const score = sentiment.score;
    const dominant = sentiment.dominant;
    
    if (dominant === "joy" || dominant === "gratitude") return "😊";
    if (dominant === "calm") return "😌";
    if (dominant === "sadness") return "😔";
    if (dominant === "anxiety" || dominant === "fear") return "😰";
    if (dominant === "anger") return "😠";
    if (dominant === "shame") return "😞";
    if (dominant === "confusion") return "😕";
    
    if (score > 0.5) return "😊";
    if (score > 0) return "🙂";
    if (score === 0) return "😐";
    if (score > -0.5) return "😕";
    return "😔";
  };

  return (
    <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 ${
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
              <span className="text-xs font-medium">You {message.sentiment && getSentimentEmoji(message.sentiment)}</span>
            )}
          </div>
          <span className="text-xs opacity-70 ml-2">{formatTime(message.timestamp)}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};
