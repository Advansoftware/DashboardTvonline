'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import HlsPlayer from './HlsPlayer';

// Função para detectar tipo de conteúdo baseado na URL
const detectContentType = (url) => {
  if (!url) return 'unknown';
  
  const urlLower = url.toLowerCase();
  
  // Extensões de arquivo VOD (arquivos diretos)
  const vodExtensions = [
    '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v',
    '.3gp', '.ts', '.mpg', '.mpeg', '.f4v', '.asf', '.divx', '.xvid'
  ];
  
  // Indicadores de streaming HLS
  const hlsIndicators = [
    '.m3u8', '/playlist.m3u8', '/live/', '/stream/'
  ];
  
  // Indicadores de streaming DASH
  const dashIndicators = [
    '.mpd', '/manifest.mpd'
  ];
  
  // Verificar HLS primeiro (mais comum em IPTV)
  if (hlsIndicators.some(indicator => urlLower.includes(indicator))) {
    return 'hls';
  }
  
  // Verificar DASH
  if (dashIndicators.some(indicator => urlLower.includes(indicator))) {
    return 'dash';
  }
  
  // Verificar VOD por extensão
  if (vodExtensions.some(ext => urlLower.includes(ext))) {
    return 'vod';
  }
  
  // Se não detectar, tentar HLS por padrão (comum em IPTV)
  return 'hls';
};

// Player de vídeo HTML5 nativo para VOD
const NativeVideoPlayer = ({ 
  url, 
  title, 
  poster, 
  autoPlay = false, 
  controls = true, 
  width = '100%', 
  height = 'auto' 
}) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleLoadStart = () => setIsLoading(true);
  const handleLoadedData = () => setIsLoading(false);
  const handleError = (e) => {
    setIsLoading(false);
    setError(`Erro ao carregar vídeo: ${e.target.error?.message || 'Formato não suportado'}`);
  };

  return (
    <Box sx={{ position: 'relative', width, height }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {error ? (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      ) : (
        <video
          ref={(video) => {
            if (video) {
              video.onloadstart = handleLoadStart;
              video.onloadeddata = handleLoadedData;
              video.onerror = handleError;
            }
          }}
          src={url}
          poster={poster}
          controls={controls}
          autoPlay={autoPlay}
          style={{
            width: '100%',
            height: height === 'auto' ? 'auto' : height,
            objectFit: 'contain',
            backgroundColor: '#000'
          }}
          playsInline
          preload="metadata"
        >
          <source src={url} />
          Seu navegador não suporta o elemento de vídeo.
        </video>
      )}
    </Box>
  );
};

// Componente principal que escolhe o player correto
const UniversalPlayer = ({
  url,
  title = '',
  poster = null,
  autoPlay = false,
  controls = true,
  width = '100%',
  height = 'auto',
  contentType = null // Permite override manual do tipo
}) => {
  const theme = useTheme();
  const [detectedType, setDetectedType] = useState('unknown');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    if (!url) {
      setDetectedType('unknown');
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);
    
    // Usar tipo manual se fornecido, senão detectar
    const type = contentType || detectContentType(url);
    setDetectedType(type);
    setIsDetecting(false);
    
    console.log(`🎥 Player Universal - URL: ${url}`);
    console.log(`🎯 Tipo detectado: ${type}`);
    
  }, [url, contentType]);

  if (isDetecting) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: height === 'auto' ? '200px' : height,
          backgroundColor: theme.palette.background.paper
        }}
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Detectando formato...
        </Typography>
      </Box>
    );
  }

  if (!url) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        URL do vídeo não fornecida
      </Alert>
    );
  }

  // Renderizar player baseado no tipo detectado
  switch (detectedType) {
    case 'hls':
      return (
        <HlsPlayer
          url={url}
          title={title}
          poster={poster}
          autoPlay={autoPlay}
          controls={controls}
          width={width}
          height={height}
        />
      );
      
    case 'vod':
      return (
        <>
          {title && (
            <Typography variant="subtitle2" sx={{ p: 1, backgroundColor: 'rgba(0,0,0,0.8)', color: 'white' }}>
              📹 VOD: {title}
            </Typography>
          )}
          <NativeVideoPlayer
            url={url}
            title={title}
            poster={poster}
            autoPlay={autoPlay}
            controls={controls}
            width={width}
            height={height}
          />
        </>
      );
      
    case 'dash':
      return (
        <Alert severity="info" sx={{ m: 2 }}>
          Formato DASH detectado. Player DASH não implementado ainda.
          <br />
          URL: {url}
        </Alert>
      );
      
    default:
      return (
        <Box>
          <Alert severity="warning" sx={{ m: 2 }}>
            Formato não reconhecido: {detectedType}
            <br />
            Tentando player HLS como fallback...
          </Alert>
          <HlsPlayer
            url={url}
            title={title}
            poster={poster}
            autoPlay={autoPlay}
            controls={controls}
            width={width}
            height={height}
          />
        </Box>
      );
  }
};

export default UniversalPlayer;