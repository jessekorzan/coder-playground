
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Keep focus on input immediately after clearing
    // Use requestAnimationFrame to ensure DOM updates are complete
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    try {
      // Call the actual AI webhook
      const response = await fetch('https://n8n-service-u37x.onrender.com/webhook/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: currentInput
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the AI response from the webhook response
      let aiResponse = data.data || data.output || data.response || data.message || 'Sorry, I couldn\'t process your request right now. Please try again.';
      
      // Convert HTML to plain text for better display in chat
      if (typeof aiResponse === 'string' && aiResponse.includes('<')) {
        // Remove HTML tags and convert to readable text
        aiResponse = aiResponse
          .replace(/<h3>/g, '\n**')
          .replace(/<\/h3>/g, '**\n')
          .replace(/<p>/g, '\n')
          .replace(/<\/p>/g, '\n')
          .replace(/<main>/g, '')
          .replace(/<\/main>/g, '')
          .replace(/<footer>/g, '\n\n---\n')
          .replace(/<\/footer>/g, '\n')
          .replace(/<section>/g, '\n\nSuggestions:')
          .replace(/<\/section>/g, '')
          .replace(/<a[^>]*onclick="[^"]*"[^>]*>/g, '• ')
          .replace(/<\/a>/g, '')
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .trim();
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI webhook:', error);
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again in a moment.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Ensure focus is restored after the loading state changes
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
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
                  <div className="text-sm">
                    {message.type === 'assistant' ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-sm dark:prose-invert max-w-none"
                        components={{
                          code: ({ inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                              <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs" {...props}>
                                {children}
                              </code>
                            );
                          },
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
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
          />
          <Button type="submit" disabled={!inputValue.trim() || isLoading} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
