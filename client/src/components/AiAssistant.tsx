
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AiAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi there, Code Cadet! 👋 I'm your AI learning assistant. I'm here to help you learn HTML, CSS, and JavaScript! Ask me anything like:\n\n• How do I change text color?\n• How do I make a button?\n• What does this code do?\n• How do I center text?\n\nWhat would you like to learn today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (in a real app, this would call an actual AI API)
    setTimeout(() => {
      const responses = [
        "Great question! Let me help you with that. To change text color in CSS, you can use the `color` property. For example:\n\n```css\nh1 {\n  color: red;\n}\n```\n\nThis will make all h1 headings red. You can use color names like 'blue', 'green', or hex codes like '#FF6B6B' for custom colors!",
        
        "To create a button in HTML, use the `<button>` tag:\n\n```html\n<button>Click me!</button>\n```\n\nTo make it interactive with JavaScript:\n\n```javascript\ndocument.querySelector('button').addEventListener('click', function() {\n  alert('Button clicked!');\n});\n```\n\nTry adding this to your code and see what happens!",
        
        "To center text, you can use CSS:\n\n```css\ntext-align: center;\n```\n\nFor example:\n```css\nh1 {\n  text-align: center;\n}\n```\n\nThis will center all your h1 headings. You can also center other elements like paragraphs (`p`) or divs!",
        
        "That's a great coding question! The key to learning web development is practice and experimentation. Try making small changes to your code and see what happens. Don't worry about breaking anything - that's how we learn! What specific part would you like me to explain?",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      inputRef.current?.focus();
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Learning Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ask me anything about coding!</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <Bot className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  )}
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-300 dark:bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-300 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-300 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about HTML, CSS, or JavaScript..."
            className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!inputValue.trim() || isLoading} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
