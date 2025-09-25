'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, ThemeProvider, CssBaseline } from '@mui/material';
import { useRouter } from 'next/navigation';
import TVHomeInterface from '../src/components/TVHomeInterface';
import OptimizedTVHomeInterface from '../src/components/OptimizedTVHomeInterface';
import StreamingHomeInterface from '../src/components/StreamingHomeInterface';
import { useOptimizedIndexedDB } from '../src/hooks/useOptimizedIndexedDB';
import { darkTheme } from '../src/theme/theme';

// Limite para decidir quando usar a interface otimizada
const OPTIMIZATION_THRESHOLD = 1000;

export default function Home() {
  const router = useRouter();
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { isReady, getChannels, saveChannels } = useOptimizedIndexedDB();

  // Garantir hidratação correta
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Função memoizada para carregar canais
  const loadChannelsCallback = useCallback(async () => {
    try {
      const savedChannels = await getChannels();
      setChannels(savedChannels || []);
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
      setChannels([]);
    } finally {
      setIsLoading(false);
    }
  }, [getChannels]);

  // Carregar canais do IndexedDB
  useEffect(() => {
    if (!isMounted || !isReady) {
      if (isMounted && !isReady) {
        setIsLoading(false);
      }
      return;
    }

    loadChannelsCallback();
  }, [isReady, isMounted, loadChannelsCallback]);

  // Handlers
  const handleChannelSelect = (channel) => {
    console.log('Selecionando canal:', channel);
    try {
      if (!channel) {
        console.error('Canal inválido recebido:', channel);
        return;
      }

      // Navegar para rota do player usando Next.js router
      const channelId = encodeURIComponent(channel.id);
      router.push(`/tv/${channelId}`);
    } catch (error) {
      console.error('Erro ao selecionar canal:', error);
    }
  };

  const handleStartTV = () => {
    // Navegar para primeiro canal disponível
    if (channels.length > 0) {
      handleChannelSelect(channels[0]);
    }
  };

  // Loading state
  if (!isMounted || isLoading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  // Decidir qual interface usar baseado na quantidade de canais
  const useOptimizedInterface = channels.length >= OPTIMIZATION_THRESHOLD;

  // Show Home Interface (Streaming style like Globoplay)
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <StreamingHomeInterface
        channels={channels}
        onChannelSelect={handleChannelSelect}
        onNavigateToDashboard={() => router.push('/dashboard')}
      />
    </ThemeProvider>
  );
}
