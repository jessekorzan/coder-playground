
import JSZip from 'jszip';

export const generateZip = async (htmlCode: string, cssCode: string, jsCode: string) => {
  // Create the complete HTML file with proper structure
  const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Coder Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${htmlCode}
    <script src="script.js"></script>
</body>
</html>`;

  // Create a new JSZip instance
  const zip = new JSZip();
  
  // Create the codecadet_page folder
  const folder = zip.folder("coder_page");
  
  if (folder) {
    // Add files to the folder
    folder.file("index.html", completeHtml);
    folder.file("style.css", cssCode);
    folder.file("script.js", jsCode);
  }

  try {
    // Generate the ZIP file as a blob
    const content = await zip.generateAsync({ type: "blob" });
    
    // Create download link
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coder_project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    alert('🎉 Your Coder project has been downloaded as coder_project.zip!');
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    alert('Sorry, there was an error creating your ZIP file. Please try again.');
  }
};
