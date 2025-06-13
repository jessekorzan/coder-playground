
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

    switch (lang) {
      case 'html':
        return code
          // HTML tags
          .replace(/(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)/g, '$1<span class="text-blue-600 dark:text-blue-400 font-semibold">$2</span>')
          .replace(/(&gt;)/g, '<span class="text-blue-600 dark:text-blue-400 font-semibold">$1</span>')
          // HTML attributes
          .replace(/(\s)([a-zA-Z-]+)(=)/g, '$1<span class="text-green-600 dark:text-green-400">$2</span>$3')
          // HTML attribute values
          .replace(/(=)(["'][^"']*["'])/g, '$1<span class="text-orange-600 dark:text-orange-400">$2</span>');

      case 'css':
        return code
          // CSS selectors
          .replace(/^([.#]?[a-zA-Z][a-zA-Z0-9-_]*)\s*{/gm, '<span class="text-purple-600 dark:text-purple-400 font-semibold">$1</span> {')
          // CSS properties
          .replace(/(\s+)([a-zA-Z-]+)(\s*:)/g, '$1<span class="text-blue-600 dark:text-blue-400">$2</span>$3')
          // CSS values
          .replace(/(:\s*)([^;]+)(;)/g, '$1<span class="text-green-600 dark:text-green-400">$2</span>$3')
          // CSS comments
          .replace(/(\/\*.*?\*\/)/gs, '<span class="text-gray-500 dark:text-gray-400 italic">$1</span>');

      case 'javascript':
        return code
          // JavaScript keywords
          .replace(/\b(function|var|let|const|if|else|for|while|return|true|false|null|undefined|document|getElementById|addEventListener|alert)\b/g, '<span class="text-purple-600 dark:text-purple-400 font-semibold">$1</span>')
          // JavaScript strings
          .replace(/(["'][^"']*["'])/g, '<span class="text-green-600 dark:text-green-400">$1</span>')
          // JavaScript comments
          .replace(/(\/\/.*$)/gm, '<span class="text-gray-500 dark:text-gray-400 italic">$1</span>')
          // JavaScript methods
          .replace(/\.([a-zA-Z][a-zA-Z0-9]*)\(/g, '.<span class="text-orange-600 dark:text-orange-400">$1</span>(');

      default:
        return code;
    }
  };

  const highlightedCode = highlightCode(code.replace(/</g, '&lt;').replace(/>/g, '&gt;'), language);

  return (
    <div
      className={`font-mono text-sm whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
};
