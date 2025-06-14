import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import WebSocket from "ws";
import { storage } from "./storage";
import { insertPreviewSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate a unique session ID
  function generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Create or update a preview session
  app.post("/api/preview", async (req, res) => {
    try {
      const { sessionId, htmlCode, cssCode, jsCode } = req.body;
      
      let session;
      if (sessionId) {
        // Update existing session
        session = await storage.updatePreviewSession(sessionId, {
          htmlCode: htmlCode || "",
          cssCode: cssCode || "",
          jsCode: jsCode || "",
        });
      } else {
        // Create new session
        const newSessionId = generateSessionId();
        session = await storage.createPreviewSession({
          id: newSessionId,
          htmlCode: htmlCode || "",
          cssCode: cssCode || "",
          jsCode: jsCode || "",
        });
      }

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Notify WebSocket clients of the update
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'code-update',
            sessionId: session.id,
            htmlCode: session.htmlCode,
            cssCode: session.cssCode,
            jsCode: session.jsCode,
          }));
        }
      });

      res.json({ sessionId: session.id, previewUrl: `/preview/${session.id}.html` });
    } catch (error) {
      console.error("Error handling preview request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve preview pages
  app.get("/preview/:sessionId.html", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getPreviewSession(sessionId);

      if (!session) {
        return res.status(404).send("Preview session not found");
      }

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Cadet Preview</title>
    <style>
        ${session.cssCode}
    </style>
    <script>
        // WebSocket connection for live reload
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = \`\${protocol}//\${window.location.host}/ws\`;
        const socket = new WebSocket(wsUrl);
        
        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'code-update' && data.sessionId === '${sessionId}') {
                // Update the page content
                document.body.innerHTML = data.htmlCode;
                
                // Update styles
                const styleElement = document.querySelector('style');
                if (styleElement) {
                    styleElement.textContent = data.cssCode;
                }
                
                // Re-execute JavaScript
                if (data.jsCode) {
                    try {
                        eval(data.jsCode);
                    } catch (e) {
                        console.error('JavaScript execution error:', e);
                    }
                }
            }
        };
    </script>
</head>
<body>
    ${session.htmlCode}
    <script>
        ${session.jsCode}
    </script>
</body>
</html>`;

      res.send(html);
    } catch (error) {
      console.error("Error serving preview:", error);
      res.status(500).send("Error loading preview");
    }
  });

  const httpServer = createServer(app);

  // Set up WebSocket server for live reload
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
