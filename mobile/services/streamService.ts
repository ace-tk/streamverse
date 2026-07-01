import api from './api';
import {
  ChatMessage,
  CreateStreamRequest,
  PaginatedStreams,
  Stream,
  StreamsQuery,
} from '@/types';

export const streamService = {
  list: async (query: StreamsQuery = {}): Promise<PaginatedStreams> => {
    const response = await api.get<PaginatedStreams>('/streams', { params: query });
    return response.data;
  },

  getById: async (streamId: string): Promise<Stream> => {
    const response = await api.get<Stream>(`/streams/${streamId}`);
    return response.data;
  },

  create: async (data: CreateStreamRequest): Promise<Stream> => {
    const response = await api.post<Stream>('/streams', data);
    return response.data;
  },

  end: async (streamId: string): Promise<Stream> => {
    const response = await api.patch<Stream>(`/streams/${streamId}/end`);
    return response.data;
  },

  getMessages: async (streamId: string, limit = 50): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>(`/streams/${streamId}/messages`, {
      params: { limit },
    });
    return response.data;
  },
};
