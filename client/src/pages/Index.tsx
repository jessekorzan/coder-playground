
import { useState, useEffect, useRef } from 'react';
import { CodeEditor, CodeEditorRef } from '@/components/CodeEditor';
import { AiAssistant } from '@/components/AiAssistant';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Download, Moon, Sun, Bot, Monitor, Lightbulb, Copy, Plus, Loader2 } from 'lucide-react';
import { generateZip } from '@/utils/zipUtils';

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
  const [iframeKey, setIframeKey] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [applyingRecommendation, setApplyingRecommendation] = useState<string | null>(null);
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

  // Analyze code context and generate AI recommendations
  const generateCodeRecommendations = async () => {
    try {
      setIsLoadingRecommendations(true);
      setShowRecommendations(true);
      
      // Analyze current code context
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
2. Simple CSS styling
3. Interactive JavaScript element`;
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

Focus on fun improvements like colors, animations, interactive elements, or cool visual effects that kids would enjoy.`;
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
        const parsedRecommendations = [];
        
        for (let i = 0; i < recommendationBlocks.length; i += 2) {
          if (recommendationBlocks[i] && recommendationBlocks[i + 1]) {
            const title = recommendationBlocks[i].trim();
            const content = recommendationBlocks[i + 1].trim();
            
            // Extract code snippet if present
            const codeMatch = content.match(/```(\w+)?\s*([\s\S]*?)```/);
            const description = content.replace(/```[\s\S]*?```/g, '').trim();
            
            parsedRecommendations.push({
              id: Date.now() + i,
              title,
              description,
              code: codeMatch ? codeMatch[2].trim() : '',
              language: codeMatch ? codeMatch[1] || 'html' : 'html'
            });
          }
        }

        setRecommendations(parsedRecommendations);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
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

  // Apply a code recommendation to the editor with AI-powered refactoring
  const applyRecommendation = async (recommendation: any) => {
    const { code, language, id } = recommendation;
    setApplyingRecommendation(id);
    
    // First, merge the code intelligently
    let mergedCode = '';
    let targetLanguage = language.toLowerCase();
    
    switch (targetLanguage) {
      case 'html':
        mergedCode = mergeHtmlCode(htmlCode, code);
        break;
      case 'css':
        mergedCode = mergeCssCode(cssCode, code);
        break;
      case 'javascript':
      case 'js':
        mergedCode = mergeJsCode(jsCode, code);
        targetLanguage = 'javascript';
        break;
      default:
        mergedCode = mergeHtmlCode(htmlCode, code);
        targetLanguage = 'html';
    }
    
    // Ask AI to refactor the merged code for validity and error-free output
    try {
      const refactorPrompt = `Please refactor this ${targetLanguage} code to ensure it's valid, error-free, and follows best practices. Return only the cleaned code without explanations:

\`\`\`${targetLanguage}
${mergedCode}
\`\`\`

Requirements:
- Fix any syntax errors
- Ensure proper formatting and indentation
- Remove any duplicates or conflicts
- Make sure the code is functional and valid
- Keep the code beginner-friendly for kids learning to code

Return only the refactored ${targetLanguage} code:`;

      const aiResponse = await fetch('https://n8n-service-u37x.onrender.com/webhook/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatInput: refactorPrompt
        }),
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        let refactoredCode = data.data || data.output || data.response || data.message || mergedCode;
        
        // Clean up AI response to extract just the code
        if (typeof refactoredCode === 'string') {
          // Remove markdown code blocks if present
          refactoredCode = refactoredCode.replace(/```[\w]*\n/g, '').replace(/```/g, '').trim();
          
          // Remove any explanatory text before or after code
          const codeBlockMatch = refactoredCode.match(new RegExp(`(<!DOCTYPE|<html|<head|<body|\\.|#|function|var|let|const|/\\*).*`, 's'));
          if (codeBlockMatch) {
            refactoredCode = codeBlockMatch[0];
          }
        }
        
        // Apply the refactored code
        switch (targetLanguage) {
          case 'html':
            setHtmlCode(refactoredCode);
            break;
          case 'css':
            setCssCode(refactoredCode);
            break;
          case 'javascript':
            setJsCode(refactoredCode);
            break;
        }
      } else {
        // Fallback to merged code if AI refactoring fails
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
      }
    } catch (error) {
      console.error('Error refactoring code:', error);
      // Fallback to merged code if AI refactoring fails
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
    } finally {
      setApplyingRecommendation(null);
    }
    
    // Switch to the appropriate tab
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
          <Tabs value={activeAssistantTab} onValueChange={setActiveAssistantTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-12 flex-shrink-0">
              <TabsTrigger 
                value="ai" 
                className="flex items-center space-x-2 data-[state=active]:bg-gray-50 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 font-medium text-sm rounded-none"
              >
                <Bot className="w-4 h-4" />
                <span>AI Chat</span>
              </TabsTrigger>
              <TabsTrigger 
                value="recommendations" 
                className="flex items-center space-x-2 data-[state=active]:bg-gray-50 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 font-medium text-sm rounded-none"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Suggestions</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="flex items-center space-x-2 data-[state=active]:bg-gray-50 dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 font-medium text-sm rounded-none"
              >
                <Monitor className="w-4 h-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="ai" className="flex-1 m-0 p-0 h-0 overflow-hidden">
              <div className="h-full">
                <AiAssistant 
                  externalPrompt={aiPrompt}
                  onPromptProcessed={handlePromptProcessed}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="flex-1 m-0 p-0 h-0 overflow-hidden">
              <div className="h-full flex flex-col bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="p-4 border-b bg-white dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Code Suggestions</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered recommendations for your code</p>
                      </div>
                    </div>
                    <Button
                      onClick={generateCodeRecommendations}
                      disabled={isLoadingRecommendations}
                      size="sm"
                      className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
                    >
                      {isLoadingRecommendations ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Get Suggestions
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {recommendations.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Lightbulb className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Suggestions Yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Get AI-powered code recommendations based on your current work
                        </p>
                        <Button
                          onClick={generateCodeRecommendations}
                          disabled={isLoadingRecommendations}
                          className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
                        >
                          {isLoadingRecommendations ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Lightbulb className="w-4 h-4 mr-2" />
                              Analyze My Code
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    recommendations.map((recommendation) => (
                      <div 
                        key={recommendation.id}
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {recommendation.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => copyToClipboard(recommendation.code)}
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => applyRecommendation(recommendation)}
                              disabled={applyingRecommendation === recommendation.id}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white h-8 disabled:opacity-50"
                            >
                              {applyingRecommendation === recommendation.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  Applying...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Apply
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {recommendation.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {recommendation.description}
                          </p>
                        )}
                        
                        {recommendation.code && (
                          <div className="bg-gray-900 dark:bg-gray-950 rounded-md p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-400 uppercase font-medium">
                                {recommendation.language}
                              </span>
                            </div>
                            <pre className="text-sm text-gray-100 overflow-x-auto">
                              <code>{recommendation.code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="flex-1 m-0 p-0 h-0 overflow-hidden">
              <div className="h-full bg-white dark:bg-gray-900 relative">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
