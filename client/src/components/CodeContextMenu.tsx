import { useState, useEffect } from 'react';
import { Bug, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';

interface CodeContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  selectedCode: string;
  language: 'html' | 'css' | 'javascript';
  onClose: () => void;
  onAction: (action: string, code: string, language: string) => void;
}

export const CodeContextMenu = ({
  x,
  y,
  visible,
  selectedCode,
  language,
  onClose,
  onAction,
}: CodeContextMenuProps) => {
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (visible) {
      // Adjust position to keep menu within viewport
      const menuWidth = 200;
      const menuHeight = 160;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + menuWidth > viewportWidth) {
        adjustedX = viewportWidth - menuWidth - 10;
      }

      if (y + menuHeight > viewportHeight) {
        adjustedY = viewportHeight - menuHeight - 10;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y, visible]);

  useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const menuItems = [
    {
      label: 'Help me debug this',
      icon: Bug,
      action: 'debug',
      description: 'Find and fix issues in this code'
    },
    {
      label: 'Explain this',
      icon: HelpCircle,
      action: 'explain',
      description: 'Understand what this code does'
    },
    {
      label: 'Is there a better way?',
      icon: Lightbulb,
      action: 'improve',
      description: 'Get suggestions for optimization'
    },
    {
      label: 'Surprise me',
      icon: Sparkles,
      action: 'surprise',
      description: 'Get creative suggestions'
    }
  ];

  const handleAction = (action: string) => {
    onAction(action, selectedCode, language);
    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 min-w-[200px]"
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          AI Assistant for {language.toUpperCase()}
        </p>
      </div>
      
      {menuItems.map((item) => (
        <button
          key={item.action}
          onClick={() => handleAction(item.action)}
          className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start space-x-3 transition-colors"
        >
          <item.icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {item.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {item.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};