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
  Snackbar,
  TablePagination,
  InputAdornment
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
  Upload,
  Search,
  Sync,
  AutorenewRounded
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

import MainLayout from '../../src/components/MainLayout';
import ChannelGrid from '../../src/components/ChannelGrid';
import HlsPlayer from '../../src/components/HlsPlayer';
import UploadModal from '../../src/components/UploadModal';
import { useIndexedDB } from '../../src/hooks/useIndexedDB';
import { parseM3U8List, updatePlaylistIntelligently, reclassifyChannels } from '../../src/utils/m3u8Utils';

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { isReady, getChannels, saveChannels, getPlaylists, savePlaylist, deletePlaylist } = useIndexedDB();

  const [channels, setChannels] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [updatingPlaylist, setUpdatingPlaylist] = useState(null);

  // Paginação e filtros
  const [playlistPage, setPlaylistPage] = useState(0);
  const [playlistRowsPerPage, setPlaylistRowsPerPage] = useState(5);
  const [playlistSearchTerm, setPlaylistSearchTerm] = useState('');
  const [channelPage, setChannelPage] = useState(0);
  const [channelRowsPerPage, setChannelRowsPerPage] = useState(12);
  const [channelSearchTerm, setChannelSearchTerm] = useState('');

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

  const handlePlaylistAdded = (newPlaylist) => {
    // Recarregar dados quando nova playlist for adicionada
    refreshData();
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

  const handleUpdatePlaylist = async (playlist) => {
    if (!playlist.url) {
      setSnackbar({
        open: true,
        message: 'Esta playlist não possui URL para atualização',
        severity: 'warning'
      });
      return;
    }

    setUpdatingPlaylist(playlist.id);

    try {
      // Buscar canais atuais da playlist
      const currentChannels = channels.filter(ch => ch.playlistId === playlist.id);

      // Fazer atualização inteligente
      const updateResult = await updatePlaylistIntelligently(playlist.url, currentChannels);

      // Atualizar canais no estado
      const otherChannels = channels.filter(ch => ch.playlistId !== playlist.id);
      const newChannels = [...otherChannels, ...updateResult.channels.map(ch => ({ ...ch, playlistId: playlist.id }))];

      // Atualizar playlist info
      const updatedPlaylist = {
        ...playlist,
        channelCount: updateResult.channels.length,
        liveChannels: updateResult.stats.reclassified.live,
        vodChannels: updateResult.stats.reclassified.vod,
        updatedAt: new Date().toISOString(),
        lastUpdate: {
          timestamp: new Date().toISOString(),
          stats: updateResult.stats
        }
      };

      // Salvar no IndexedDB
      await Promise.all([
        saveChannels(newChannels),
        savePlaylist(updatedPlaylist)
      ]);

      // Atualizar estados
      setChannels(newChannels);
      setPlaylists(prev => prev.map(p => p.id === playlist.id ? updatedPlaylist : p));

      const { stats } = updateResult;
      setSnackbar({
        open: true,
        message: `Playlist "${playlist.name}" atualizada! ${stats.added} novos, ${stats.updated} modificados, ${stats.removed} removidos. Recategorizados: ${stats.reclassified.live} TV + ${stats.reclassified.vod} VOD`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Erro ao atualizar playlist:', error);
      setSnackbar({
        open: true,
        message: `Erro ao atualizar playlist: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setUpdatingPlaylist(null);
    }
  };

  const handleReclassifyChannels = async () => {
    try {
      // Reclassificar todos os canais
      const reclassifiedChannels = reclassifyChannels(channels);

      // Contar mudanças
      let changesCount = 0;
      reclassifiedChannels.forEach((newChannel, index) => {
        if (newChannel.type !== channels[index].type) {
          changesCount++;
        }
      });

      // Salvar canais reclassificados
      await saveChannels(reclassifiedChannels);
      setChannels(reclassifiedChannels);

      // Atualizar contadores nas playlists
      const updatedPlaylists = playlists.map(playlist => {
        const playlistChannels = reclassifiedChannels.filter(ch => ch.playlistId === playlist.id);
        return {
          ...playlist,
          liveChannels: playlistChannels.filter(ch => ch.type === 'live').length,
          vodChannels: playlistChannels.filter(ch => ch.type === 'vod').length
        };
      });

      setPlaylists(updatedPlaylists);

      setSnackbar({
        open: true,
        message: `Reclassificação concluída! ${changesCount} canais tiveram sua categoria alterada com base na análise de URL e extensões.`,
        severity: 'success'
      });

    } catch (error) {
      console.error('Erro ao reclassificar canais:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao reclassificar canais',
        severity: 'error'
      });
    }
  };

  // Filtros e paginação
  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(playlistSearchTerm.toLowerCase()) ||
    (playlist.url && playlist.url.toLowerCase().includes(playlistSearchTerm.toLowerCase()))
  );

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(channelSearchTerm.toLowerCase()) ||
    (channel.group && channel.group.toLowerCase().includes(channelSearchTerm.toLowerCase()))
  );

  const paginatedPlaylists = filteredPlaylists.slice(
    playlistPage * playlistRowsPerPage,
    playlistPage * playlistRowsPerPage + playlistRowsPerPage
  );

  const paginatedChannels = filteredChannels.slice(
    channelPage * channelRowsPerPage,
    channelPage * channelRowsPerPage + channelRowsPerPage
  );

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
                Gerenciar Playlists ({filteredPlaylists.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Pesquisar playlists..."
                value={playlistSearchTerm}
                onChange={(e) => {
                  setPlaylistSearchTerm(e.target.value);
                  setPlaylistPage(0); // Reset to first page on search
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />
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
                  {paginatedPlaylists.length > 0 ? (
                    paginatedPlaylists.map((playlist) => (
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
                          <Stack spacing={1} alignItems="center">
                            <Chip
                              label={playlist.channelCount}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            {playlist.liveChannels !== undefined && playlist.vodChannels !== undefined && (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Chip
                                  label={`${playlist.liveChannels} TV`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                                <Chip
                                  label={`${playlist.vodChannels} VOD`}
                                  size="small"
                                  variant="outlined"
                                  color="secondary"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              </Box>
                            )}
                            {playlist.categorization?.quality && (
                              <Chip
                                label={`${Math.round(playlist.categorization.quality * 100)}% conf.`}
                                size="small"
                                variant="filled"
                                color={
                                  playlist.categorization.quality >= 0.8 ? 'success'
                                    : playlist.categorization.quality >= 0.6 ? 'warning'
                                      : 'error'
                                }
                                sx={{ fontSize: '0.6rem', height: 18 }}
                              />
                            )}
                          </Stack>
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
                            {new Date(playlist.updatedAt || playlist.createdAt).toLocaleDateString('pt-BR')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Visualizar canais">
                              <IconButton size="small" color="primary">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Atualizar playlist (categorização inteligente)">
                              <IconButton
                                size="small"
                                color="secondary"
                                disabled={!playlist.url || updatingPlaylist === playlist.id}
                                onClick={() => handleUpdatePlaylist(playlist)}
                              >
                                {updatingPlaylist === playlist.id ? (
                                  <AutorenewRounded className="animate-spin" />
                                ) : (
                                  <Sync />
                                )}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar playlist">
                              <IconButton size="small" color="default">
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir playlist">
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
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {playlistSearchTerm ? 'Nenhuma playlist encontrada' : 'Nenhuma playlist adicionada'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {filteredPlaylists.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredPlaylists.length}
                  rowsPerPage={playlistRowsPerPage}
                  page={playlistPage}
                  onPageChange={(event, newPage) => setPlaylistPage(newPage)}
                  onRowsPerPageChange={(event) => {
                    setPlaylistRowsPerPage(parseInt(event.target.value, 10));
                    setPlaylistPage(0);
                  }}
                  labelRowsPerPage="Itens por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
                />
              )}
            </TableContainer>
          </CardContent>
        </Card>

        {/* Channels Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Canais IPTV ({filteredChannels.length})
              </Typography>
              <TextField
                size="small"
                placeholder="Pesquisar canais..."
                value={channelSearchTerm}
                onChange={(e) => {
                  setChannelSearchTerm(e.target.value);
                  setChannelPage(0); // Reset to first page on search
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />
            </Box>

            <ChannelGrid
              channels={paginatedChannels}
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

            {filteredChannels.length > channelRowsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <TablePagination
                  component="div"
                  count={filteredChannels.length}
                  page={channelPage}
                  onPageChange={(event, newPage) => setChannelPage(newPage)}
                  rowsPerPage={channelRowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setChannelRowsPerPage(parseInt(event.target.value, 10));
                    setChannelPage(0);
                  }}
                  rowsPerPageOptions={[12, 24, 48, 96]}
                  labelRowsPerPage="Canais por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}

            {paginatedChannels.length === 0 && channelSearchTerm && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhum canal encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tente ajustar os termos de pesquisa
                </Typography>
              </Box>
            )}
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
                    onClick={() => setIsUploadDialogOpen(true)}
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
                  <Button
                    variant="outlined"
                    startIcon={<Sync />}
                    fullWidth
                    onClick={handleReclassifyChannels}
                  >
                    Reclassificar Canais (VOD/TV)
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

        {/* Upload Modal */}
        <UploadModal
          open={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onPlaylistAdded={handlePlaylistAdded}
        />

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