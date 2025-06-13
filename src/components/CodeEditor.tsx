

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCode, Palette, Zap } from 'lucide-react';

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

  return (
    <div className="h-full bg-white dark:bg-gray-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <TabsTrigger 
            value="html" 
            className="flex items-center space-x-2 data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900 data-[state=active]:text-orange-700 dark:data-[state=active]:text-orange-300 dark:text-gray-300"
          >
            <FileCode className="w-4 h-4" />
            <span>index.html</span>
          </TabsTrigger>
          <TabsTrigger 
            value="css" 
            className="flex items-center space-x-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 dark:text-gray-300"
          >
            <Palette className="w-4 h-4" />
            <span>style.css</span>
          </TabsTrigger>
          <TabsTrigger 
            value="js" 
            className="flex items-center space-x-2 data-[state=active]:bg-yellow-100 dark:data-[state=active]:bg-yellow-900 data-[state=active]:text-yellow-700 dark:data-[state=active]:text-yellow-300 dark:text-gray-300"
          >
            <Zap className="w-4 h-4" />
            <span>script.js</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="html" className="h-full m-0">
            <div className="h-full flex flex-col">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
                <p>✏️ Edit your HTML here (only the content inside &lt;body&gt; tags):</p>
              </div>
              <textarea
                value={htmlCode}
                onChange={(e) => onHtmlChange(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="Start typing your HTML here..."
                spellCheck={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="css" className="h-full m-0">
            <div className="h-full flex flex-col">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
                <p>🎨 Style your webpage with CSS:</p>
              </div>
              <textarea
                value={cssCode}
                onChange={(e) => onCssChange(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="/* Add your CSS styles here */
body {
  background-color: lightblue;
  font-family: Arial, sans-serif;
}"
                spellCheck={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="js" className="h-full m-0">
            <div className="h-full flex flex-col">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-b dark:border-gray-700">
                <p>⚡ Add interactivity with JavaScript:</p>
              </div>
              <textarea
                value={jsCode}
                onChange={(e) => onJsChange(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm border-0 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-200 dark:focus:ring-yellow-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                placeholder="// Add your JavaScript code here
document.getElementById('myButton').addEventListener('click', function() {
  alert('Hello World!');
});"
                spellCheck={false}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

