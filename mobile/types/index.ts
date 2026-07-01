// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

// Streams
export type StreamStatus = 'LIVE' | 'ENDED';
export type SortBy = 'newest' | 'oldest' | 'viewers';

export interface Stream {
  id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail_url?: string;
  status: StreamStatus;
  viewer_count: number;
  started_at: string;
  ended_at?: string;
  creator_id: string;
  creator?: AuthUser;
}

export interface PaginatedStreams {
  items: Stream[];
  total: number;
  page: number;
  size: number;
}

export interface StreamsQuery {
  page?: number;
  size?: number;
  category?: string;
  status?: StreamStatus;
  search?: string;
  sort_by?: SortBy;
}

export interface CreateStreamRequest {
  title: string;
  description?: string;
  category?: string;
  thumbnail_url?: string;
}

// Chat
export interface ChatMessage {
  id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

// WebSocket events
export type WsEvent =
  | { type: 'viewer_count'; count: number }
  | { type: 'chat'; sender_name: string; message: string }
  | { type: 'stream_ended'; message: string }
  | { type: 'error'; message: string };
