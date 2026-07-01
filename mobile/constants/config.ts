export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export const WEBSOCKET_BASE_URL =
  process.env.EXPO_PUBLIC_WEBSOCKET_BASE_URL ?? 'ws://localhost:8000';

export const API_TIMEOUT_MS = 10_000;

export const API_VERSION = '/api/v1';
