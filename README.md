# Coder 🚀

A modern, AI-powered code editor designed for learning web development. Coder provides an intuitive environment where beginners can write HTML, CSS, and JavaScript with real-time preview and intelligent AI assistance.

## Features

- **Multi-language Support**: Write and edit HTML, CSS, and JavaScript in separate tabs with syntax highlighting
- **Live Preview**: See your changes instantly with embedded preview and WebSocket live reload
- **AI Assistant**: Get coding help, suggestions, and explanations from an intelligent AI with context-aware recommendations
- **Code Context Menu**: Right-click on any code to get AI suggestions for debugging, explanations, improvements, or creative ideas
- **Smart Code Merging**: AI-powered code integration that intelligently merges suggestions without conflicts
- **Real-time Collaboration**: WebSocket-powered live updates across preview windows
- **Dark/Light Mode**: Toggle between themes for comfortable coding in any environment
- **Download Projects**: Export your complete project as a ZIP file with proper structure
- **Persistent Storage**: Your code is automatically saved in browser sessions
- **Responsive Design**: Optimized interface that works on desktop and mobile devices
- **Code Suggestions**: AI-generated recommendations based on your current project context

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js, WebSocket (ws)
- **AI Integration**: External AI webhook for intelligent code assistance
- **UI Components**: Radix UI primitives with custom styling
- **Syntax Highlighting**: Prism.js with custom themes
- **Code Processing**: Advanced CSS merging and JavaScript execution
- **File Generation**: JSZip for project downloads
- **Icons**: Lucide React
- **State Management**: React hooks with session-based storage

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

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production deployment
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes (if using database features)

## Project Structure

```
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # Reusable UI components (Radix-based)
│   │   │   ├── AiAssistant.tsx     # AI chat and suggestions
│   │   │   ├── CodeEditor.tsx      # Main code editing interface
│   │   │   ├── CodeContextMenu.tsx # Right-click context menu
│   │   │   └── SyntaxHighlighter.tsx # Code syntax highlighting
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── utils/          # Helper functions (ZIP generation, etc.)
│   │   └── config/         # Configuration constants
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point with WebSocket
│   ├── routes.ts          # API routes and preview generation
│   ├── storage.ts         # In-memory session storage
│   └── vite.ts            # Vite development middleware
└── shared/                # Shared TypeScript types and schemas
```

## Key Components

### CodeEditor
The main code editing interface featuring:
- Tabbed editing for HTML, CSS, and JavaScript
- Syntax highlighting with Prism.js
- Auto-save functionality
- Context menu integration for AI assistance
- Code folding and line numbers

### AiAssistant
Intelligent coding assistant providing:
- Interactive chat for coding questions
- Context-aware code suggestions based on current project
- Debugging assistance and error detection
- Code explanations and learning guidance
- Creative coding ideas and enhancements

### Live Preview System
Real-time preview with:
- WebSocket-powered live reload
- Automatic CSS and JavaScript injection
- Session-based code storage
- Embedded preview windows
- Error handling and console integration

### Code Context Menu
Right-click functionality offering:
- **Debug this**: Find and fix code issues
- **Explain this**: Understand code functionality
- **Is there a better way?**: Get optimization suggestions
- **Surprise me**: Receive creative enhancement ideas

## Deployment on Replit

This project is fully optimized for Replit deployment:

### Quick Setup:
1. **Import Repository**: Create a new Repl by importing this repository
2. **Automatic Dependencies**: Replit automatically detects Node.js and installs packages
3. **Port Configuration**: Pre-configured to run on port 5000 (optimal for Replit)
4. **Run Button**: Click Run to start the development server

### Production Deployment:
1. Click the **Deploy** button in your Repl
2. Choose **Autoscale** deployment for web applications
3. Configure deployment settings:
   - **Build command**: `npm run build`
   - **Run command**: `npm run start`
   - **Primary domain**: Choose your desired URL
4. Click **Deploy** to publish your application

### Environment Configuration

The application works out of the box with these customizable options:

- **AI Webhook URL**: Configure in `client/src/config/constants.ts`
- **Port Settings**: Default 5000 (optimized for Replit)
- **Session Storage**: In-memory storage (perfect for development)
- **WebSocket Endpoints**: Automatically configured for live preview

## Usage Guide

### Getting Started:
1. **Write Code**: Use the HTML, CSS, and JS tabs to build your project
2. **Live Preview**: Click "Live Preview" to see real-time results
3. **AI Assistance**: Ask questions in the AI chat or right-click code for help
4. **Apply Suggestions**: Use "Apply" buttons to integrate AI recommendations
5. **Download Project**: Export as ZIP when ready to share or deploy

### Advanced Features:
- **Code Context**: Right-click any code selection for contextual AI help
- **Smart Merging**: AI intelligently combines suggestions with existing code
- **Theme Toggle**: Switch between light and dark modes for comfort
- **Session Persistence**: Your work is automatically saved during sessions

## Learning Features

- **Beginner-Friendly**: Starts with example code and guided interactions
- **Progressive Learning**: Build complexity gradually with AI guidance
- **Real-time Feedback**: Immediate visual feedback in live preview
- **Interactive Explanations**: AI explains concepts as you code
- **Best Practices**: Learn modern web development standards
- **Error Prevention**: AI helps catch and fix common mistakes

## API Integration

The application integrates with external AI services:

- **Webhook Configuration**: Set AI endpoint in constants file
- **Context-Aware Requests**: Sends current code context for better suggestions
- **Response Processing**: Intelligent parsing of AI recommendations
- **Error Handling**: Graceful fallbacks for AI service issues

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Test thoroughly in both development and production modes
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Notes

- **TypeScript**: Fully typed codebase with strict type checking
- **ESLint**: Code quality and style enforcement
- **Hot Reload**: Instant updates during development
- **WebSocket**: Real-time communication for live features
- **Responsive**: Mobile-first design principles
- **Accessibility**: ARIA compliance and keyboard navigation

## License

MIT License - see LICENSE file for details

## Support & Community

- **AI Assistant**: Built-in help for coding questions
- **Documentation**: Comprehensive code examples and guides
- **Issues**: Report bugs and request features in GitHub issues
- **Replit Community**: Share your projects in Replit's community

---

**Happy Coding! 🎉**

Transform your web development journey with Coder - where intelligent assistance meets creative coding.