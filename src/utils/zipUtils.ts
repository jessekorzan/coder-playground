
export const generateZip = async (htmlCode: string, cssCode: string, jsCode: string) => {
  // Create the complete HTML file with proper structure
  const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Code Cadet Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${htmlCode}
    <script src="script.js"></script>
</body>
</html>`;

  // Create a simple ZIP-like structure using a basic approach
  // In a real application, you'd use a library like JSZip
  const files = [
    { name: 'index.html', content: completeHtml },
    { name: 'style.css', content: cssCode },
    { name: 'script.js', content: jsCode },
  ];

  // For now, we'll create individual downloads
  // In production, you'd want to use JSZip to create a proper ZIP file
  downloadAsZip(files);
};

const downloadAsZip = (files: { name: string; content: string }[]) => {
  // This is a simplified approach - in a real app, use JSZip
  files.forEach((file, index) => {
    setTimeout(() => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, index * 500); // Stagger downloads
  });
  
  // Show a friendly message
  setTimeout(() => {
    alert('🎉 Your Code Cadet project files have been downloaded! Look for index.html, style.css, and script.js in your Downloads folder.');
  }, files.length * 500 + 500);
};
