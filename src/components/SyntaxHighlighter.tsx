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
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    switch (lang) {
      case 'html':
        // HTML comments first (highest priority)
        highlightedCode = highlightedCode.replace(
          /(&lt;!--.*?--&gt;)/gs,
          '<span class="text-gray-500 dark:text-gray-400 italic">$1</span>'
        );
        
        // HTML attribute values (strings in quotes)
        highlightedCode = highlightedCode.replace(
          /=(&quot;[^&quot;]*&quot;|&#x27;[^&#x27;]*&#x27;)/g,
          '=<span class="text-orange-600 dark:text-orange-400">$1</span>'
        );
        
        // HTML attributes (attribute names before =)
        highlightedCode = highlightedCode.replace(
          /\s([a-zA-Z-]+)=/g,
          ' <span class="text-green-600 dark:text-green-400">$1</span>='
        );
        
        // HTML tag names (between < and > or space)
        highlightedCode = highlightedCode.replace(
          /(&lt;\/?)\s*([a-zA-Z][a-zA-Z0-9-]*)/g,
          '$1<span class="text-blue-600 dark:text-blue-400 font-semibold">$2</span>'
        );
        
        // HTML tag brackets
        highlightedCode = highlightedCode.replace(
          /(&lt;|&gt;)/g,
          '<span class="text-blue-600 dark:text-blue-400 font-semibold">$1</span>'
        );
        break;

      case 'css':
        // CSS comments first
        highlightedCode = highlightedCode.replace(
          /(\/\*[\s\S]*?\*\/)/g,
          '<span class="text-gray-500 dark:text-gray-400 italic">$1</span>'
        );
        
        // CSS strings in quotes
        highlightedCode = highlightedCode.replace(
          /(&#x27;[^&#x27;]*&#x27;|&quot;[^&quot;]*&quot;)/g,
          '<span class="text-orange-600 dark:text-orange-400">$1</span>'
        );
        
        // CSS color values (hex colors)
        highlightedCode = highlightedCode.replace(
          /(#[0-9a-fA-F]{3,8})/g,
          '<span class="text-yellow-600 dark:text-yellow-400">$1</span>'
        );
        
        // CSS function values (rgba, linear-gradient, etc)
        highlightedCode = highlightedCode.replace(
          /\b([a-zA-Z-]+)\(/g,
          '<span class="text-purple-600 dark:text-purple-400">$1</span>('
        );
        
        // CSS numeric values with units
        highlightedCode = highlightedCode.replace(
          /\b(\d+(?:\.\d+)?)(px|em|rem|%|vh|vw|deg|s|ms)\b/g,
          '<span class="text-orange-600 dark:text-orange-400">$1$2</span>'
        );
        
        // CSS property values (everything after : until ; or })
        highlightedCode = highlightedCode.replace(
          /(:\s*)([^;{}]+?)(;|})/g,
          (match, colon, value, end) => {
            // Don't re-highlight already highlighted content
            if (value.includes('<span')) {
              return match;
            }
            return `${colon}<span class="text-green-600 dark:text-green-400">${value}</span>${end}`;
          }
        );
        
        // CSS properties (before :)
        highlightedCode = highlightedCode.replace(
          /([a-zA-Z-]+)(\s*:)/g,
          '<span class="text-blue-600 dark:text-blue-400">$1</span>$2'
        );
        
        // CSS selectors (class, id, element)
        highlightedCode = highlightedCode.replace(
          /(^|\n)([.#]?[a-zA-Z][a-zA-Z0-9-_]*(?::hover|:focus|:active)?(?:\s*,\s*[.#]?[a-zA-Z][a-zA-Z0-9-_]*(?::hover|:focus|:active)?)*)\s*\{/gm,
          '$1<span class="text-purple-600 dark:text-purple-400 font-semibold">$2</span> {'
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
        
        // JavaScript strings (single and double quotes)
        highlightedCode = highlightedCode.replace(
          /(&#x27;[^&#x27;]*&#x27;|&quot;[^&quot;]*&quot;|`[^`]*`)/g,
          '<span class="text-green-600 dark:text-green-400">$1</span>'
        );
        
        // JavaScript keywords
        highlightedCode = highlightedCode.replace(
          /\b(function|var|let|const|if|else|for|while|return|true|false|null|undefined|document|console|addEventListener|getElementById)\b/g,
          '<span class="text-purple-600 dark:text-purple-400 font-semibold">$1</span>'
        );
        
        // JavaScript methods (after a dot)
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
