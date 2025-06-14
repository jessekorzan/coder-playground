
import { useState, useEffect } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { AiAssistant } from '@/components/AiAssistant';
import { Button } from '@/components/ui/button';
import { Eye, Download, Moon, Sun } from 'lucide-react';
import { generateZip } from '@/utils/zipUtils';

const Index = () => {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [leftPanelWidth, setLeftPanelWidth] = useState(70); // Percentage

  const handleAiRequest = (prompt: string) => {
    setAiPrompt(prompt);
  };

  const handlePromptProcessed = () => {
    setAiPrompt('');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
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
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
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

  const handlePreview = () => {
    const previewContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Cadet Preview</title>
    <style>
        ${cssCode}
    </style>
</head>
<body>
    ${htmlCode}
    <script>
        ${jsCode}
    </script>
</body>
</html>`;

    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(previewContent);
      newWindow.document.close();
    }
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
                onClick={handlePreview}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
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

        {/* Right Panel - AI Assistant */}
        <div 
          className="bg-gray-50 dark:bg-gray-800"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <AiAssistant 
            externalPrompt={aiPrompt}
            onPromptProcessed={handlePromptProcessed}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
