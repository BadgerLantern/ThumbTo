import { WebSocket } from 'ws';
import { nanoid } from 'nanoid';

export interface RoomClient {
  id: string;
  ws: WebSocket;
  handle: string;
  role: 'viewer' | 'creator' | 'overlay';
  lastTapTime: number;
}

export interface PollState {
  id: string;
  question: string;
  options: Array<{ id: number; text: string; votes: number }>;
  totalVotes: number;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isSuperThumb?: boolean;
  amountCents?: number;
}

export interface CreatorRoom {
  handle: string;
  isLive: boolean;
  hypeScore: number;
  activePoll: PollState | null;
  recentChat: ChatMessage[];
  clients: Map<string, RoomClient>;
}

export class RoomManager {
  private rooms: Map<string, CreatorRoom> = new Map();
  private decayInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start hype decay loop (decays hype score slightly every 1.5 seconds)
    this.decayInterval = setInterval(() => {
      this.decayHype();
    }, 1500);
  }

  private getOrCreateRoom(handle: string): CreatorRoom {
    const normalized = handle.toLowerCase().replace(/^@/, '');
    let room = this.rooms.get(normalized);
    if (!room) {
      room = {
        handle: normalized,
        isLive: true, // Default to live for demonstration
        hypeScore: 50,
        activePoll: {
          id: 'sample-poll-1',
          question: 'Should we run another match or switch to Elden Ring?',
          options: [
            { id: 0, text: 'One More Match 🎮', votes: 14 },
            { id: 1, text: 'Switch to Elden Ring ⚔️', votes: 29 },
          ],
          totalVotes: 43,
          isActive: true,
        },
        recentChat: [],
        clients: new Map(),
      };
      this.rooms.set(normalized, room);
    }
    return room;
  }

  public addClient(ws: WebSocket, handle: string, role: 'viewer' | 'creator' | 'overlay'): RoomClient {
    const room = this.getOrCreateRoom(handle);
    const clientId = nanoid(10);
    const client: RoomClient = {
      id: clientId,
      ws,
      handle: room.handle,
      role,
      lastTapTime: Date.now(),
    };

    room.clients.set(clientId, client);

    // Send current initial state to newly connected client
    this.sendToClient(client, {
      type: 'initial_state',
      handle: room.handle,
      isLive: room.isLive,
      hypeScore: room.hypeScore,
      activePoll: room.activePoll,
      recentChat: room.recentChat.slice(-20),
      viewerCount: room.clients.size,
    });

    // Notify room of updated viewer count
    this.broadcast(room, {
      type: 'viewer_count_update',
      viewerCount: room.clients.size,
    });

    return client;
  }

  public removeClient(client: RoomClient) {
    const room = this.rooms.get(client.handle);
    if (room) {
      room.clients.delete(client.id);
      this.broadcast(room, {
        type: 'viewer_count_update',
        viewerCount: room.clients.size,
      });
    }
  }

  public handleMessage(client: RoomClient, message: any) {
    const room = this.rooms.get(client.handle);
    if (!room) return;

    switch (message.type) {
      case 'hype_tap': {
        const now = Date.now();
        // Rate-limit: max 15 taps/sec
        if (now - client.lastTapTime < 60) return;
        client.lastTapTime = now;

        const boost = Math.min(Math.max(message.intensity || 1, 1), 5);
        room.hypeScore = Math.min(room.hypeScore + boost, 100);

        this.broadcast(room, {
          type: 'hype_update',
          hypeScore: room.hypeScore,
          delta: boost,
        });
        break;
      }

      case 'emote_burst': {
        const emote = typeof message.emote === 'string' ? message.emote.slice(0, 10) : '🔥';
        this.broadcast(room, {
          type: 'emote_burst',
          id: nanoid(8),
          emote,
          x: Math.random() * 80 + 10, // random horizontal offset (10% to 90%)
        });
        break;
      }

      case 'cast_vote': {
        if (!room.activePoll || !room.activePoll.isActive) return;
        const opt = room.activePoll.options.find((o) => o.id === message.optionId);
        if (opt) {
          opt.votes += 1;
          room.activePoll.totalVotes += 1;

          this.broadcast(room, {
            type: 'poll_update',
            poll: room.activePoll,
          });
        }
        break;
      }

      case 'create_poll': {
        if (client.role !== 'creator') return; // Only creators can create polls
        const question = (message.question || '').slice(0, 150);
        const optionsList: string[] = Array.isArray(message.options) ? message.options : [];
        if (!question || optionsList.length < 2) return;

        room.activePoll = {
          id: nanoid(8),
          question,
          options: optionsList.slice(0, 4).map((text, idx) => ({
            id: idx,
            text: text.slice(0, 50),
            votes: 0,
          })),
          totalVotes: 0,
          isActive: true,
        };

        this.broadcast(room, {
          type: 'poll_update',
          poll: room.activePoll,
        });
        break;
      }

      case 'close_poll': {
        if (client.role !== 'creator') return;
        if (room.activePoll) {
          room.activePoll.isActive = false;
          this.broadcast(room, {
            type: 'poll_update',
            poll: room.activePoll,
          });
        }
        break;
      }

      case 'chat_message': {
        const text = (message.text || '').trim().slice(0, 200);
        const sender = (message.sender || 'Viewer').trim().slice(0, 30);
        if (!text) return;

        const chatMsg: ChatMessage = {
          id: nanoid(8),
          sender,
          text,
          timestamp: Date.now(),
          isSuperThumb: !!message.isSuperThumb,
          amountCents: message.amountCents,
        };

        room.recentChat.push(chatMsg);
        if (room.recentChat.length > 50) room.recentChat.shift();

        this.broadcast(room, {
          type: 'new_chat',
          message: chatMsg,
        });
        break;
      }

      case 'toggle_live': {
        if (client.role !== 'creator') return;
        room.isLive = !!message.isLive;
        this.broadcast(room, {
          type: 'live_status_update',
          isLive: room.isLive,
        });
        break;
      }
    }
  }

  private decayHype() {
    for (const room of this.rooms.values()) {
      if (room.hypeScore > 0) {
        room.hypeScore = Math.max(room.hypeScore - 1, 0);
        this.broadcast(room, {
          type: 'hype_update',
          hypeScore: room.hypeScore,
          delta: -1,
        });
      }
    }
  }

  private broadcast(room: CreatorRoom, payload: any) {
    const raw = JSON.stringify(payload);
    for (const client of room.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(raw);
      }
    }
  }

  private sendToClient(client: RoomClient, payload: any) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(payload));
    }
  }
}

export const roomManager = new RoomManager();
