import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Chip, Snackbar, TextInput, Divider } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '@/components/ScreenContainer';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { streamService } from '@/services/streamService';
import { WEBSOCKET_BASE_URL } from '@/constants/config';
import type { RootStackParamList } from '@/navigation/RootNavigator';
import type { ChatMessage, WsEvent } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveStream'>;

export default function LiveStreamScreen({ navigation, route }: Props) {
  const { streamId } = route.params;
  const theme = useTheme();
  const { currentUser, token } = useAuth();

  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [ending, setEnding] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

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
    onSuccess: (msgs: ChatMessage[]) => setChatMessages(msgs),
  } as any);

  // ─── WebSocket connection ────────────────────────────────────────────────
  const connectWs = useCallback(() => {
    if (!streamId) return;

    // Backend WS path: /ws/streams/{stream_id}  (registered as prefix=/ws + route=/streams/{stream_id})
    const url = `${WEBSOCKET_BASE_URL}/ws/streams/${streamId}`;
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WsEvent = JSON.parse(event.data);
        if (data.type === 'viewer_count') {
          setViewerCount(data.count);
        } else if (data.type === 'chat') {
          const msg: ChatMessage = {
            id: Date.now().toString(),
            sender_name: data.sender_name,
            message: data.message,
            created_at: new Date().toISOString(),
          };
          setChatMessages((prev) => [...prev, msg]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        } else if (data.type === 'stream_ended') {
          setSnackbar('Stream has ended.');
          navigation.replace('CreatorHome');
        }
      } catch {
        // silently ignore non-JSON frames
      }
    };

    ws.onerror = () => {
      setSnackbar('WebSocket connection error.');
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    wsRef.current = ws;
  }, [streamId, navigation]);

  useEffect(() => {
    connectWs();
    return () => {
      wsRef.current?.close();
    };
  }, [connectWs]);

  // ─── Send chat message ────────────────────────────────────────────────────
  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    // Backend reads sender_name from JSON payload
    wsRef.current.send(
      JSON.stringify({ type: 'chat', message: text, sender_name: currentUser?.name ?? 'Viewer' }),
    );
    setChatInput('');
  };

  // ─── End stream ───────────────────────────────────────────────────────────
  const handleEndStream = async () => {
    setEnding(true);
    try {
      wsRef.current?.close();
      await streamService.end(streamId);
      navigation.replace('CreatorHome');
    } catch (err: any) {
      setSnackbar(err.response?.data?.detail ?? 'Failed to end stream.');
      setEnding(false);
    }
  };

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
            <Chip
              icon="broadcast"
              style={styles.liveBadge}
              textStyle={{ color: '#fff', fontWeight: '800', fontSize: 12 }}
            >
              LIVE
            </Chip>

            {/* Viewer count */}
            <View style={styles.viewerBadge}>
              <Text style={[styles.viewerIcon, { color: theme.colors.onSurface }]}>👁</Text>
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.onSurface, fontWeight: '700' }}
              >
                {wsConnected ? viewerCount : stream.viewer_count}
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
            <Text
              variant="bodySmall"
              style={[styles.emptyChat, { color: theme.colors.onSurfaceVariant }]}
            >
              No messages yet. Say something!
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor:
                    item.sender_name === currentUser?.name
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                  alignSelf:
                    item.sender_name === currentUser?.name ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.primary, fontWeight: '700' }}
              >
                {item.sender_name}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                {item.message}
              </Text>
            </View>
          )}
        />

        {/* ── Chat input ─────────────────────────────────── */}
        <View style={[styles.inputRow, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Send a message…"
            mode="outlined"
            style={styles.chatInput}
            outlineStyle={{ borderRadius: 24 }}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            right={
              <TextInput.Icon
                icon="send"
                onPress={sendMessage}
                disabled={!wsConnected || !chatInput.trim()}
              />
            }
          />
        </View>

        <Divider />

        {/* ── End Stream ────────────────────────────────── */}
        <View style={styles.footer}>
          {!wsConnected && (
            <Text
              variant="labelSmall"
              style={[styles.wsStatus, { color: theme.colors.error }]}
            >
              ⚠ WebSocket disconnected
            </Text>
          )}
          <PrimaryButton
            label={ending ? 'Ending…' : '⏹  End Stream'}
            onPress={handleEndStream}
            loading={ending}
            style={styles.endBtn}
          />
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveBadge: {
    backgroundColor: '#E53935',
    borderRadius: 8,
    height: 30,
  },
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
  emptyChat: {
    textAlign: 'center',
    marginTop: 40,
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
