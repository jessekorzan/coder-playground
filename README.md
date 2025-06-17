
# Coder 🚀

A modern, AI-powered code editor designed for learning web development. Coder provides an intuitive environment where beginners can write HTML, CSS, and JavaScript with real-time preview and intelligent AI assistance.

## Features

- **Multi-language Support**: Write and edit HTML, CSS, and JavaScript in separate tabs
- **Live Preview**: See your changes instantly with embedded preview
- **AI Assistant**: Get coding help, suggestions, and explanations from an intelligent AI
- **Syntax Highlighting**: Beautiful code highlighting with Prism.js
- **Context Menu Actions**: Right-click on code to get AI suggestions for improvement
- **Smart Code Merging**: AI-powered code integration that prevents conflicts
- **Dark/Light Mode**: Toggle between themes for comfortable coding
- **Download Projects**: Export your work as a ZIP file
- **Persistent Storage**: Your code is automatically saved locally
- **Responsive Design**: Works great on different screen sizes

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **AI Integration**: External AI webhook for code assistance
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives
- **Syntax Highlighting**: Prism.js
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd coder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── utils/          # Helper functions
│   │   └── config/         # Configuration constants
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Session storage
│   └── vite.ts            # Vite middleware
└── shared/                # Shared TypeScript types
```

## Key Components

### CodeEditor
The main code editing interface with tabs for HTML, CSS, and JavaScript. Features syntax highlighting, auto-save, and context menu integration.

### AiAssistant
Intelligent coding assistant that provides:
- Code suggestions and improvements
- Explanations of programming concepts
- Error detection and fixes
- Learning guidance

### Live Preview
Real-time preview of your web projects with automatic updates as you type.

## Deployment on Replit

This project is optimized for deployment on Replit:

1. **Fork or Import**: Create a new Repl by importing this repository
2. **Automatic Setup**: Replit will automatically detect the Node.js environment and install dependencies
3. **Run Configuration**: The project uses port 5000 which is pre-configured for Replit
4. **Deploy**: Use Replit's deployment feature for production hosting

### Replit Deployment Steps:

1. Click the **Deploy** button in your Repl
2. Choose **Autoscale** deployment
3. Configure your deployment:
   - **Build command**: `npm run build`
   - **Run command**: `npm run start`
   - **Primary domain**: Choose your desired domain
4. Click **Deploy** to publish your application

## Environment Configuration

The application works out of the box, but you can customize:

- **AI Webhook URL**: Update the AI service endpoint in `client/src/config/constants.ts`
- **Port Configuration**: Default is 5000 (optimal for Replit)
- **Storage**: Uses in-memory session storage (suitable for development)

## Usage

1. **Writing Code**: Use the three tabs (HTML, CSS, JS) to write your web application
2. **Live Preview**: Switch to the Preview tab to see your work in real-time
3. **AI Help**: Ask the AI assistant questions or right-click code for suggestions
4. **Apply Suggestions**: Use the "Apply" button to integrate AI suggestions into your code
5. **Download**: Export your project as a ZIP file when ready

## Learning Features

- **Beginner-Friendly**: Pre-loaded with example code to get started
- **Interactive Learning**: AI provides explanations and suggestions
- **Real-time Feedback**: See changes immediately in the preview
- **Code Context**: Right-click any code for contextual help
- **Progressive Enhancement**: Start simple and build complexity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Check the AI assistant for coding help
- Review the code examples provided
- Create an issue in the repository

---

**Happy Coding! 🎉**

Start your web development journey with Coder - where learning meets intelligent assistance.
