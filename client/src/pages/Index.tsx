
import { useState, useEffect, useRef } from 'react';
import { CodeEditor, CodeEditorRef } from '@/components/CodeEditor';
import { AiAssistant } from '@/components/AiAssistant';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, Moon, Sun, Bot, Monitor } from 'lucide-react';
import { generateZip } from '@/utils/zipUtils';
import { API_CONFIG } from '@/config/constants';

const Index = () => {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(70); // Percentage
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [activeAssistantTab, setActiveAssistantTab] = useState('ai');
  const [aiAssistantScrollPosition, setAiAssistantScrollPosition] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const codeEditorRef = useRef<CodeEditorRef>(null);

  const handleAiRequest = (prompt: string) => {
    setAiPrompt(prompt);
    setActiveAssistantTab('ai'); // Switch to AI Assistant tab when context menu is used
  };

  const handlePromptProcessed = () => {
    setAiPrompt('');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      const containerWidth = window.innerWidth;
      const newLeftWidth = (e.clientX / containerWidth) * 100;
      
      // Constrain between 30% and 80%
      const clampedWidth = Math.min(Math.max(newLeftWidth, 30), 80);
      setLeftPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Create or update preview session
  const updatePreview = async () => {
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          htmlCode,
          cssCode,
          jsCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setPreviewUrl(data.previewUrl);
      }
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  };

  // Auto-update preview when code changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (htmlCode || cssCode || jsCode) {
        updatePreview().then(() => {
          // Force iframe reload to get the latest content
          setIframeKey(prev => prev + 1);
        });
      }
    }, 1000); // Debounce updates by 1 second

    return () => clearTimeout(timeoutId);
  }, [htmlCode, cssCode, jsCode]);

  // Set up WebSocket connection for live reload in embedded preview
  useEffect(() => {
    if (!sessionId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected for embedded preview');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'code-update' && data.sessionId === sessionId) {
          // Reload the iframe when we receive a code update
          setIframeKey(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      socket.close();
    };
  }, [sessionId]);

  const openPreview = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    } else {
      updatePreview().then(() => {
        if (previewUrl) {
          window.open(previewUrl, '_blank');
        }
      });
    }
  };

  const generatePreviewAndSwitchTab = async () => {
    await updatePreview();
    setActiveAssistantTab('preview');
  };

  const handleTabChange = (newTab: string) => {
    // Store scroll position when leaving AI tab
    if (activeAssistantTab === 'ai' && newTab !== 'ai') {
      const aiContainer = document.querySelector('.ai-assistant-container');
      if (aiContainer) {
        setAiAssistantScrollPosition(aiContainer.scrollTop);
      }
    }
    setActiveAssistantTab(newTab);
  };



  // Intelligently merge CSS code
  const mergeCssCode = (existingCss: string, newCss: string): string => {
    if (!existingCss.trim()) return newCss;
    
    // Parse existing CSS to extract selectors and rules
    const existingSelectors = new Map<string, string>();
    const selectorRegex = /([^{]+)\s*\{([^}]*)\}/g;
    let match;
    
    while ((match = selectorRegex.exec(existingCss)) !== null) {
      const selector = match[1].trim();
      const rules = match[2].trim();
      existingSelectors.set(selector, rules);
    }
    
    // Parse new CSS
    const newSelectors = new Map<string, string>();
    while ((match = selectorRegex.exec(newCss)) !== null) {
      const selector = match[1].trim();
      const rules = match[2].trim();
      newSelectors.set(selector, rules);
    }
    
    // Merge selectors
    newSelectors.forEach((newRules, selector) => {
      if (existingSelectors.has(selector)) {
        // Merge rules for existing selector
        const existingRules = existingSelectors.get(selector) || '';
        const mergedRules = mergecssRules(existingRules, newRules);
        existingSelectors.set(selector, mergedRules);
      } else {
        // Add new selector
        existingSelectors.set(selector, newRules);
      }
    });
    
    // Rebuild CSS
    let mergedCss = '';
    existingSelectors.forEach((rules, selector) => {
      mergedCss += `${selector} {\n  ${rules.split(';').filter((r: string) => r.trim()).join(';\n  ')};\n}\n\n`;
    });
    
    return mergedCss.trim();
  };
  
  // Merge CSS rules, preferring new values for conflicting properties
  const mergecssRules = (existingRules: string, newRules: string): string => {
    const existing: Record<string, string> = {};
    const newProps: Record<string, string> = {};
    
    // Parse existing rules
    existingRules.split(';').forEach(rule => {
      const [prop, value] = rule.split(':').map(s => s.trim());
      if (prop && value) existing[prop] = value;
    });
    
    // Parse new rules
    newRules.split(';').forEach(rule => {
      const [prop, value] = rule.split(':').map(s => s.trim());
      if (prop && value) newProps[prop] = value;
    });
    
    // Merge (new props override existing)
    const merged = { ...existing, ...newProps };
    
    return Object.entries(merged)
      .map(([prop, value]) => `${prop}: ${value}`)
      .join('; ');
  };
  
  // Intelligently merge HTML code
  const mergeHtmlCode = (existingHtml: string, newHtml: string): string => {
    if (!existingHtml.trim()) return newHtml;
    
    // If new HTML contains complete document structure, replace
    if (newHtml.includes('<html>') || newHtml.includes('<!DOCTYPE')) {
      return newHtml;
    }
    
    // If existing HTML has body tag, insert new content inside body
    const bodyMatch = existingHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      const bodyContent = bodyMatch[1].trim();
      const newBodyContent = bodyContent + '\n\n' + newHtml;
      return existingHtml.replace(/<body[^>]*>[\s\S]*<\/body>/i, `<body>\n${newBodyContent}\n</body>`);
    }
    
    // Otherwise append to existing content
    return existingHtml + '\n\n' + newHtml;
  };
  
  // Intelligently merge JavaScript code
  const mergeJsCode = (existingJs: string, newJs: string): string => {
    if (!existingJs.trim()) return newJs;
    
    // Check for function conflicts and variable redeclarations
    const functionRegex = /function\s+(\w+)\s*\(/g;
    const existingFunctions = new Set<string>();
    let match;
    
    while ((match = functionRegex.exec(existingJs)) !== null) {
      existingFunctions.add(match[1]);
    }
    
    // Check if new code conflicts with existing functions
    let processedNewJs = newJs;
    while ((match = functionRegex.exec(newJs)) !== null) {
      const funcName = match[1];
      if (existingFunctions.has(funcName)) {
        // Rename conflicting function
        const newName = `${funcName}_${Date.now()}`;
        processedNewJs = processedNewJs.replace(new RegExp(`\\b${funcName}\\b`, 'g'), newName);
      }
    }
    
    return existingJs + '\n\n// Applied suggestion\n' + processedNewJs;
  };

  // Apply code suggestion from unified AI Assistant with intelligent LLM-powered merging
  const handleApplyCode = async (code: string, language: string): Promise<void> => {
    let targetLanguage = language.toLowerCase();
    if (targetLanguage === 'js') {
      targetLanguage = 'javascript';
    }
    
    // Get current code based on target language
    let currentCode = '';
    switch (targetLanguage) {
      case 'html':
        currentCode = htmlCode;
        break;
      case 'css':
        currentCode = cssCode;
        break;
      case 'javascript':
        currentCode = jsCode;
        break;
      default:
        currentCode = htmlCode;
        targetLanguage = 'html';
    }

    // Step 1: Clear the current view
    switch (targetLanguage) {
      case 'html':
        setHtmlCode('');
        break;
      case 'css':
        setCssCode('');
        break;
      case 'javascript':
        setJsCode('');
        break;
    }

    // Step 2: Switch to the appropriate tab immediately
    switch (targetLanguage) {
      case 'html':
        codeEditorRef.current?.switchToTab('html');
        break;
      case 'css':
        codeEditorRef.current?.switchToTab('css');
        break;
      case 'javascript':
        codeEditorRef.current?.switchToTab('js');
        break;
    }

    // Step 3: Use LLM for intelligent merging
    let mergedCode = '';
    
    try {
      if (!currentCode.trim()) {
        // No existing code, just use the new suggestion
        mergedCode = code;
      } else {
        // Use AI to intelligently merge the existing code with the suggestion
        const mergePrompt = `You are reviewing existing ${targetLanguage} code and a new suggestion that needs to be merged intelligently.

EXISTING CODE:
\`\`\`${targetLanguage}
${currentCode}
\`\`\`

NEW SUGGESTION TO APPLY:
\`\`\`${targetLanguage}
${code}
\`\`\`

Please intelligently merge these together by:
1. Reviewing the existing code structure and functionality
2. Determining how best to integrate the new suggestion
3. Avoiding duplicate selectors/functions/elements
4. Preserving existing functionality while adding new features
5. Ensuring proper syntax and formatting
6. Making the code clean and well-organized

Return ONLY the complete merged ${targetLanguage} code with no explanations, markdown, or additional text:`;

        const aiResponse = await fetch(API_CONFIG.AI_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatInput: mergePrompt
          }),
        });

        if (aiResponse.ok) {
          const data = await aiResponse.json();
          let aiMergedCode = data.data || data.output || data.response || data.message;
          
          if (typeof aiMergedCode === 'string' && aiMergedCode.trim()) {
            // Clean up AI response to extract just the code
            aiMergedCode = aiMergedCode.replace(/```[\w]*\n/g, '').replace(/```/g, '').trim();
            
            // Remove any leading/trailing explanatory text
            const lines = aiMergedCode.split('\n');
            let startIndex = 0;
            let endIndex = lines.length - 1;
            
            // Find where actual code starts
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              if (targetLanguage === 'html' && (line.startsWith('<') || line.startsWith('<!DOCTYPE'))) {
                startIndex = i;
                break;
              } else if (targetLanguage === 'css' && (line.includes('{') || line.includes(':') || line.startsWith('/*') || /^[a-zA-Z#.]/.test(line))) {
                startIndex = i;
                break;
              } else if (targetLanguage === 'javascript' && (line.startsWith('//') || line.startsWith('/*') || line.includes('function') || line.includes('const') || line.includes('let') || line.includes('var') || line.includes('document') || line.includes('window') || /^[a-zA-Z_$]/.test(line))) {
                startIndex = i;
                break;
              }
            }
            
            // Find where actual code ends
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              if (line && !line.startsWith('Note:') && !line.startsWith('This') && !line.startsWith('The')) {
                endIndex = i;
                break;
              }
            }
            
            mergedCode = lines.slice(startIndex, endIndex + 1).join('\n').trim();
            
            // Fallback if extraction failed
            if (!mergedCode || mergedCode.length < Math.max(currentCode.length, code.length) * 0.5) {
              throw new Error('AI merge result too short, using fallback');
            }
          } else {
            throw new Error('Invalid AI response');
          }
        } else {
          throw new Error('AI request failed');
        }
      }

      // Step 4: Apply the merged code immediately
      switch (targetLanguage) {
        case 'html':
          setHtmlCode(mergedCode);
          break;
        case 'css':
          setCssCode(mergedCode);
          break;
        case 'javascript':
          setJsCode(mergedCode);
          break;
      }

    } catch (error) {
      console.error('Error with AI merging:', error);
      
      // Fallback to basic merging strategies
      try {
        switch (targetLanguage) {
          case 'html':
            mergedCode = mergeHtmlCode(currentCode, code);
            break;
          case 'css':
            mergedCode = mergeCssCode(currentCode, code);
            break;
          case 'javascript':
            mergedCode = mergeJsCode(currentCode, code);
            break;
        }

        switch (targetLanguage) {
          case 'html':
            setHtmlCode(mergedCode);
            break;
          case 'css':
            setCssCode(mergedCode);
            break;
          case 'javascript':
            setJsCode(mergedCode);
            break;
        }
      } catch (fallbackError) {
        console.error('Error with fallback merging:', fallbackError);
        
        // Ultimate fallback: just append the suggestion to existing code
        const ultimateFallback = currentCode + '\n\n' + code;
        switch (targetLanguage) {
          case 'html':
            setHtmlCode(ultimateFallback);
            break;
          case 'css':
            setCssCode(ultimateFallback);
            break;
          case 'javascript':
            setJsCode(ultimateFallback);
            break;
        }
      }
    }
  };

  // Copy code snippet to clipboard
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('codecadet-darkmode');
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Apply dark mode class to document and save preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('codecadet-darkmode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Initialize with default HTML boilerplate
  useEffect(() => {
    const savedHtml = localStorage.getItem('codecadet-html');
    const savedCss = localStorage.getItem('codecadet-css');
    const savedJs = localStorage.getItem('codecadet-js');

    if (savedHtml) {
      setHtmlCode(savedHtml);
    } else {
      const defaultHtml = `<h1>Welcome to Code Cadet!</h1>
<p>Start building your first webpage here. Try changing this text or adding new elements!</p>

<button id="my-button">Click me!</button>

<div class="my-box">
  <p>This is a styled box. Check out the CSS tab to see how it's styled!</p>
</div>`;
      setHtmlCode(defaultHtml);
    }

    if (savedCss) {
      setCssCode(savedCss);
    } else {
      const defaultCss = `/* Welcome to CSS! This is where you style your webpage */

body {
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  margin: 0;
}

h1 {
  color: #FFE55C;
  text-align: center;
  font-size: 2.5em;
}

.my-box {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

#my-button {
  background: #FF6B6B;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

#my-button:hover {
  background: #FF5252;
  transform: scale(1.05);
}`;
      setCssCode(defaultCss);
    }

    if (savedJs) {
      setJsCode(savedJs);
    } else {
      const defaultJs = `// Welcome to JavaScript! This is where you make your webpage interactive

// This code runs when the button is clicked
document.getElementById('my-button').addEventListener('click', function() {
  alert('Hello from your first JavaScript code! 🎉');
});

// Try changing the alert message above or adding new interactive features!`;
      setJsCode(defaultJs);
    }
  }, []);

  // Save to localStorage whenever code changes
  useEffect(() => {
    localStorage.setItem('codecadet-html', htmlCode);
  }, [htmlCode]);

  useEffect(() => {
    localStorage.setItem('codecadet-css', cssCode);
  }, [cssCode]);

  useEffect(() => {
    localStorage.setItem('codecadet-js', jsCode);
  }, [jsCode]);

  const handleDownload = () => {
    generateZip(htmlCode, cssCode, jsCode);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-medium text-gray-900 dark:text-white">code cadet</h1>
              <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">Your coding workspace</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={toggleDarkMode}
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-0"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                onClick={openPreview}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-2" />
                Live Preview
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium px-4 py-2 rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Code Editor */}
        <div 
          className="border-r border-gray-100 dark:border-gray-700"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <CodeEditor
            ref={codeEditorRef}
            htmlCode={htmlCode}
            cssCode={cssCode}
            jsCode={jsCode}
            onHtmlChange={setHtmlCode}
            onCssChange={setCssCode}
            onJsChange={setJsCode}
            onAiRequest={handleAiRequest}
          />
        </div>

        {/* Resize Handle */}
        <div 
          className="w-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-col-resize flex-shrink-0 transition-colors duration-150"
          onMouseDown={handleMouseDown}
        />

        {/* Right Panel - Assistant with Tabs */}
        <div 
          className="bg-gray-50 dark:bg-gray-800 flex flex-col"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          {/* Tab Headers */}
          <div className="grid w-full grid-cols-2 rounded-none border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-12 flex-shrink-0">
            <button 
              onClick={() => handleTabChange('ai')}
              className={`flex items-center justify-center space-x-2 font-medium text-sm ${
                activeAssistantTab === 'ai' 
                  ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Assistant</span>
            </button>
            <button 
              onClick={() => handleTabChange('preview')}
              className={`flex items-center justify-center space-x-2 font-medium text-sm ${
                activeAssistantTab === 'preview' 
                  ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Preview</span>
            </button>
          </div>
          
          {/* AI Assistant - Always mounted, conditionally visible */}
          <div className={`flex-1 overflow-y-auto ${activeAssistantTab === 'ai' ? 'block' : 'hidden'}`}>
            <AiAssistant 
              externalPrompt={aiPrompt}
              onPromptProcessed={handlePromptProcessed}
              htmlCode={htmlCode}
              cssCode={cssCode}
              jsCode={jsCode}
              onApplyCode={handleApplyCode}
              preservedScrollPosition={aiAssistantScrollPosition}
              isVisible={activeAssistantTab === 'ai'}
            />
          </div>

          {/* Preview - Only show when active */}
          {activeAssistantTab === 'preview' && (
            <div className="flex-1 bg-white dark:bg-gray-900 relative">
              {previewUrl ? (
                <>
                  <iframe 
                    key={iframeKey}
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Live Preview"
                  />
                  {/* Overlay during drag to prevent iframe from capturing mouse events */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-transparent cursor-col-resize z-50" />
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                  <div className="text-center">
                    <Monitor className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Preview Available</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Start coding to see your live preview here
                    </p>
                    <Button
                      onClick={generatePreviewAndSwitchTab}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Generate Preview
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
