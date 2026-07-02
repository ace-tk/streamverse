import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, KeyboardAvoidingView, Platform, AppState, AppStateStatus } from 'react-native';
import { Text, useTheme, Snackbar, TextInput, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/ScreenContainer';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { LiveBadge } from '@/components/LiveBadge';
import { useAuth } from '@/contexts/AuthContext';
import { streamService } from '@/services/streamService';
import { WEBSOCKET_BASE_URL } from '@/constants/config';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { ChatMessage, WsEvent } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveStream'>;

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000;

export default function LiveStreamScreen({ navigation, route }: Props) {
  const { streamId } = route.params;
  const theme = useTheme();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [ending, setEnding] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [isStreamEnded, setIsStreamEnded] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);

  // ─── Fetch stream metadata ───────────────────────────────────────────────
  const { data: stream, isLoading: streamLoading } = useQuery({
    queryKey: ['stream', streamId],
    queryFn: () => streamService.getById(streamId),
    enabled: !!streamId,
  });

  // ─── Fetch chat history ──────────────────────────────────────────────────
  const { data: history } = useQuery({
    queryKey: ['messages', streamId],
    queryFn: () => streamService.getMessages(streamId),
    enabled: !!streamId,
    onSuccess: (msgs: ChatMessage[]) => {
       // Filter out duplicates if reconnecting
       setChatMessages(prev => {
         const existingIds = new Set(prev.map(m => m.id));
         const newMsgs = msgs.filter(m => !existingIds.has(m.id));
         return [...prev, ...newMsgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
       });
    },
  } as any);

  // ─── WebSocket connection ────────────────────────────────────────────────
  const connectWs = useCallback(() => {
    if (!streamId || intentionalCloseRef.current || isStreamEnded) return;

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return; // Already connected or connecting
    }

    const url = `${WEBSOCKET_BASE_URL}/ws/streams/${streamId}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setWsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
    };

    ws.onmessage = (event) => {
      try {
        const data: WsEvent = JSON.parse(event.data);
        if (data.type === 'viewer_count') {
          setViewerCount(data.count);
        } else if (data.type === 'chat') {
          const msg: ChatMessage = {
            id: Date.now().toString() + Math.random().toString(), // Ensure unique ID for UI
            sender_name: data.sender_name,
            message: data.message,
            created_at: new Date().toISOString(),
          };
          setChatMessages((prev) => {
            if (prev.length > 0 && prev[prev.length - 1].message === msg.message && prev[prev.length - 1].sender_name === msg.sender_name) {
                 const timeDiff = new Date(msg.created_at).getTime() - new Date(prev[prev.length-1].created_at).getTime();
                 if (timeDiff < 500) return prev; // Ignore rapid duplicates
            }
            return [...prev, msg];
          });
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } else if (data.type === 'stream_ended') {
          setIsStreamEnded(true);
          setSnackbar('Stream has ended.');
          intentionalCloseRef.current = true;
          ws.close();
        } else if (data.type === 'error') {
            setSnackbar(data.message || 'An error occurred.');
            if (data.message === 'This stream is no longer live.') {
                 setIsStreamEnded(true);
                 intentionalCloseRef.current = true;
                 ws.close();
            }
        }
      } catch {
        // silently ignore non-JSON frames
      }
    };

    ws.onerror = () => {
      // Handle reconnect in onclose
    };

    ws.onclose = () => {
      setWsConnected(false);
      wsRef.current = null;
      
      if (!intentionalCloseRef.current && !isStreamEnded) {
         if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
            reconnectAttemptsRef.current++;
            setSnackbar(`Connection lost. Reconnecting... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
            reconnectTimeoutRef.current = setTimeout(connectWs, delay);
         } else {
            setSnackbar('Failed to reconnect.');
         }
      }
    };

    wsRef.current = ws;
  }, [streamId, isStreamEnded]);

  useEffect(() => {
    connectWs();
    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connectWs]);

  // ─── AppState Handling ──────────────────────────────────────────────────
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        intentionalCloseRef.current = true;
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        wsRef.current?.close();
      } else if (nextAppState === 'active') {
        if (!isStreamEnded) {
           intentionalCloseRef.current = false;
           reconnectAttemptsRef.current = 0;
           connectWs();
           queryClient.invalidateQueries({ queryKey: ['messages', streamId] });
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [connectWs, isStreamEnded, streamId, queryClient]);


  // ─── Send chat message ────────────────────────────────────────────────────
  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isStreamEnded) return;
    
    wsRef.current.send(
      JSON.stringify({ type: 'chat', message: text, sender_name: currentUser?.name ?? 'Viewer' }),
    );
    setChatInput('');
  };

  // ─── End stream / Leave stream ────────────────────────────────────────────
  const handleEndStream = async () => {
    setEnding(true);
    try {
      intentionalCloseRef.current = true;
      wsRef.current?.close();
      await streamService.end(streamId);
      navigation.replace('CreatorHome');
    } catch (err: any) {
      setSnackbar(err.response?.data?.detail ?? 'Failed to end stream.');
      setEnding(false);
      intentionalCloseRef.current = false;
      connectWs(); 
    }
  };

  const handleLeaveStream = () => {
    intentionalCloseRef.current = true;
    wsRef.current?.close();
    navigation.goBack();
  };

  // ─── Render Chat Item ───────────────────────────────────────────────────────
  const renderChatItem = useCallback(({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_name === currentUser?.name;
    return (
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isMe ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
            alignSelf: isMe ? 'flex-end' : 'flex-start',
          },
        ]}
        accessible={true}
        accessibilityLabel={`Message from ${item.sender_name}: ${item.message}`}
      >
        <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '700' }}>
          {item.sender_name}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
          {item.message}
        </Text>
      </View>
    );
  }, [currentUser?.name, theme]);

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (streamLoading || !stream) {
    return <LoadingIndicator fullScreen />;
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={80}
      >
        {/* ── Header ────────────────────────────────────── */}
        <View
          style={[styles.header, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.headerLeft}>
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onSurface, fontWeight: '700' }}
              numberOfLines={1}
            >
              {stream.title}
            </Text>
            {stream.category ? (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {stream.category}
              </Text>
            ) : null}
          </View>

          <View style={styles.headerRight}>
            {/* LIVE badge */}
            {!isStreamEnded && <LiveBadge />}
            {isStreamEnded && (
              <Text variant="labelMedium" style={{ color: theme.colors.error, fontWeight: '700' }}>
                ENDED
              </Text>
            )}

            {/* Viewer count */}
            <View style={styles.viewerBadge}>
              <MaterialCommunityIcons name="eye" size={16} color={theme.colors.onSurface} />
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.onSurface, fontWeight: '700' }}
              >
                {wsConnected && !isStreamEnded ? viewerCount : (isStreamEnded ? 0 : stream.viewer_count)}
              </Text>
            </View>
          </View>
        </View>

        <Divider />

        {/* ── Chat messages ──────────────────────────────── */}
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          contentContainerStyle={styles.chatContent}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyChatContainer}>
              <MaterialCommunityIcons name="chat-outline" size={32} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5, marginBottom: 8 }} />
              <Text
                variant="bodySmall"
                style={[styles.emptyChat, { color: theme.colors.onSurfaceVariant }]}
              >
                No messages yet. Say something!
              </Text>
            </View>
          }
          renderItem={renderChatItem}
        />

        {/* ── Chat input ─────────────────────────────────── */}
        <View style={[styles.inputRow, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            value={chatInput}
            onChangeText={setChatInput}
            placeholder={isStreamEnded ? "Stream ended" : "Send a message…"}
            mode="outlined"
            style={styles.chatInput}
            outlineStyle={{ borderRadius: 24 }}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={wsConnected && !isStreamEnded}
            right={
              <TextInput.Icon
                icon="send"
                onPress={sendMessage}
                disabled={!wsConnected || !chatInput.trim() || isStreamEnded}
              />
            }
          />
        </View>

        <Divider />

        {/* ── End Stream ────────────────────────────────── */}
        <View style={styles.footer}>
          {!wsConnected && !isStreamEnded && (
            <Text
              variant="labelSmall"
              style={[styles.wsStatus, { color: theme.colors.error }]}
            >
              ⚠ Reconnecting...
            </Text>
          )}
          {isStreamEnded && (
             <Text
              variant="labelSmall"
              style={[styles.wsStatus, { color: theme.colors.error }]}
            >
              Stream has ended
            </Text>
          )}
          
          {stream.creator_id === currentUser?.id ? (
            <PrimaryButton
              label={isStreamEnded ? 'Return Home' : (ending ? 'Ending…' : '⏹  End Stream')}
              onPress={isStreamEnded ? handleLeaveStream : handleEndStream}
              loading={ending}
              style={styles.endBtn}
            />
          ) : (
            <PrimaryButton
              label="👋 Leave Stream"
              onPress={handleLeaveStream}
              style={styles.endBtn}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar(null)}
        duration={3000}
      >
        {snackbar}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerLeft: { flex: 1, gap: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewerIcon: { fontSize: 14 },
  chatList: { flex: 1 },
  chatContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyChatContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyChat: {
    textAlign: 'center',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  inputRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chatInput: {
    height: 48,
  },
  footer: {
    padding: 16,
    gap: 8,
  },
  wsStatus: {
    textAlign: 'center',
  },
  endBtn: {
    borderRadius: 14,
  },
});
