import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { roomManager } from './sockets/room_manager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Enable CORS
await server.register(cors, {
  origin: true,
  credentials: true,
});

// Security headers with OBS-friendly CSP (allows iframe/browser source embedding)
await server.register(helmet, {
  contentSecurityPolicy: false,
  frameguard: false, // Allows OBS browser source to render transparently
});

// Register WebSocket support
await server.register(fastifyWebsocket);

// Real-time WebSocket endpoint
server.get('/ws', { websocket: true }, (socket, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const handle = url.searchParams.get('handle') || 'alex';
  const role = (url.searchParams.get('role') as 'viewer' | 'creator' | 'overlay') || 'viewer';

  const client = roomManager.addClient(socket, handle, role);

  socket.on('message', (rawData: any) => {
    try {
      const parsed = JSON.parse(rawData.toString());
      roomManager.handleMessage(client, parsed);
    } catch (err) {
      server.log.warn({ err }, 'Failed to parse incoming WebSocket message');
    }
  });

  socket.on('close', () => {
    roomManager.removeClient(client);
  });
});

// Mock database store for instant development & zero-setup demos
const MOCK_CREATORS: Record<string, any> = {
  alex: {
    handle: 'alex',
    displayName: 'Alex Rivers',
    bio: 'Creative Tech & Indie Game Dev. Streaming Elden Ring & late-night builds 🎮⚡',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    accentColor: '#FF3366',
    overlayToken: 'alex-secret-obs-token-2026',
    isLive: true,
    links: [
      { id: '1', title: 'Watch Twitch Stream', url: 'https://twitch.tv', icon: 'tv' },
      { id: '2', title: 'Join VIP Discord', url: 'https://discord.com', icon: 'message-square' },
      { id: '3', title: 'Latest Devlog on YouTube', url: 'https://youtube.com', icon: 'play' },
      { id: '4', title: 'Buy Merch & Stickers', url: 'https://store.thumb.to', icon: 'shopping-bag' },
    ],
  },
  sarah: {
    handle: 'sarah',
    displayName: 'Sarah Chen',
    bio: 'Live Lo-fi Producer & Sound Designer. Drop by for chill beats & late study sessions 🎧✨',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    accentColor: '#8B5CF6',
    overlayToken: 'sarah-secret-obs-token-2026',
    isLive: false,
    links: [
      { id: '1', title: 'Stream on Spotify', url: 'https://spotify.com', icon: 'music' },
      { id: '2', title: 'SoundCloud Exclusives', url: 'https://soundcloud.com', icon: 'radio' },
      { id: '3', title: 'Join the Community', url: 'https://discord.com', icon: 'message-square' },
    ],
  },
};

// API Routes
server.get('/api/health', async () => {
  return { status: 'healthy', timestamp: new Date().toISOString(), platform: 'thumb.to' };
});

server.get('/api/creators/:handle', async (req, reply) => {
  const { handle } = req.params as { handle: string };
  const normalized = handle.toLowerCase().replace(/^@/, '');
  const creator = MOCK_CREATORS[normalized] || {
    handle: normalized,
    displayName: `@${normalized}`,
    bio: 'Creator on thumb.to',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    accentColor: '#FF4B4B',
    overlayToken: `${normalized}-obs-token`,
    isLive: false,
    links: [],
  };

  return creator;
});

// Tipping / Super-Thumb API
server.post('/api/creators/:handle/tip', async (req, reply) => {
  const { handle } = req.params as { handle: string };
  const body = req.body as {
    amountCents: number;
    supporterName: string;
    message?: string;
    isSuperThumb?: boolean;
  };

  if (!body.amountCents || body.amountCents < 100) {
    return reply.status(400).send({ error: 'Minimum tip is $1.00 (100 cents)' });
  }

  // Broadcast Super-Thumb / Tip announcement to room & OBS overlay
  const room = roomManager['getOrCreateRoom']?.(handle) || null;
  const tipNotification = {
    id: Math.random().toString(36).substring(7),
    sender: body.supporterName || 'Anonymous Supporter',
    text: body.message || 'Sent a tip!',
    amountCents: body.amountCents,
    isSuperThumb: !!body.isSuperThumb,
    timestamp: Date.now(),
  };

  // If live, push as a highlighted message to recent chat
  roomManager.handleMessage({ handle, role: 'viewer', id: 'system', lastTapTime: 0, ws: null as any }, {
    type: 'chat_message',
    sender: tipNotification.sender,
    text: tipNotification.text,
    isSuperThumb: true,
    amountCents: tipNotification.amountCents,
  });

  return {
    success: true,
    message: 'Tip recorded successfully',
    tip: tipNotification,
  };
});

// Static assets for production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
try {
  await server.register(fastifyStatic, {
    root: clientDistPath,
    prefix: '/',
  });

  server.setNotFoundHandler((req, reply) => {
    if (!req.raw.url?.startsWith('/api') && !req.raw.url?.startsWith('/ws')) {
      return reply.sendFile('index.html');
    }
    return reply.status(404).send({ error: 'Not Found' });
  });
} catch (e) {
  server.log.info('Client dist not yet compiled; running API-only mode');
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

try {
  await server.listen({ port: PORT, host: HOST });
  console.log(`🚀 thumb.to server live on http://${HOST}:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
