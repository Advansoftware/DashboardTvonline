'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';

const HlsPlayer = ({
  url,
  title = '',
  poster = null,
  autoPlay = false,
  controls = true,
  width = '100%',
  height = 'auto',
  onError = null
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const theme = useTheme();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setIsLoading(true);
    setError(null);

    // Limpar instância anterior do HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxLiveSyncPlaybackRate: 1.5,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('HLS: Media attached');
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS: Manifest parsed');
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch((error) => {
            console.warn('Autoplay bloqueado pelo navegador - requer interação do usuário:', error);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          let errorMessage = 'Erro desconhecido';
          switch (data.details) {
            case 'manifestParsingError':
              errorMessage = 'URL do stream inválida ou inacessível';
              break;
            case 'networkError':
              errorMessage = 'Erro de conexão com o stream';
              break;
            case 'mediaError':
              errorMessage = 'Erro no formato do vídeo';
              break;
            default:
              errorMessage = `Erro no stream: ${data.details}`;
          }
          setError(errorMessage);
          setIsLoading(false);
          if (onError) onError(errorMessage);
        }
      });

      // Validar URL antes de carregar
      if (!url || typeof url !== 'string' || !url.trim()) {
        setError('URL do stream não fornecida');
        setIsLoading(false);
        if (onError) onError('URL do stream não fornecida');
        return;
      }

      hls.attachMedia(video);

      try {
        hls.loadSource(url);
      } catch (error) {
        console.error('Erro ao carregar URL:', error);
        setError('URL do stream inválida');
        setIsLoading(false);
        if (onError) onError('URL do stream inválida');
      }

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari suporte nativo
      video.src = url;
      setIsLoading(false);
    } else {
      setError('Navegador não suporta reprodução HLS');
      setIsLoading(false);
      if (onError) onError('Navegador não suporta reprodução HLS');
    }

    // Event listeners do vídeo
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleError = (e) => {
      const errorMsg = 'Erro ao carregar vídeo';
      setError(errorMsg);
      setIsLoading(false);
      if (onError) onError(errorMsg);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('error', handleError);

      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url, autoPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((error) => {
        console.warn('Play manual bloqueado - requer interação do usuário:', error);
      });
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      setIsFullscreen(false);
    }
  };

  if (error) {
    return (
      <Box sx={{ width, height: '300px', display: 'flex', alignItems: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        backgroundColor: '#000',
        overflow: 'hidden'
      }}
    >
      {/* Título removido para experiência fullscreen */}

      {/* Container do vídeo */}
      <Box sx={{ position: 'relative', width: '100%', height: height === 'auto' ? '100vh' : height }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#000'
          }}
          poster={poster}
          playsInline
          webkit-playsinline="true"
        />

        {/* Loading overlay */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white'
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        )}

        {/* Custom controls */}
        {controls && !isLoading && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              display: 'flex',
              alignItems: 'center',
              p: 1,
              gap: 1
            }}
          >
            <IconButton
              onClick={togglePlay}
              sx={{ color: 'white' }}
              size="small"
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            <IconButton
              onClick={toggleMute}
              sx={{ color: 'white' }}
              size="small"
            >
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>

            <Box sx={{ flex: 1, mx: 1 }}>
              <Typography variant="caption" sx={{ color: 'white' }}>
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                {duration > 0 && (
                  <> / {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</>
                )}
              </Typography>
            </Box>

            <IconButton
              onClick={toggleFullscreen}
              sx={{ color: 'white' }}
              size="small"
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HlsPlayer;