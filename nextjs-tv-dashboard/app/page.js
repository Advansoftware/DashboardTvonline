'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow,
  Add,
  CloudUpload,
  Tv,
  Favorite,
  Analytics,
  TrendingUp,
  People,
  Schedule,
  Close
} from '@mui/icons-material';

import MainLayout from '../src/components/MainLayout';
import ChannelGrid from '../src/components/ChannelGrid';
import HlsPlayer from '../src/components/HlsPlayer';
import { fetchM3U8FromUrl, organizeChannelsByGroup } from '../src/utils/m3u8Utils';

export default function Home() {
  const theme = useTheme();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [m3u8Url, setM3u8Url] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sample data para demonstração
  const sampleChannels = [
    {
      id: 'sample-1',
      name: 'Canal Exemplo 1',
      image: 'https://via.placeholder.com/320x180/6750A4/FFFFFF?text=Canal+1',
      group: 'Entretenimento',
      link: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    },
    {
      id: 'sample-2',
      name: 'Canal Exemplo 2',
      image: 'https://via.placeholder.com/320x180/625B71/FFFFFF?text=Canal+2',
      group: 'Esportes',
      link: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4'
    },
    {
      id: 'sample-3',
      name: 'Canal Exemplo 3',
      image: 'https://via.placeholder.com/320x180/7D5260/FFFFFF?text=Canal+3',
      group: 'Notícias',
      link: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4'
    }
  ];

  useEffect(() => {
    // Carregar canais do localStorage ou usar dados de exemplo
    const savedChannels = localStorage.getItem('tv-dashboard-channels');
    if (savedChannels) {
      setChannels(JSON.parse(savedChannels));
    } else {
      setChannels(sampleChannels);
    }
  }, []);

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    setIsPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedChannel(null);
  };

  const handleUploadM3U8 = async () => {
    if (!m3u8Url.trim()) return;

    setIsLoading(true);
    try {
      const newChannels = await fetchM3U8FromUrl(m3u8Url);
      const updatedChannels = [...channels, ...newChannels];
      setChannels(updatedChannels);
      localStorage.setItem('tv-dashboard-channels', JSON.stringify(updatedChannels));
      setIsUploadDialogOpen(false);
      setM3u8Url('');
    } catch (error) {
      console.error('Erro ao carregar lista M3U8:', error);
      alert('Erro ao carregar lista M3U8. Verifique a URL e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total de Canais',
      value: channels.length,
      icon: <Tv />,
      color: theme.palette.primary.main,
      change: '+12%'
    },
    {
      title: 'Favoritos',
      value: Math.floor(channels.length * 0.3),
      icon: <Favorite />,
      color: theme.palette.error.main,
      change: '+5%'
    },
    {
      title: 'Tempo Assistido',
      value: '2h 45m',
      icon: <Schedule />,
      color: theme.palette.success.main,
      change: '+8%'
    },
    {
      title: 'Usuários Ativos',
      value: '1.2k',
      icon: <People />,
      color: theme.palette.warning.main,
      change: '+15%'
    }
  ];

  return (
    <MainLayout currentPage="home">
      <Box sx={{ width: '100%' }}>
        {/* Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            borderRadius: 4,
            p: 4,
            mb: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Bem-vindo ao TV Dashboard
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Sua central completa para gerenciar e assistir canais IPTV
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<CloudUpload />}
              onClick={() => setIsUploadDialogOpen(true)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }
              }}
            >
              Adicionar Lista M3U8
            </Button>
          </Box>

          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              zIndex: 1
            }}
          />
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="body2">
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, color: theme.palette.success.main, mr: 0.5 }} />
                        <Typography variant="caption" sx={{ color: theme.palette.success.main }}>
                          {stat.change}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(stat.color, 0.1),
                        color: stat.color
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Channels Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Seus Canais IPTV
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setIsUploadDialogOpen(true)}
              >
                Adicionar Lista
              </Button>
            </Box>

            <ChannelGrid
              channels={channels}
              onChannelSelect={handleChannelSelect}
              onChannelOptions={(channel, action) => {
                console.log('Channel action:', action, channel);
              }}
            />
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setIsUploadDialogOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <Add />
        </Fab>

        {/* Upload Dialog */}
        <Dialog
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Adicionar Lista M3U8
            <IconButton onClick={() => setIsUploadDialogOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="URL da Lista M3U8"
              type="url"
              fullWidth
              variant="outlined"
              value={m3u8Url}
              onChange={(e) => setM3u8Url(e.target.value)}
              placeholder="https://exemplo.com/playlist.m3u8"
              helperText="Cole aqui a URL da sua lista de canais IPTV em formato M3U8"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsUploadDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUploadM3U8}
              variant="contained"
              disabled={!m3u8Url.trim() || isLoading}
            >
              {isLoading ? 'Carregando...' : 'Adicionar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Player Dialog */}
        <Dialog
          open={isPlayerOpen}
          onClose={handleClosePlayer}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Typography variant="h6">
              {selectedChannel?.name}
            </Typography>
            <IconButton onClick={handleClosePlayer}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {selectedChannel && (
              <HlsPlayer
                url={selectedChannel.link}
                title={selectedChannel.name}
                poster={selectedChannel.image}
                autoPlay={true}
                height="500px"
              />
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
