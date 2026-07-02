import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignupScreen from '@/screens/auth/SignupScreen';
import HomeScreen from '@/screens/HomeScreen';
import CreatorHomeScreen from '@/screens/creator/CreatorHomeScreen';
import StartStreamScreen from '@/screens/creator/StartStreamScreen';
import LiveStreamScreen from '@/screens/creator/LiveStreamScreen';
import BrowseStreamsScreen from '@/screens/viewer/BrowseStreamsScreen';
import StreamDetailsScreen from '@/screens/viewer/StreamDetailsScreen';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  CreatorHome: undefined;
  StartStream: undefined;
  LiveStream: { streamId: string } | undefined;
  BrowseStreams: undefined;
  StreamDetails: { streamId: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator fullScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreatorHome" component={CreatorHomeScreen} />
          <Stack.Screen name="StartStream" component={StartStreamScreen} />
          <Stack.Screen name="LiveStream" component={LiveStreamScreen} />
          <Stack.Screen name="BrowseStreams" component={BrowseStreamsScreen} />
          <Stack.Screen name="StreamDetails" component={StreamDetailsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
