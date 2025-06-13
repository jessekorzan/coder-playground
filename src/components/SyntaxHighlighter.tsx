
import React from 'react';

interface SyntaxHighlighterProps {
  code: string;
  language: 'html' | 'css' | 'javascript';
  className?: string;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language,
  className = '',
}) => {
  const highlightCode = (code: string, lang: 'html' | 'css' | 'javascript') => {
    if (!code) return '';

    // Escape HTML first
    let highlightedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    switch (lang) {
      case 'html':
        // HTML attribute values (strings) - do this first
        highlightedCode = highlightedCode.replace(
          /=(&quot;[^&]*&quot;|&#x27;[^&]*&#x27;|"[^"]*"|'[^']*')/g,
          '=<span class="text-orange-600 dark:text-orange-400">$1</span>'
        );
        
        // HTML attributes
        highlightedCode = highlightedCode.replace(
          /\s([a-zA-Z-]+)=/g,
          ' <span class="text-green-600 dark:text-green-400">$1</span>='
        );
        
        // HTML tags
        highlightedCode = highlightedCode.replace(
          /(&lt;\/?)([\w-]+)/g,
          '$1<span class="text-blue-600 dark:text-blue-400 font-semibold">$2</span>'
        );
        
        // HTML tag brackets
        highlightedCode = highlightedCode.replace(
          /(&lt;|&gt;)/g,
          '<span class="text-blue-600 dark:text-blue-400 font-semibold">$1</span>'
        );
        
        // HTML comments
        highlightedCode = highlightedCode.replace(
          /(&lt;!--.*?--&gt;)/gs,
          '<span class="text-gray-500 dark:text-gray-400 italic">$1</span>'
        );
        break;

      case 'css':
        // CSS comments first
        highlightedCode = highlightedCode.replace(
          /(\/\*[\s\S]*?\*\/)/g,
          '<span class="text-gray-500 dark:text-gray-400 italic">$1</span>'
        );
        
        // CSS property values
        highlightedCode = highlightedCode.replace(
          /(:\s*)([^;{}]+)(;)/g,
          '$1<span class="text-green-600 dark:text-green-400">$2</span>$3'
        );
        
        // CSS properties
        highlightedCode = highlightedCode.replace(
          /([a-zA-Z-]+)(\s*:)/g,
          '<span class="text-blue-600 dark:text-blue-400">$1</span>$2'
        );
        
        // CSS selectors
        highlightedCode = highlightedCode.replace(
          /(^|[\s\n])([.#]?[a-zA-Z][a-zA-Z0-9-_]*)\s*(\{)/gm,
          '$1<span class="text-purple-600 dark:text-purple-400 font-semibold">$2</span> $3'
        );
        break;

      case 'javascript':
        // JavaScript comments first
        highlightedCode = highlightedCode.replace(
          /(\/\/.*$)/gm,
          '<span class="text-gray-500 dark:text-gray-400 italic">$1</span>'
        );
        highlightedCode = highlightedCode.replace(
          /(\/\*[\s\S]*?\*\/)/g,
          '<span class="text-gray-500 dark:text-gray-400 italic">$1</span>'
        );
        
        // JavaScript strings
        highlightedCode = highlightedCode.replace(
          /(['"`][^'"`]*['"`])/g,
          '<span class="text-green-600 dark:text-green-400">$1</span>'
        );
        
        // JavaScript keywords
        highlightedCode = highlightedCode.replace(
          /\b(function|var|let|const|if|else|for|while|return|true|false|null|undefined|document|console)\b/g,
          '<span class="text-purple-600 dark:text-purple-400 font-semibold">$1</span>'
        );
        
        // JavaScript methods
        highlightedCode = highlightedCode.replace(
          /\.([a-zA-Z][a-zA-Z0-9]*)\(/g,
          '.<span class="text-orange-600 dark:text-orange-400">$1</span>('
        );
        break;

      default:
        break;
    }

    return highlightedCode;
  };

  const highlightedCode = highlightCode(code, language);

  return (
    <div
      className={`font-mono text-sm whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};
