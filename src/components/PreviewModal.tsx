
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

export const PreviewModal = ({
  isOpen,
  onClose,
  htmlCode,
  cssCode,
  jsCode,
}: PreviewModalProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generatePreviewContent = () => {
    return `<!DOCTYPE html>
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
  };

  const openInNewTab = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(generatePreviewContent());
      newWindow.document.close();
    }
  };

  useEffect(() => {
    if (isOpen && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(generatePreviewContent());
        doc.close();
      }
    }
  }, [isOpen, htmlCode, cssCode, jsCode]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Preview Your Webpage</DialogTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openInNewTab}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in New Tab</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 border rounded-lg overflow-hidden bg-white">
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            title="Code Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
        
        <div className="flex justify-center pt-4">
          <p className="text-sm text-gray-500">
            🎉 This is how your webpage looks! Make changes in the editor and preview again to see updates.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
