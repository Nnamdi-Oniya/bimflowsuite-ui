// src/services/websocketService.ts
import { BACKEND_CONFIG, getAccessToken, getWebSocketUrl } from '../config/api';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onReconnectAttempt?: (attempt: number) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 8;
  private baseDelay = 1000;
  private maxDelay = 30000;
  private jitter = 0.3;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastPongReceived = Date.now();
  private handlers: WebSocketEventHandlers = {};
  private isConnecting = false;
  private pendingMessages: WebSocketMessage[] = [];
  private shouldQueueMessages = false;
  private currentEndpoint: string | null = null;

  connect(endpoint: string, handlers: WebSocketEventHandlers = {}): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    if (this.isConnecting) return;

    this.handlers = { ...this.handlers, ...handlers };

    const token = getAccessToken();
    const baseUrl = getWebSocketUrl(endpoint);
    const url = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;

    this.isConnecting = true;
    this.ws = new WebSocket(url);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.lastPongReceived = Date.now();

      if (this.shouldQueueMessages) this.flushQueue();

      this.handlers.onOpen?.();

      if (BACKEND_CONFIG.debug) console.log('[WS] Connected');

      this.startHeartbeat();
    };

    this.ws.onclose = (event) => {
      this.isConnecting = false;
      this.stopHeartbeat();

      this.handlers.onClose?.(event);

      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnect(this.currentEndpoint || '');
      }
    };

    this.ws.onerror = (event) => {
      this.handlers.onError?.(event);
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WebSocketMessage = JSON.parse(event.data);
        if (msg.type === 'pong') {
          this.lastPongReceived = Date.now();
          return;
        }
        this.handlers.onMessage?.(msg);
      } catch (err) {
        console.error('[WS] Parse error:', err);
      }
    };
  }

  private handleReconnect(endpoint: string): void {
    this.currentEndpoint = endpoint;
    this.reconnectAttempts++;

    let delay = this.baseDelay * Math.pow(2, this.reconnectAttempts - 1);
    delay = Math.min(delay, this.maxDelay);
    const jitterAmount = delay * this.jitter * (Math.random() * 2 - 1);
    delay += jitterAmount;

    this.reconnectTimer = setTimeout(() => {
      if (!this.isConnecting) {
        this.connect(endpoint, this.handlers);
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (Date.now() - this.lastPongReceived > 45000) {
        this.ws?.close(3008, 'Heartbeat timeout');
        return;
      }

      this.send({
        type: 'ping',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }, 25000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  send(message: WebSocketMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
      }));
      return true;
    }

    if (this.shouldQueueMessages) {
      this.pendingMessages.push(message);
      return false;
    }

    return false;
  }

  private flushQueue(): void {
    while (this.pendingMessages.length > 0) {
      const msg = this.pendingMessages.shift()!;
      this.send(msg);
    }
  }

  disconnect(code = 1000, reason = 'Normal closure'): void {
    this.stopHeartbeat();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    this.ws?.close(code, reason);
    this.ws = null;
    this.pendingMessages = [];
    this.reconnectAttempts = 0;
    this.isConnecting = false;
    this.currentEndpoint = null;
  }

  getStatus(): 'connecting' | 'open' | 'closed' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (!this.ws) return 'closed';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED: return 'closed';
      default: return 'error';
    }
  }

  connectToNotifications(handlers: WebSocketEventHandlers = {}): void {
    this.connect(BACKEND_CONFIG.wsEndpoints.notifications, handlers);
  }

  connectToCollaboration(sessionId: string, handlers: WebSocketEventHandlers = {}): void {
    const endpoint = `${BACKEND_CONFIG.wsEndpoints.collaboration}${sessionId}/`;
    this.connect(endpoint, handlers);
  }

  enableMessageQueue(enable = true): void {
    this.shouldQueueMessages = enable;
  }
}

export const websocketService = new WebSocketService();