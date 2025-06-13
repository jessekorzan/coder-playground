
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCode, Palette, Zap } from 'lucide-react';
import { SyntaxHighlighter } from './SyntaxHighlighter';

interface CodeEditorProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  onHtmlChange: (code: string) => void;
  onCssChange: (code: string) => void;
  onJsChange: (code: string) => void;
}

export const CodeEditor = ({
  htmlCode,
  cssCode,
  jsCode,
  onHtmlChange,
  onCssChange,
  onJsChange,
}: CodeEditorProps) => {
  const [activeTab, setActiveTab] = useState('html');

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
    </div>
  );
};
