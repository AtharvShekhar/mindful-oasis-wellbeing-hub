
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { ChatContainer } from "@/components/chat/ChatContainer";

const Chat = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <Layout>
      <ChatContainer />
    </Layout>
  );
};

export default Chat;
