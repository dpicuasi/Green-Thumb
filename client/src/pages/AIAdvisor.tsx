import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useTranslation } from "react-i18next";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAdvisor() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t("chat.welcome", { defaultValue: 'Hello! I am your AI Plant Advisor. Ask me anything about plant care, diagnosing issues, or local growing tips.' }) }
  ]);
  const [input, setInput] = useState("");
  
  // Fake mutation since we don't have the real endpoint fully wired in the prompt context
  // In a real app, this would hit the /api/chat endpoint
  const sendMessage = async (text: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Here is some advice about "${text}". Keep your soil moist but not waterlogged, and ensure adequate indirect sunlight!`;
  };

  const { mutate: send, isPending } = useMutation({
    mutationFn: sendMessage,
    onSuccess: (response) => {
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    send(userMsg);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-display font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          {t("chat.title")}
        </h1>
        <p className="text-muted-foreground">{t("chat.subtitle", { defaultValue: "Your expert botanist in your pocket." })}</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm border-border/50 shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-br-none' 
                  : 'bg-white border border-border/50 rounded-bl-none shadow-sm'
              }`}>
                {msg.content}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="bg-white border border-border/50 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-75" />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-border/50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              className="flex-1 rounded-xl bg-secondary/30 border-transparent focus:bg-white focus:border-primary transition-all"
            />
            <Button type="submit" size="icon" disabled={isPending || !input.trim()} className="rounded-xl shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
