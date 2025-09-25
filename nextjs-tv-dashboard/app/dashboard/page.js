'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  useTheme,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Tv,
  PlaylistPlay,
  CloudUpload,
  Delete,
  Edit,
  Visibility,
  Add,
  Download,
  Upload,
  Analytics,
  TrendingUp,
  People,
  Schedule,
  Storage
} from '@mui/icons-material';

import MainLayout from '../../src/components/MainLayout';

export default function Dashboard() {
  const theme = useTheme();
  const [channels, setChannels] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isAddPlaylistOpen, setIsAddPlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Carregar dados do localStorage
    const savedChannels = localStorage.getItem('tv-dashboard-channels');
    const savedPlaylists = localStorage.getItem('tv-dashboard-playlists');

    if (savedChannels) {
      setChannels(JSON.parse(savedChannels));
    }

    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    } else {
      // Dados de exemplo para playlists
      const samplePlaylists = [
        {
          id: 'playlist-1',
          name: 'Canais Nacionais',
          url: 'https://exemplo.com/nacionais.m3u8',
          channelCount: 45,
          lastUpdated: new Date().toISOString(),
          status: 'active'
        },
        {
          id: 'playlist-2',
          name: 'Esportes Premium',
          url: 'https://exemplo.com/esportes.m3u8',
          channelCount: 23,
          lastUpdated: new Date(Date.now() - 86400000).toISOString(),
          status: 'active'
        }
      ];
      setPlaylists(samplePlaylists);
      localStorage.setItem('tv-dashboard-playlists', JSON.stringify(samplePlaylists));
    }
  }, []);

  const handleAddPlaylist = () => {
    if (!newPlaylistName.trim() || !newPlaylistUrl.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor, preencha todos os campos',
        severity: 'error'
      });
      return;
    }

    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      name: newPlaylistName,
      url: newPlaylistUrl,
      channelCount: 0,
      lastUpdated: new Date().toISOString(),
      status: 'active'
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    setPlaylists(updatedPlaylists);
    localStorage.setItem('tv-dashboard-playlists', JSON.stringify(updatedPlaylists));

    setNewPlaylistName('');
    setNewPlaylistUrl('');
    setIsAddPlaylistOpen(false);
    setSnackbar({
      open: true,
      message: 'Playlist adicionada com sucesso!',
      severity: 'success'
    });
  };

  const handleDeletePlaylist = (playlistId) => {
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    setPlaylists(updatedPlaylists);
    localStorage.setItem('tv-dashboard-playlists', JSON.stringify(updatedPlaylists));
    setSnackbar({
      open: true,
      message: 'Playlist removida com sucesso!',
      severity: 'success'
    });
  };

  // Estatísticas
  const totalChannels = channels.length;
  const totalPlaylists = playlists.length;
  const activeChannels = channels.filter(ch => ch.link).length;
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
      title: 'Playlists Ativas',
      value: totalPlaylists,
      icon: <PlaylistPlay />,
      color: theme.palette.secondary.main,
      change: '+3'
    },
    {
      title: 'Canais Ativos',
      value: activeChannels,
      icon: <Analytics />,
      color: theme.palette.success.main,
      change: '98%'
    },
    {
      title: 'Categorias',
      value: groupCount,
      icon: <Storage />,
      color: theme.palette.warning.main,
      change: `+${groupCount}`
    }
  ];

  return (
    <MainLayout currentPage="dashboard">
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Dashboard Administrativo
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gerencie suas playlists IPTV e monitore estatísticas
          </Typography>
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
                onClick={() => setIsAddPlaylistOpen(true)}
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
                            onClick={() => handleDeletePlaylist(playlist.id)}
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

        {/* Add Playlist Dialog */}
        <Dialog
          open={isAddPlaylistOpen}
          onClose={() => setIsAddPlaylistOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Adicionar Nova Playlist</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Nome da Playlist"
                fullWidth
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Ex: Canais Nacionais"
              />
              <TextField
                label="URL da Playlist M3U8"
                fullWidth
                value={newPlaylistUrl}
                onChange={(e) => setNewPlaylistUrl(e.target.value)}
                placeholder="https://exemplo.com/playlist.m3u8"
                type="url"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddPlaylistOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPlaylist} variant="contained">
              Adicionar
            </Button>
          </DialogActions>
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