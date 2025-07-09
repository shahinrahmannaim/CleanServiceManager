import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('Connected to chatbot WebSocket');
        setWs(socket);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'booking_assignment' || data.type === 'booking_update') {
          addMessage(data.message, 'bot');
        }
      };

      socket.onclose = () => {
        console.log('Disconnected from chatbot WebSocket');
        setWs(null);
      };

      return () => {
        socket.close();
      };
    }
  }, [isOpen, user]);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !ws) return;

    addMessage(inputMessage, 'user');
    
    // Send message to WebSocket
    ws.send(JSON.stringify({
      type: 'chat_message',
      message: inputMessage,
      userId: user?.id,
    }));

    // Simple bot responses for demonstration
    setTimeout(() => {
      let botResponse = "I'm here to help with your cleaning service needs. How can I assist you today?";
      
      const lowerMessage = inputMessage.toLowerCase();
      if (lowerMessage.includes('book') || lowerMessage.includes('service')) {
        botResponse = "I can help you book a cleaning service! You can browse our services and book directly from the services page.";
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        botResponse = "Our cleaning service prices vary by type. Home cleaning starts at 150 QAR, AC cleaning at 120 QAR, and office cleaning at 200 QAR.";
      } else if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) {
        botResponse = "We offer flexible scheduling including same-day service if you book before 12 PM. What time works best for you?";
      }
      
      addMessage(botResponse, 'bot');
    }, 1000);

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 h-96 flex flex-col shadow-xl">
        <CardHeader className="bg-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Panaroma Assistant</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Welcome to Panaroma! How can I help you today?</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
