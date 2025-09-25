'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Container,
  Button,
  Chip,
  Stack,
  IconButton,
  Avatar,
  useTheme,
  Fade,
  Skeleton
} from '@mui/material';
import {
  PlayArrow,
  Add,
  Star,
  Favorite,
  FavoriteBorder,
  Dashboard,
  LiveTv,
  Movie,
  Sports,
  NewReleases
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useOptimizedIndexedDB } from '../hooks/useOptimizedIndexedDB';

const StreamingHomeInterface = ({ channels = [], onChannelSelect, onNavigateToDashboard }) => {
  const theme = useTheme();
  const router = useRouter();
  const { isReady, getHistory, getFavorites, addToFavorites, removeFromFavorites } = useOptimizedIndexedDB();

  const [heroChannel, setHeroChannel] = useState(null);
  const [recentChannels, setRecentChannels] = useState([]);
  const [favoriteChannels, setFavoriteChannels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    if (!isReady || channels.length === 0) return;

    const loadData = async () => {
      try {
        const [history, savedFavorites] = await Promise.all([
          getHistory(10),
          getFavorites()
        ]);

        setFavorites(savedFavorites);

        // Definir canal hero (último assistido ou primeiro da lista)
        if (history.length > 0) {
          const lastWatched = channels.find(ch => ch.id === history[0].channelId);
          setHeroChannel(lastWatched || channels[0]);
        } else {
          setHeroChannel(channels[0]);
        }

        // Canais recentes baseados no histórico
        const recentChannelIds = history.slice(0, 6).map(h => h.channelId);
        const recentChList = recentChannelIds
          .map(id => channels.find(ch => ch.id === id))
          .filter(Boolean);
        setRecentChannels(recentChList);

        // Canais favoritos
        const favoriteChList = savedFavorites
          .map(fav => channels.find(ch => ch.id === fav.channelId))
          .filter(Boolean)
          .slice(0, 8);
        setFavoriteChannels(favoriteChList);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isReady, channels, getHistory, getFavorites]);

  // Toggle favorito
  const toggleFavorite = useCallback(async (channel, event) => {
    event.stopPropagation();

    const isFavorited = favorites.some(fav => fav.channelId === channel.id);

    if (isFavorited) {
      await removeFromFavorites(channel.id);
      setFavorites(prev => prev.filter(fav => fav.channelId !== channel.id));
    } else {
      await addToFavorites(channel.id, channel.name);
      setFavorites(prev => [...prev, { channelId: channel.id, name: channel.name }]);
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  // Componente de Card do Canal
  const ChannelCard = ({ channel, size = 'medium', showFavorite = true }) => {
    const isFavorited = favorites.some(fav => fav.channelId === channel.id);

    const cardHeight = size === 'large' ? 200 : size === 'medium' ? 160 : 120;

    return (
      <Card
        sx={{
          height: cardHeight,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          background: channel.image || channel.logo || channel['tvg-logo']
            ? `url(${channel.image || channel.logo || channel['tvg-logo']})`
            : 'linear-gradient(45deg, #1a1a2e, #16213e)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: theme.shadows[8],
            '& .play-button': {
              opacity: 1,
              transform: 'scale(1)'
            },
            '& .overlay': {
              opacity: 0.3
            }
          }
        }}
        onClick={() => onChannelSelect?.(channel)}
      >
        {/* Overlay escuro para melhor legibilidade */}
        <Box
          className="overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: (channel.image || channel.logo || channel['tvg-logo'])
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))'
              : 'transparent',
            transition: 'opacity 0.3s ease',
            opacity: 0.6
          }}
        />

        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Ícone do canal (apenas se não houver logo) */}
          {!(channel.image || channel.logo || channel['tvg-logo']) && (
            <Avatar
              sx={{
                width: size === 'large' ? 80 : 60,
                height: size === 'large' ? 80 : 60,
                bgcolor: 'primary.main',
                mb: 1
              }}
            >
              <LiveTv fontSize={size === 'large' ? 'large' : 'medium'} />
            </Avatar>
          )}

          {/* Nome do canal */}
          <Typography
            variant={size === 'large' ? 'h6' : 'body2'}
            color="white"
            align="center"
            sx={{
              fontWeight: 600,
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {channel.name}
          </Typography>

          {/* Grupo/Categoria */}
          {channel.group && (
            <Chip
              label={channel.group}
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          )}

          {/* Botão de Play (hover) */}
          <IconButton
            className="play-button"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(0)',
              opacity: 0,
              transition: 'all 0.3s ease',
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.9)'
              }
            }}
          >
            <PlayArrow fontSize="large" />
          </IconButton>

          {/* Botão de Favorito */}
          {showFavorite && (
            <IconButton
              onClick={(e) => toggleFavorite(channel, e)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: isFavorited ? 'red' : 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: 'red'
                }
              }}
            >
              {isFavorited ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          )}
        </Box>
      </Card>
    );
  };

  // Seção Hero
  const HeroSection = () => {
    if (!heroChannel) return null;

    return (
      <Box
        sx={{
          height: '70vh',
          background: heroChannel.image || heroChannel.logo || heroChannel['tvg-logo']
            ? `linear-gradient(
                135deg,
                rgba(0, 0, 0, 0.7) 0%,
                rgba(0, 0, 0, 0.5) 50%,
                rgba(0, 0, 0, 0.8) 100%
              ), url('${heroChannel.image || heroChannel.logo || heroChannel['tvg-logo']}')`
            : `linear-gradient(
                135deg,
                rgba(26, 26, 46, 0.9) 0%,
                rgba(22, 33, 62, 0.8) 50%,
                rgba(13, 20, 33, 0.9) 100%
              )`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          mb: 4
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ maxWidth: '600px' }}>
              <Typography
                variant="h2"
                color="white"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  mb: 2
                }}
              >
                {heroChannel.name}
              </Typography>

              {heroChannel.group && (
                <Chip
                  label={heroChannel.group}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    mb: 3,
                    fontSize: '1rem',
                    height: 32
                  }}
                />
              )}

              <Typography
                variant="h6"
                color="grey.300"
                sx={{
                  mb: 4,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  lineHeight: 1.6
                }}
              >
                Continue assistindo de onde parou ou explore novos canais em nossa plataforma de streaming.
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => onChannelSelect?.(heroChannel)}
                  sx={{
                    bgcolor: 'white',
                    color: 'black',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'grey.200'
                    }
                  }}
                >
                  Assistir Agora
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Add />}
                  onClick={(e) => toggleFavorite(heroChannel, e)}
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main'
                    }
                  }}
                >
                  Minha Lista
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 4 }} />
        <Skeleton variant="text" height={40} width={300} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
              <Skeleton variant="rectangular" height={160} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#000' }}>
      {/* Hero Section */}
      <HeroSection />

      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Continuar Assistindo */}
        {recentChannels.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              color="white"
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Continuar Assistindo
            </Typography>
            <Grid container spacing={2}>
              {recentChannels.map((channel) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={channel.id}>
                  <ChannelCard channel={channel} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Meus Favoritos */}
        {favoriteChannels.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h4"
              color="white"
              gutterBottom
              sx={{ fontWeight: 600, mb: 3 }}
            >
              Meus Favoritos
            </Typography>
            <Grid container spacing={2}>
              {favoriteChannels.map((channel) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={channel.id}>
                  <ChannelCard channel={channel} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Todos os Canais */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              color="white"
              sx={{ fontWeight: 600 }}
            >
              Todos os Canais
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Dashboard />}
              onClick={onNavigateToDashboard}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }
              }}
            >
              Gerenciar
            </Button>
          </Box>

          <Grid container spacing={2}>
            {channels.slice(0, 24).map((channel) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={channel.id}>
                <ChannelCard channel={channel} size="small" />
              </Grid>
            ))}
          </Grid>

          {channels.length > 24 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  px: 4,
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }
                }}
              >
                Ver Mais Canais ({channels.length - 24} restantes)
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default StreamingHomeInterface;