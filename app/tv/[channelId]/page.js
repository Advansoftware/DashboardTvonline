'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { useOptimizedIndexedDB } from '../../../src/hooks/useOptimizedIndexedDB';
import { darkTheme } from '../../../src/theme/theme';

// Lazy load do TVInterface para melhor performance
const TVInterface = dynamic(() => import('../../../src/components/TVInterface'), {
  loading: () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}
    >
      <CircularProgress size={60} />
    </Box>
  ),
  ssr: false // Desabilitar SSR para melhor performance
});

// Cache de sessão para evitar recarregamentos desnecessários
const sessionCache = new Map();

export default function TVPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isReady, getChannelsPaginated, searchChannels, addToHistory } = useOptimizedIndexedDB();

  const channelId = decodeURIComponent(params.channelId);

  useEffect(() => {
    const loadChannelData = async () => {
      if (!isReady) return;

      try {
        setIsLoading(true);
        setError(null);

        // Verificar cache de sessão primeiro
        const cacheKey = `channel_${channelId}`;
        if (sessionCache.has(cacheKey)) {
          const cachedData = sessionCache.get(cacheKey);
          setChannels(cachedData.channels);
          setSelectedChannel(cachedData.selectedChannel);
          setIsLoading(false);
          return;
        }

        // Buscar canal específico com timeout
        const searchPromise = searchChannels(channelId, 10);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        let foundChannel = null;
        try {
          const searchResults = await Promise.race([searchPromise, timeoutPromise]);
          foundChannel = searchResults.find(ch => ch.id === channelId);
        } catch (timeoutError) {
          console.warn('Busca por canal específico demorou muito, usando fallback');
        }

        if (!foundChannel) {
          // Fallback rápido: carregar apenas primeira página
          const quickResult = await getChannelsPaginated(1, 15);
          if (quickResult.data.length > 0) {
            foundChannel = quickResult.data.find(ch => ch.id === channelId) || quickResult.data[0];

            // Cache dos dados para próxima visita
            const cacheData = {
              channels: quickResult.data,
              selectedChannel: foundChannel
            };
            sessionCache.set(cacheKey, cacheData);

            setChannels(quickResult.data);
            setSelectedChannel(foundChannel);

            if (foundChannel.id === channelId) {
              await addToHistory(foundChannel.id, foundChannel.name);
            }
            return;
          }
        }

        if (foundChannel) {
          // Carregar mínimo de canais relacionados
          let relatedChannels = [];
          try {
            const categoryResults = await Promise.race([
              searchChannels(foundChannel.group || foundChannel.category || '', 8),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
            relatedChannels = categoryResults.filter(ch => ch.id !== channelId).slice(0, 7);
          } catch {
            // Ignorar erro se busca relacionada falhar
            console.warn('Busca de canais relacionados falhou, continuando só com canal principal');
          }

          // Canal atual + relacionados (máximo 8 canais)
          const playerChannels = [foundChannel, ...relatedChannels];

          // Cache dos dados
          const cacheData = {
            channels: playerChannels,
            selectedChannel: foundChannel
          };
          sessionCache.set(cacheKey, cacheData);

          setChannels(playerChannels);
          setSelectedChannel(foundChannel);

          // Adicionar ao histórico em background
          addToHistory(foundChannel.id, foundChannel.name).catch(console.error);
        } else {
          throw new Error('Nenhum canal encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do canal:', error);
        setError(error.message);

        // Fallback de emergência mínimo
        try {
          const emergencyResult = await getChannelsPaginated(1, 5);
          if (emergencyResult.data.length > 0) {
            setChannels(emergencyResult.data);
            setSelectedChannel(emergencyResult.data[0]);
          } else {
            setError('Nenhum canal disponível');
          }
        } catch (emergencyError) {
          console.error('Fallback de emergência falhou:', emergencyError);
          setError('Erro ao carregar canais');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadChannelData();
  }, [channelId, isReady, getChannelsPaginated, searchChannels, addToHistory]);

  const handleBackToHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#000'
        }}>
          <div>Carregando player...</div>
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <h2>Erro ao Carregar Player</h2>
          <p>{error}</p>
          <button onClick={handleBackToHome} style={{
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Voltar ao Início
          </button>
        </Box>
      </ThemeProvider>
    );
  }

  if (!selectedChannel) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <h2>Canal não encontrado</h2>
          <button onClick={handleBackToHome} style={{
            padding: '12px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Voltar ao Início
          </button>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Suspense fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#000',
            color: '#fff'
          }}
        >
          <CircularProgress size={60} />
        </Box>
      }>
        <TVInterface
          channels={channels}
          initialChannel={selectedChannel}
          onBack={handleBackToHome}
        />
      </Suspense>
    </ThemeProvider>
  );
}