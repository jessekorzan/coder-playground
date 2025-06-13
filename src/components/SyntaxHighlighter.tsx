
import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';

// Import custom CSS for our theme
import './prism-custom.css';

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
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  // Map our language names to Prism language names
  const getPrismLanguage = (lang: 'html' | 'css' | 'javascript') => {
    switch (lang) {
      case 'html':
        return 'markup';
      case 'css':
        return 'css';
      case 'javascript':
        return 'javascript';
      default:
        return 'markup';
    }
  };

  const prismLanguage = getPrismLanguage(language);

  return (
    <pre className={`font-mono text-sm whitespace-pre-wrap ${className}`}>
      <code
        ref={codeRef}
        className={`language-${prismLanguage}`}
        style={{ background: 'transparent' }}
      >
        {code}
      </code>
    </pre>
  );
};
