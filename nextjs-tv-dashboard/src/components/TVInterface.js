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
  Chip
} from '@mui/material';
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
  Dashboard
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import HlsPlayer from './HlsPlayer';
import { useIndexedDB } from '../hooks/useIndexedDB';

const TVInterface = ({ channels = [] }) => {
  const router = useRouter();
  const { isReady, addToHistory, getLastWatchedChannel } = useIndexedDB();

  const [currentChannel, setCurrentChannel] = useState(null);
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showChannelBar, setShowChannelBar] = useState(false);

  const controlsTimeoutRef = useRef(null);
  const channelBarTimeoutRef = useRef(null);
  const playerRef = useRef(null);

  // Carregar último canal assistido
  useEffect(() => {
    if (isReady && channels.length > 0) {
      const loadLastChannel = async () => {
        try {
          const lastChannel = await getLastWatchedChannel();
          if (lastChannel) {
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
          console.error('Erro ao carregar último canal:', error);
          setCurrentChannel(channels[0]);
        } finally {
          setIsLoading(false);
        }
      };

      loadLastChannel();
    }
  }, [isReady, channels, getLastWatchedChannel]);

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
          router.push('/dashboard');
          break;
        case 'd':
        case 'D':
          router.push('/dashboard');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

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

  // Controle de mouse
  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

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
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'black',
        position: 'relative',
        overflow: 'hidden',
        cursor: showControls ? 'default' : 'none'
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
            M = Mudo | I = Info | D = Dashboard
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default TVInterface;