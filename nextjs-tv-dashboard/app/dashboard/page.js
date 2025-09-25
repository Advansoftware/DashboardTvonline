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
  Tooltip,
  Stack,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar
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
  Close,
  Edit,
  Delete,
  Home,
  Refresh,
  PlaylistPlay,
  Storage,
  Visibility,
  Download,
  Upload
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

import MainLayout from '../../src/components/MainLayout';
import ChannelGrid from '../../src/components/ChannelGrid';
import HlsPlayer from '../../src/components/HlsPlayer';
import { useIndexedDB } from '../../src/hooks/useIndexedDB';
import { parseM3U8List } from '../../src/utils/m3u8Utils';

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { isReady, getChannels, saveChannels, getPlaylists, savePlaylist, deletePlaylist } = useIndexedDB();

  const [channels, setChannels] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [m3u8Content, setM3u8Content] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return;

      try {
        const [savedChannels, savedPlaylists] = await Promise.all([
          getChannels(),
          getPlaylists()
        ]);

        setChannels(savedChannels);
        setPlaylists(savedPlaylists);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Fallback para localStorage
        const localChannels = localStorage.getItem('tv-dashboard-channels');
        const localPlaylists = localStorage.getItem('tv-dashboard-playlists');

        if (localChannels) setChannels(JSON.parse(localChannels));
        if (localPlaylists) setPlaylists(JSON.parse(localPlaylists));
      }
    };

    loadData();
  }, [isReady, getChannels, getPlaylists]);

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    setIsPlayerOpen(true);
  };

  const handleClosePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedChannel(null);
  };

  const handleUploadM3U8 = async () => {
    if (!m3u8Content.trim()) {
      setUploadError('Por favor, cole o conteúdo M3U8');
      return;
    }

    if (!playlistName.trim()) {
      setUploadError('Por favor, insira um nome para a playlist');
      return;
    }

    setIsLoading(true);
    setUploadError('');

    try {
      const parsedChannels = parseM3U8List(m3u8Content);
      if (parsedChannels.length === 0) {
        setUploadError('Nenhum canal encontrado no conteúdo M3U8');
        return;
      }

      // Adicionar IDs únicos e timestamp
      const channelsWithIds = parsedChannels.map((channel, index) => ({
        ...channel,
        id: `channel_${Date.now()}_${index}`,
        playlistId: `playlist_${Date.now()}`,
        addedAt: new Date().toISOString()
      }));

      // Salvar playlist info
      const playlistInfo = {
        id: `playlist_${Date.now()}`,
        name: playlistName,
        channelCount: channelsWithIds.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };

      // Salvar canais e playlist
      const updatedChannels = [...channels, ...channelsWithIds];
      const updatedPlaylists = [...playlists, playlistInfo];

      await saveChannels(channelsWithIds);
      await savePlaylist(playlistInfo);

      setChannels(updatedChannels);
      setPlaylists(updatedPlaylists);

      setIsUploadDialogOpen(false);
      setM3u8Content('');
      setPlaylistName('');
      setUploadError('');

      setSnackbar({
        open: true,
        message: 'Playlist adicionada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setUploadError('Erro ao processar M3U8: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
      setPlaylists(updatedPlaylists);

      setSnackbar({
        open: true,
        message: 'Playlist removida com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao remover playlist',
        severity: 'error'
      });
    }
  };

  const refreshData = async () => {
    if (!isReady) return;

    try {
      const [savedChannels, savedPlaylists] = await Promise.all([
        getChannels(),
        getPlaylists()
      ]);

      setChannels(savedChannels);
      setPlaylists(savedPlaylists);

      setSnackbar({
        open: true,
        message: 'Dados atualizados!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  // Estatísticas
  const totalChannels = channels.length;
  const totalPlaylists = playlists.length;
  const activeChannels = channels.filter(ch => ch.url).length;
  const groupCount = new Set(channels.map(ch => ch.group).filter(Boolean)).size;

  const statsCards = [
    {
      title: 'Total de Canais',
      value: totalChannels,
      icon: <Tv />,
      color: theme.palette.primary.main,
      change: '+12%'
    },
    {
      title: 'Playlists',
      value: totalPlaylists,
      icon: <PlaylistPlay />,
      color: theme.palette.secondary.main,
      change: '+3'
    },
    {
      title: 'Favoritos',
      value: Math.floor(totalChannels * 0.15),
      icon: <Favorite />,
      color: theme.palette.error.main,
      change: '+5%'
    },
    {
      title: 'Grupos',
      value: groupCount,
      icon: <People />,
      color: theme.palette.warning.main,
      change: '+2'
    }
  ];

  return (
    <MainLayout currentPage="dashboard">
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Dashboard IPTV
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Gerencie suas playlists e canais
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={() => router.push('/')}
            >
              Ver TV
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshData}
            >
              Atualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setIsUploadDialogOpen(true)}
            >
              Adicionar Playlist
            </Button>
          </Stack>
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

        {/* Playlists Section */}
        {playlists.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Playlists
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                {playlists.map((playlist) => (
                  <Chip
                    key={playlist.id}
                    avatar={<Avatar>{playlist.channelCount}</Avatar>}
                    label={playlist.name}
                    variant="outlined"
                    onDelete={() => {
                      if (confirm(`Deseja excluir a playlist "${playlist.name}"?`)) {
                        handleDeletePlaylist(playlist.id);
                      }
                    }}
                    deleteIcon={<Delete />}
                    sx={{
                      '& .MuiChip-avatar': {
                        bgcolor: theme.palette.primary.main,
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Playlists Management */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Gerenciar Playlists
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setIsUploadDialogOpen(true)}
              >
                Nova Playlist
              </Button>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>URL</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Canais</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Última Atualização</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {playlists.map((playlist) => (
                    <TableRow key={playlist.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PlaylistPlay sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {playlist.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {playlist.url}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={playlist.channelCount}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={playlist.status === 'active' ? 'Ativo' : 'Inativo'}
                          size="small"
                          color={playlist.status === 'active' ? 'success' : 'error'}
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {new Date(playlist.lastUpdated).toLocaleDateString('pt-BR')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" color="default">
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (confirm(`Deseja excluir a playlist "${playlist.name}"?`)) {
                                handleDeletePlaylist(playlist.id);
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Channels Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Canais IPTV ({channels.length})
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
              showOptions={true}
              onChannelOptions={(channel, action) => {
                console.log('Channel action:', action, channel);
                if (action === 'edit') {
                  // Implementar edição
                } else if (action === 'delete') {
                  // Implementar exclusão
                  if (confirm(`Deseja excluir o canal "${channel.name}"?`)) {
                    const updatedChannels = channels.filter(ch => ch.id !== channel.id);
                    setChannels(updatedChannels);
                    saveChannels(updatedChannels);
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Ações Rápidas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    fullWidth
                    onClick={() => setIsAddPlaylistOpen(true)}
                  >
                    Importar Nova Playlist
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    fullWidth
                  >
                    Exportar Configurações
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Analytics />}
                    fullWidth
                  >
                    Relatório de Uso
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Resumo do Sistema
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Espaço em uso:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>125 MB</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Última sincronização:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Agora</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Status do servidor:</Typography>
                    <Chip label="Online" size="small" color="success" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
          onClose={() => {
            setIsUploadDialogOpen(false);
            setUploadError('');
            setM3u8Content('');
            setPlaylistName('');
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Adicionar Playlist M3U8
            <IconButton onClick={() => {
              setIsUploadDialogOpen(false);
              setUploadError('');
            }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Nome da Playlist"
              fullWidth
              variant="outlined"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Ex: Canais Nacionais"
              sx={{ mb: 2 }}
            />
            <TextField
              autoFocus
              margin="dense"
              label="Conteúdo M3U8"
              multiline
              rows={10}
              fullWidth
              variant="outlined"
              value={m3u8Content}
              onChange={(e) => setM3u8Content(e.target.value)}
              placeholder="Cole aqui o conteúdo da sua playlist M3U8..."
              helperText="Cole o conteúdo completo do arquivo M3U8 ou M3U"
            />
            {uploadError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {uploadError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setIsUploadDialogOpen(false);
              setUploadError('');
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleUploadM3U8}
              variant="contained"
              disabled={!m3u8Content.trim() || !playlistName.trim() || isLoading}
            >
              {isLoading ? 'Processando...' : 'Adicionar Canais'}
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
                url={selectedChannel.url}
                title={selectedChannel.name}
                poster={selectedChannel.logo}
                autoPlay={true}
                height="500px"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}