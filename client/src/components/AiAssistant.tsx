import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Lightbulb, Copy, Plus, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: CodeSuggestion[];
}

interface CodeSuggestion {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
}

interface AiAssistantProps {
  externalPrompt?: string;
  onPromptProcessed?: () => void;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  onApplyCode?: (code: string, language: string) => Promise<void>;
  preservedScrollPosition?: number;
  isVisible?: boolean;
}

export const AiAssistant = ({ 
  externalPrompt, 
  onPromptProcessed, 
  htmlCode = '', 
  cssCode = '', 
  jsCode = '', 
  onApplyCode,
  preservedScrollPosition = 0,
  isVisible = true
}: AiAssistantProps = {}) => {
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

Or type **"suggestions"** to get AI-powered code recommendations based on your current project!

**What would you like to learn today?**`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate code suggestions based on current project
  const generateCodeSuggestions = async () => {
    setIsLoadingSuggestions(true);

    try {
      const codeContext = {
        html: htmlCode.trim(),
        css: cssCode.trim(),
        js: jsCode.trim(),
        hasContent: Boolean(htmlCode.trim() || cssCode.trim() || jsCode.trim())
      };

      let analysisPrompt = '';

      if (!codeContext.hasContent) {
        analysisPrompt = `I'm starting a new web project. Give me 3 practical code snippet recommendations to help me get started. Format each recommendation as:

**[Title]**
Brief description
\`\`\`[language]
code snippet
\`\`\`

Focus on:
1. Basic HTML structure
2. Colourful and bold CSS styling
3. Fun visual JavaScript elements`;
      } else {
        analysisPrompt = `Analyze this code and provide 3 specific improvement recommendations:

HTML:
\`\`\`html
${codeContext.html || '(empty)'}
\`\`\`

CSS:
\`\`\`css
${codeContext.css || '(empty)'}
\`\`\`

JavaScript:
\`\`\`javascript
${codeContext.js || '(empty)'}
\`\`\`

Format each recommendation as:
**[Title]**
Brief description
\`\`\`[language]
code snippet
\`\`\`

Focus on fun improvements like colors, animations, interactive elements, or cool visual effects. IMPORTANT - Respond with ONLY the formatted recommendations. Do NOT add anything else.`;
      }

      const aiResponse = await fetch('https://n8n-service-u37x.onrender.com/webhook/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: analysisPrompt
        }),
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        let aiContent = data.data || data.output || data.response || data.message || '';

        // Clean up HTML tags if present
        if (typeof aiContent === 'string' && aiContent.includes('<')) {
          aiContent = aiContent
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

        // Parse recommendations from AI response
        const recommendationBlocks = aiContent.split('**').filter((block: string) => block.trim());
        const parsedRecommendations: CodeSuggestion[] = [];

        for (let i = 0; i < recommendationBlocks.length; i += 2) {
          if (recommendationBlocks[i] && recommendationBlocks[i + 1]) {
            const title = recommendationBlocks[i].trim();
            const content = recommendationBlocks[i + 1].trim();

            // Extract code snippet if present
            const codeMatch = content.match(/```(\w+)?\s*([\s\S]*?)```/);
            const description = content.replace(/```[\s\S]*?```/g, '').trim();

            parsedRecommendations.push({
              id: Date.now() + i + '',
              title,
              description,
              code: codeMatch ? codeMatch[2].trim() : '',
              language: codeMatch ? codeMatch[1] || 'html' : 'html'
            });
          }
        }

        // Add suggestions message to chat
        const suggestionsMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Here are some code suggestions for your project:`,
          timestamp: new Date(),
          suggestions: parsedRecommendations
        };

        setMessages(prev => [...prev, suggestionsMessage]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

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
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Restore scroll position when returning to AI tab
  useEffect(() => {
    if (isVisible && preservedScrollPosition > 0) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = preservedScrollPosition;
        }
      }, 50);
    }
  }, [isVisible, preservedScrollPosition]);

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

    // Check if user is asking for suggestions
    const lowerInput = currentInput.toLowerCase();
    if (lowerInput.includes('suggestion') || lowerInput.includes('recommend') || lowerInput === 'suggestions') {
      generateCodeSuggestions();
    } else {
      await handleAIRequest(currentInput);
    }
  };

  // Apply code suggestion
  const applySuggestion = async (suggestion: CodeSuggestion) => {
    if (!onApplyCode) return;

    setApplyingCode(suggestion.id);
    try {
      await onApplyCode(suggestion.code, suggestion.language);
    } catch (error) {
      console.error('Error applying suggestion:', error);
    } finally {
      setApplyingCode(null);
    }
  };

  // Copy code to clipboard
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Failed to copy code:', error);
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
      <div className="flex-1 p-4">
        <div className="space-y-4 pb-4" ref={containerRef}>
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
                      <>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {message.suggestions.map((suggestion) => (
                              <div 
                                key={suggestion.id}
                                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    {suggestion.title}
                                  </h4>
                                  <div className="flex items-center space-x-1 ml-2">
                                    <Button
                                      onClick={() => copyToClipboard(suggestion.code)}
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    {onApplyCode && (
                                      <Button
                                        onClick={() => applySuggestion(suggestion)}
                                        disabled={applyingCode === suggestion.id}
                                        size="sm"
                                        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white h-7 text-xs px-3 rounded-md font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                      >
                                        {applyingCode === suggestion.id ? (
                                          <>
                                            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                            Applying...
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="w-3 h-3 mr-1.5" />
                                            Apply
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {suggestion.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {suggestion.description}
                                  </p>
                                )}

                                {suggestion.code && (
                                  <div className="bg-gray-900 dark:bg-black rounded p-3 border border-gray-700 dark:border-gray-600">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs text-gray-400 uppercase font-medium">
                                        {suggestion.language}
                                      </span>
                                    </div>
                                    <pre className="text-sm text-green-400 dark:text-green-300 overflow-x-auto font-mono leading-relaxed">
                                      <code className="text-green-400 dark:text-green-300">{suggestion.code}</code>
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(isLoading || isLoadingSuggestions) && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  {isLoadingSuggestions ? (
                    <Lightbulb className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  )}
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-300 dark:bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-300 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-300 dark:bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isLoadingSuggestions ? 'Analyzing your code...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 mb-2">
          <Button
            onClick={generateCodeSuggestions}
            disabled={isLoadingSuggestions}
            variant="outline"
            size="sm"
            className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900 dark:hover:bg-purple-800 dark:border-purple-700 dark:text-purple-300"
          >
            {isLoadingSuggestions ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Get Code Suggestions
              </>
            )}
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about HTML, CSS, JavaScript, or type 'suggestions'..."
            className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <Button type="submit" disabled={!inputValue.trim() || isLoading || isLoadingSuggestions} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};