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

interface AiAssistantProps {
  externalPrompt?: string;
  onPromptProcessed?: () => void;
}

export const AiAssistant = ({ externalPrompt, onPromptProcessed }: AiAssistantProps = {}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `# Hi there, Code Cadet! 👋

I'm your AI learning assistant. I'm here to help you learn **HTML**, **CSS**, and **JavaScript**!

## Ask me anything like:

- How do I change text color?
- How do I make a button?
- What does this code do?
- How do I center text?

---

**What would you like to learn today?**`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAIRequest = async (prompt: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('https://n8n-service-u37x.onrender.com/webhook/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: prompt
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let aiResponse = data.data || data.output || data.response || data.message || 'Sorry, I couldn\'t process your request right now. Please try again.';
      
      if (typeof aiResponse === 'string' && aiResponse.includes('<')) {
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
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again in a moment.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  };

  // Handle external prompts from context menu
  useEffect(() => {
    if (externalPrompt) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: externalPrompt,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      handleAIRequest(externalPrompt);
      onPromptProcessed?.();
    }
  }, [externalPrompt]);

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

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    await handleAIRequest(currentInput);
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
                className={`max-w-[85%] rounded-lg ${
                  message.type === 'user'
                    ? 'bg-indigo-500 text-white p-3'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm text-gray-900 dark:text-gray-100 py-4 px-3'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <Bot className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  )}
                  {message.type === 'user' && (
                    <User className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                  )}
                  <div className="text-sm markdown-content min-w-0 flex-1">
                    {message.type === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
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