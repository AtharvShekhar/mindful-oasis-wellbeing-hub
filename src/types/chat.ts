
export type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  sentiment?: {
    score: number;
    dominant: string;
    emotions?: Record<string, number>;
  };
};
