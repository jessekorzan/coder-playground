
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCode, Palette, Zap } from 'lucide-react';
import { SyntaxHighlighter } from './SyntaxHighlighter';
import { CodeContextMenu } from './CodeContextMenu';

interface CodeEditorProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  onHtmlChange: (code: string) => void;
  onCssChange: (code: string) => void;
  onJsChange: (code: string) => void;
  onAiRequest?: (prompt: string) => void;
}

export const CodeEditor = ({
  htmlCode,
  cssCode,
  jsCode,
  onHtmlChange,
  onCssChange,
  onJsChange,
  onAiRequest,
}: CodeEditorProps) => {
  const [activeTab, setActiveTab] = useState('html');
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    selectedCode: string;
    language: 'html' | 'css' | 'javascript';
  }>({
    visible: false,
    x: 0,
    y: 0,
    selectedCode: '',
    language: 'html',
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, onChange: (code: string) => void) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      // Insert two spaces at the cursor position
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>, language: 'html' | 'css' | 'javascript') => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Only show context menu if text is selected
    if (start !== end) {
      e.preventDefault();
      
      const selectedText = textarea.value.substring(start, end);
      
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        selectedCode: selectedText,
        language,
      });
    }
  };

  const handleAiAction = (action: string, code: string, language: string) => {
    if (!onAiRequest) return;

    let prompt = '';
    switch (action) {
      case 'debug':
        prompt = `Help me debug this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nWhat issues do you see and how can I fix them?`;
        break;
      case 'explain':
        prompt = `Please explain what this ${language} code does:\n\n\`\`\`${language}\n${code}\n\`\`\``;
        break;
      case 'improve':
        prompt = `Is there a better way to write this ${language} code?\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nPlease suggest improvements for performance, readability, or best practices.`;
        break;
      case 'surprise':
        prompt = `Here's some ${language} code I wrote:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\nSurprise me! What creative improvements, features, or alternatives can you suggest?`;
        break;
    }

    onAiRequest(prompt);
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 h-12">
          <TabsTrigger 
            value="html" 
            className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 font-medium text-sm data-[state=active]:border-b-2 data-[state=active]:border-gray-900 dark:data-[state=active]:border-white rounded-none"
          >
            <FileCode className="w-4 h-4" />
            <span>HTML</span>
          </TabsTrigger>
          <TabsTrigger 
            value="css" 
            className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 font-medium text-sm data-[state=active]:border-b-2 data-[state=active]:border-gray-900 dark:data-[state=active]:border-white rounded-none"
          >
            <Palette className="w-4 h-4" />
            <span>CSS</span>
          </TabsTrigger>
          <TabsTrigger 
            value="js" 
            className="flex items-center space-x-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 font-medium text-sm data-[state=active]:border-b-2 data-[state=active]:border-gray-900 dark:data-[state=active]:border-white rounded-none"
          >
            <Zap className="w-4 h-4" />
            <span>JavaScript</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="html" className="h-full m-0">
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <p>Edit your HTML structure</p>
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={htmlCode}
                  onChange={(e) => onHtmlChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, onHtmlChange)}
                  onContextMenu={(e) => handleContextMenu(e, 'html')}
                  className="absolute inset-0 w-full h-full p-6 font-mono text-sm border-0 resize-none focus:outline-none bg-transparent text-transparent caret-gray-900 dark:caret-gray-100 z-10"
                  placeholder="Start typing your HTML here..."
                  spellCheck={false}
                />
                <div className="absolute inset-0 p-6 pointer-events-none overflow-auto">
                  <SyntaxHighlighter
                    code={htmlCode || "Start typing your HTML here..."}
                    language="html"
                    className="text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="css" className="h-full m-0">
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <p>Style your webpage with CSS</p>
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={cssCode}
                  onChange={(e) => onCssChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, onCssChange)}
                  onContextMenu={(e) => handleContextMenu(e, 'css')}
                  className="absolute inset-0 w-full h-full p-6 font-mono text-sm border-0 resize-none focus:outline-none bg-transparent text-transparent caret-gray-900 dark:caret-gray-100 z-10"
                  placeholder="/* Add your CSS styles here */
body {
  background-color: lightblue;
  font-family: Arial, sans-serif;
}"
                  spellCheck={false}
                />
                <div className="absolute inset-0 p-6 pointer-events-none overflow-auto">
                  <SyntaxHighlighter
                    code={cssCode || "/* Add your CSS styles here */\nbody {\n  background-color: lightblue;\n  font-family: Arial, sans-serif;\n}"}
                    language="css"
                    className="text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="js" className="h-full m-0">
            <div className="h-full flex flex-col">
              <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <p>Add interactivity with JavaScript</p>
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={jsCode}
                  onChange={(e) => onJsChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, onJsChange)}
                  onContextMenu={(e) => handleContextMenu(e, 'javascript')}
                  className="absolute inset-0 w-full h-full p-6 font-mono text-sm border-0 resize-none focus:outline-none bg-transparent text-transparent caret-gray-900 dark:caret-gray-100 z-10"
                  placeholder="// Add your JavaScript code here
document.getElementById('myButton').addEventListener('click', function() {
  alert('Hello World!');
});"
                  spellCheck={false}
                />
                <div className="absolute inset-0 p-6 pointer-events-none overflow-auto">
                  <SyntaxHighlighter
                    code={jsCode || "// Add your JavaScript code here\ndocument.getElementById('myButton').addEventListener('click', function() {\n  alert('Hello World!');\n});"}
                    language="javascript"
                    className="text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      <CodeContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        selectedCode={contextMenu.selectedCode}
        language={contextMenu.language}
        onClose={closeContextMenu}
        onAction={handleAiAction}
      />
    </div>
  );
};
