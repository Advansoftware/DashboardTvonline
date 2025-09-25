// Componente principal de TV que simula uma experiência de televisão real
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Fade,
  Backdrop,
  LinearProgress,
  Stack,
  Chip,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import { darkTheme } from '../theme/theme';
import {
  VolumeUp,
  VolumeDown,
  VolumeOff,
  Settings,
  Info,
  Menu,
  KeyboardArrowUp,
  KeyboardArrowDown,
  ArrowBack,
  Dashboard,
  List
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import HlsPlayer from './HlsPlayer';
import TVChannelSelector from './TVChannelSelector';
import { useIndexedDB } from '../hooks/useIndexedDB';

const TVInterface = ({ channels = [], initialChannel = null, onBack = null }) => {
  const router = useRouter();
  const { isReady, addToHistory, getLastWatchedChannel, getFavorites, addToFavorites, removeFromFavorites } = useIndexedDB();

  const [currentChannel, setCurrentChannel] = useState(null);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showChannelBar, setShowChannelBar] = useState(false);
  const [showChannelSelector, setShowChannelSelector] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const controlsTimeoutRef = useRef(null);
  const channelBarTimeoutRef = useRef(null);
  const playerRef = useRef(null);

  // Carregar dados iniciais
  useEffect(() => {
    if (isReady && channels.length > 0) {
      const loadInitialData = async () => {
        try {
          const [lastChannel, savedFavorites] = await Promise.all([
            getLastWatchedChannel(),
            getFavorites()
          ]);

          setFavorites(savedFavorites);

          // Priorizar canal inicial se fornecido
          if (initialChannel) {
            const index = channels.findIndex(ch => ch.id === initialChannel.id);
            if (index !== -1) {
              setCurrentChannelIndex(index);
              setCurrentChannel(channels[index]);
            } else {
              setCurrentChannel(channels[0]);
            }
          } else if (lastChannel) {
            const index = channels.findIndex(ch => ch.id === lastChannel.id);
            if (index !== -1) {
              setCurrentChannelIndex(index);
              setCurrentChannel(channels[index]);
            } else {
              setCurrentChannel(channels[0]);
            }
          } else {
            setCurrentChannel(channels[0]);
          }
        } catch (error) {
          console.error('Erro ao carregar dados iniciais:', error);
          setCurrentChannel(channels[0]);
        } finally {
          setIsLoading(false);
        }
      };

      loadInitialData();
    }
  }, [isReady, channels, initialChannel, getLastWatchedChannel, getFavorites]);

  // Mostrar controles temporariamente
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  // Mostrar barra de canais temporariamente
  const showChannelBarTemporarily = useCallback(() => {
    setShowChannelBar(true);
    if (channelBarTimeoutRef.current) {
      clearTimeout(channelBarTimeoutRef.current);
    }
    channelBarTimeoutRef.current = setTimeout(() => {
      setShowChannelBar(false);
    }, 5000);
  }, []);

  // Mudar canal
  const changeChannel = useCallback((direction) => {
    if (channels.length === 0) return;

    const newIndex = direction > 0
      ? (currentChannelIndex + 1) % channels.length
      : currentChannelIndex === 0
        ? channels.length - 1
        : currentChannelIndex - 1;

    setCurrentChannelIndex(newIndex);
    setCurrentChannel(channels[newIndex]);

    // Adicionar ao histórico
    if (isReady) {
      addToHistory(channels[newIndex].id, channels[newIndex].name);
    }

    showChannelBarTemporarily();
  }, [channels, currentChannelIndex, isReady, addToHistory, showChannelBarTemporarily]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyPress = (event) => {
      const { key } = event;

      switch (key) {
        case 'ArrowUp':
          event.preventDefault();
          changeChannel(1);
          break;
        case 'ArrowDown':
          event.preventDefault();
          changeChannel(-1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setVolume(prev => Math.max(0, prev - 5));
          showControlsTemporarily();
          break;
        case 'ArrowRight':
          event.preventDefault();
          setVolume(prev => Math.min(100, prev + 5));
          showControlsTemporarily();
          break;
        case ' ':
          event.preventDefault();
          showControlsTemporarily();
          break;
        case 'Enter':
          event.preventDefault();
          setShowChannelInfo(true);
          setTimeout(() => setShowChannelInfo(false), 5000);
          break;
        case 'm':
        case 'M':
          setIsMuted(prev => !prev);
          showControlsTemporarily();
          break;
        case 'i':
        case 'I':
          setShowChannelInfo(true);
          setTimeout(() => setShowChannelInfo(false), 5000);
          break;
        case 'Escape':
          if (onBack) {
            onBack();
          } else {
            router.push('/dashboard');
          }
          break;
        case 'd':
        case 'D':
          router.push('/dashboard');
          break;
        case 'l':
        case 'L':
          setShowChannelSelector(true);
          break;
        case 'h':
        case 'H':
          if (onBack) {
            onBack();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router, onBack, changeChannel, showControlsTemporarily]);

  // Controle de mouse
  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  // Selecionar canal específico
  const handleChannelSelect = useCallback((channel) => {
    const index = channels.findIndex(ch => ch.id === channel.id);
    if (index !== -1) {
      setCurrentChannelIndex(index);
      setCurrentChannel(channel);

      // Adicionar ao histórico
      if (isReady) {
        addToHistory(channel.id, channel.name);
      }

      setShowChannelSelector(false);
      showChannelBarTemporarily();
    }
  }, [channels, isReady, addToHistory, showChannelBarTemporarily]);

  // Toggle favorito
  const handleToggleFavorite = useCallback(async (channel) => {
    try {
      const favoriteIds = new Set(favorites.map(fav => fav.channelId));

      if (favoriteIds.has(channel.id)) {
        await removeFromFavorites(channel.id);
        setFavorites(prev => prev.filter(fav => fav.channelId !== channel.id));
      } else {
        await addToFavorites(channel.id, channel.name, channel.link || channel.url);
        setFavorites(prev => [...prev, {
          channelId: channel.id,
          channelName: channel.name,
          channelUrl: channel.link || channel.url,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h4" color="white" mb={3}>
          Carregando TV...
        </Typography>
        <LinearProgress sx={{ width: '300px' }} />
      </Box>
    );
  }

  if (!currentChannel) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h4" color="white" mb={2}>
          Nenhum canal disponível
        </Typography>
        <Typography variant="body1" color="grey.400" mb={3}>
          Acesse o dashboard para adicionar canais
        </Typography>
        <IconButton
          onClick={() => router.push('/dashboard')}
          sx={{ color: 'white', bgcolor: 'primary.main' }}
        >
          <Dashboard />
        </IconButton>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: '#000000', // Força fundo preto
          position: 'fixed', // Garante posição fixa na tela
          top: 0,
          left: 0,
          overflow: 'hidden',
          cursor: showControls ? 'default' : 'none',
          zIndex: 1000, // Garante que fique por cima de tudo
          color: '#ffffff' // Força texto branco
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={showControlsTemporarily}
      >
        {/* Player de vídeo */}
        <HlsPlayer
          ref={playerRef}
          url={currentChannel.url}
          title={currentChannel.name}
          autoPlay
          controls={false}
          width="100%"
          height="100vh"
        />

        {/* Barra de canais */}
        <Fade in={showChannelBar} timeout={300}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
              p: 2,
              zIndex: 2
            }}
          >
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
              {channels.map((channel, index) => (
                <Chip
                  key={channel.id}
                  label={channel.name}
                  variant={index === currentChannelIndex ? 'filled' : 'outlined'}
                  color={index === currentChannelIndex ? 'primary' : 'default'}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    minWidth: '120px',
                    '&.MuiChip-filled': {
                      bgcolor: 'primary.main'
                    }
                  }}
                  onClick={() => {
                    setCurrentChannelIndex(index);
                    setCurrentChannel(channel);
                    if (isReady) {
                      addToHistory(channel.id, channel.name);
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Fade>

        {/* Informações do canal */}
        <Fade in={showChannelInfo} timeout={300}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 100,
              left: 20,
              right: 20,
              bgcolor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 3,
              zIndex: 3
            }}
          >
            <Typography variant="h4" color="white" gutterBottom>
              {currentChannel.name}
            </Typography>
            {currentChannel.group && (
              <Typography variant="h6" color="primary.main" gutterBottom>
                {currentChannel.group}
              </Typography>
            )}
            <Typography variant="body1" color="grey.300">
              Canal {currentChannelIndex + 1} de {channels.length}
            </Typography>
          </Box>
        </Fade>

        {/* Controles */}
        <Fade in={showControls} timeout={300}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              p: 2,
              zIndex: 2
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Controles do lado esquerdo */}
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  onClick={() => changeChannel(-1)}
                  sx={{ color: 'white' }}
                >
                  <KeyboardArrowDown />
                </IconButton>
                <IconButton
                  onClick={() => changeChannel(1)}
                  sx={{ color: 'white' }}
                >
                  <KeyboardArrowUp />
                </IconButton>
                <Typography variant="body2" color="white" sx={{ ml: 1 }}>
                  {currentChannel.name}
                </Typography>
              </Stack>

              {/* Controles do centro - Volume */}
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  onClick={() => setIsMuted(!isMuted)}
                  sx={{ color: 'white' }}
                >
                  {isMuted ? <VolumeOff /> : volume > 50 ? <VolumeUp /> : <VolumeDown />}
                </IconButton>
                <Box sx={{ width: 100 }}>
                  <LinearProgress
                    variant="determinate"
                    value={isMuted ? 0 : volume}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white'
                      }
                    }}
                  />
                </Box>
              </Stack>

              {/* Controles do lado direito */}
              <Stack direction="row" spacing={1}>
                {onBack && (
                  <IconButton
                    onClick={onBack}
                    sx={{ color: 'white' }}
                    title="Voltar para a seleção"
                  >
                    <ArrowBack />
                  </IconButton>
                )}
                <IconButton
                  onClick={() => setShowChannelSelector(true)}
                  sx={{ color: 'white' }}
                >
                  <List />
                </IconButton>
                <IconButton
                  onClick={() => setShowChannelInfo(true)}
                  sx={{ color: 'white' }}
                >
                  <Info />
                </IconButton>
                <IconButton
                  onClick={() => setShowChannelBar(true)}
                  sx={{ color: 'white' }}
                >
                  <Menu />
                </IconButton>
                <IconButton
                  onClick={() => router.push('/dashboard')}
                  sx={{ color: 'white' }}
                >
                  <Dashboard />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        </Fade>

        {/* Instruções (apenas no primeiro uso) */}
        <Fade in={showControls && currentChannelIndex === 0} timeout={300}>
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              bgcolor: 'rgba(0,0,0,0.7)',
              borderRadius: 1,
              p: 2,
              zIndex: 2
            }}
          >
            <Typography variant="caption" color="white" display="block">
              ↑↓ Mudar canal
            </Typography>
            <Typography variant="caption" color="white" display="block">
              ←→ Volume
            </Typography>
            <Typography variant="caption" color="white" display="block">
              M = Mudo | I = Info | D = Dashboard | L = Lista
            </Typography>
          </Box>
        </Fade>

        {/* Seletor de Canais */}
        <TVChannelSelector
          channels={channels}
          onChannelSelect={handleChannelSelect}
          selectedChannel={currentChannel}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          isOpen={showChannelSelector}
          onClose={() => setShowChannelSelector(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default TVInterface;