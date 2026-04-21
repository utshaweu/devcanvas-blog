#!/usr/bin/env node

/**
 * DevCanvas Blog MCP WebSocket Bridge
 *
 * Bridges frontend WebSocket JSON-RPC messages to MCP stdio transport
 * using newline-delimited JSON required by current MCP stdio transport.
 */

import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import process from 'node:process';
import { createServer } from 'node:http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = Number(process.env.PORT || process.env.MCP_WS_PORT || 8080);

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('DevCanvas MCP WebSocket Bridge is running');
});

const wss = new WebSocketServer({ server: httpServer });

httpServer.listen(PORT, () => {
  console.log(`MCP WebSocket Bridge listening on ws://localhost:${PORT}`);
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  const mcpServer = spawn('node', [join(__dirname, 'mcp-server.js')], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: process.env,
  });

  let stdoutBuffer = '';

  mcpServer.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString();

    const lines = stdoutBuffer.split('\n');
    stdoutBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(parsed));
        }
      } catch (error) {
        console.error('Failed to parse MCP server response:', error);
      }
    }
  });

  mcpServer.stderr.on('data', (data) => {
    console.error('MCP Server:', data.toString());
  });

  ws.on('message', (payload) => {
    try {
      const parsed = JSON.parse(payload.toString());
      mcpServer.stdin.write(`${JSON.stringify(parsed)}\n`);
    } catch (error) {
      console.error('Failed to process client message:', error);
      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32700,
              message: 'Parse error: Invalid JSON',
            },
          })
        );
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    mcpServer.kill();
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  mcpServer.on('error', (error) => {
    console.error('MCP server process error:', error);
  });

  mcpServer.on('exit', (code) => {
    console.log('MCP server exited with code:', code);
    if (ws.readyState === ws.OPEN) {
      ws.close();
    }
  });
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

httpServer.on('error', (error) => {
  console.error('HTTP server error:', error);
});

function gracefulShutdown() {
  console.log('\nShutting down MCP WebSocket Bridge...');

  wss.close(() => {
    httpServer.close(() => {
      console.log('WebSocket bridge closed');
      process.exit(0);
    });
  });
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
