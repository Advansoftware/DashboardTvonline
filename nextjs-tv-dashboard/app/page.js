'use client';

import { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, ThemeProvider, CssBaseline } from '@mui/material';
import TVInterface from '../src/components/TVInterface';
import TVHomeInterface from '../src/components/TVHomeInterface';
import OptimizedTVHomeInterface from '../src/components/OptimizedTVHomeInterface';
import { useIndexedDB } from '../src/hooks/useIndexedDB';
import { darkTheme } from '../src/theme/theme';

// Limite para decidir quando usar a interface otimizada
const OPTIMIZATION_THRESHOLD = 1000;

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showTVInterface, setShowTVInterface] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const { isReady, getChannels, saveChannels } = useIndexedDB();

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
    setSelectedChannel(channel);
    setShowTVInterface(true);
  };

  const handleStartTV = () => {
    setShowTVInterface(true);
  };

  const handleBackToHome = () => {
    setShowTVInterface(false);
    setSelectedChannel(null);
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

  // Show TV Interface
  if (showTVInterface) {
    return (
      <TVInterface
        channels={channels}
        initialChannel={selectedChannel}
        onBack={handleBackToHome}
      />
    );
  }

  // Decidir qual interface usar baseado na quantidade de canais
  const useOptimizedInterface = channels.length >= OPTIMIZATION_THRESHOLD;

  // Show Home Interface (Netflix/Globo Play style)
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {useOptimizedInterface ? (
        <OptimizedTVHomeInterface
          channels={channels}
          onChannelSelect={handleChannelSelect}
          onStartTV={handleStartTV}
        />
      ) : (
        <TVHomeInterface
          channels={channels}
          onChannelSelect={handleChannelSelect}
          onStartTV={handleStartTV}
        />
      )}
    </ThemeProvider>
  );
}
