import { BACKEND_CONFIG, getAccessToken, getWebSocketUrl } from '../config/api';

// Types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface WebSocketEventHandlers {
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onReconnect?: () => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: WebSocketEventHandlers = {};
  private isConnecting = false;

  // Connect to WebSocket
  connect(endpoint: string, handlers: WebSocketEventHandlers = {}): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.handlers = handlers;
    
    const token = getAccessToken();
    const wsUrl = getWebSocketUrl(endpoint);
    const url = token ? `${wsUrl}?token=${token}` : wsUrl;

    try {
      this.ws = new WebSocket(url);
      this.setupEventListeners();
      this.isConnecting = true;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.handleReconnect(endpoint);
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      this.handlers.onOpen?.();
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.isConnecting = false;
      this.handlers.onClose?.(event);
      
      // Attempt reconnect if not normal closure
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnect(this.ws?.url || '');
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
      this.handlers.onError?.(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handlers.onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  // Handle reconnection
  private handleReconnect(endpoint: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnecting) {
        this.connect(endpoint, this.handlers);
      }
    }, delay);
  }

  // Send message
  send(message: WebSocketMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    
    console.warn('WebSocket not connected, message not sent');
    return false;
  }

  // Disconnect
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
      this.handlers = {};
    }
  }

  // Get connection status
  getStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  // Connect to notifications
  connectToNotifications(handlers: WebSocketEventHandlers): void {
    this.connect(BACKEND_CONFIG.wsEndpoints.notifications, handlers);
  }

  // Connect to collaboration
  connectToCollaboration(sessionId: string, handlers: WebSocketEventHandlers): void {
    const endpoint = `${BACKEND_CONFIG.wsEndpoints.collaboration}${sessionId}/`;
    this.connect(endpoint, handlers);
  }
}

export const websocketService = new WebSocketService();