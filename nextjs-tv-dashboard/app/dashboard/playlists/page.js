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
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem
} from '@mui/material';
import {
  PlaylistPlay,
  Add,
  Edit,
  Delete,
  Refresh,
  CloudUpload,
  Download,
  Link as LinkIcon,
  Tv,
  AccessTime,
  CheckCircle,
  Error,
  Warning,
  MoreVert,
  Visibility,
  Share,
  Update,
  FileUpload,
  Storage
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../src/components/MainLayout';
import { useIndexedDB } from '../../../src/hooks/useIndexedDB';

export default function PlaylistsPage() {
  const router = useRouter();
  const { isReady, getPlaylists, getChannels, deletePlaylist, savePlaylist } = useIndexedDB();

  const [playlists, setPlaylists] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPlaylistForMenu, setSelectedPlaylistForMenu] = useState(null);
  const [sortBy, setSortBy] = useState('name'); // name, date, channels, size
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return;

      try {
        const [savedPlaylists, savedChannels] = await Promise.all([
          getPlaylists(),
          getChannels()
        ]);

        setPlaylists(savedPlaylists);
        setChannels(savedChannels);
      } catch (error) {
        console.error('Erro ao carregar playlists:', error);
      }
    };

    loadData();
  }, [isReady]);

  // Filtrar e ordenar playlists
  const getFilteredAndSortedPlaylists = () => {
    let filtered = playlists;

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.url?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'channels':
          return b.channelCount - a.channelCount;
        case 'size':
          return (b.fileSize || 0) - (a.fileSize || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredPlaylists = getFilteredAndSortedPlaylists();

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('Deseja realmente excluir esta playlist? Todos os canais associados serão removidos.')) return;

    try {
      await deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));

      // Atualizar canais removendo os da playlist excluída
      const updatedChannels = channels.filter(ch => ch.playlistId !== playlistId);
      setChannels(updatedChannels);

      setSnackbar({
        open: true,
        message: 'Playlist excluída com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao excluir playlist',
        severity: 'error'
      });
    }
  };

  const handleEditPlaylist = (playlist) => {
    setEditingPlaylist({ ...playlist });
    setIsEditDialogOpen(true);
    setAnchorEl(null);
  };

  const handleSavePlaylist = async () => {
    if (!editingPlaylist) return;

    try {
      const updatedPlaylist = {
        ...editingPlaylist,
        updatedAt: new Date().toISOString()
      };

      await savePlaylist(updatedPlaylist);
      setPlaylists(prev => prev.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p));
      setIsEditDialogOpen(false);
      setEditingPlaylist(null);

      setSnackbar({
        open: true,
        message: 'Playlist atualizada com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao salvar playlist',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (playlist) => {
    setSelectedPlaylist(playlist);
    setIsDetailsDialogOpen(true);
    setAnchorEl(null);
  };

  const handleMenuClick = (event, playlist) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlaylistForMenu(playlist);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlaylistForMenu(null);
  };

  const getPlaylistChannels = (playlistId) => {
    return channels.filter(ch => ch.playlistId === playlistId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'inactive':
        return <Warning color="warning" />;
      default:
        return <CheckCircle color="success" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'error':
        return 'Erro';
      case 'inactive':
        return 'Inativa';
      default:
        return 'Ativa';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  // Estatísticas
  const totalChannels = playlists.reduce((sum, p) => sum + p.channelCount, 0);
  const activePlaylists = playlists.filter(p => p.status === 'active').length;
  const averageChannelsPerPlaylist = playlists.length > 0 ? Math.round(totalChannels / playlists.length) : 0;

  return (
    <MainLayout currentPage="playlists">
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Gerenciar Playlists
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {playlists.length} playlists • {totalChannels} canais no total
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/dashboard/upload')}
          >
            Nova Playlist
          </Button>
        </Box>

        {/* Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Total de Playlists
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {playlists.length}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PlaylistPlay />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Playlists Ativas
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {activePlaylists}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Total de Canais
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {totalChannels}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Tv />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Média por Playlist
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {averageChannelsPerPlaylist}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Storage />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros e Controles */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  placeholder="Buscar playlists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <SelectMenuItem value="all">Todos</SelectMenuItem>
                    <SelectMenuItem value="active">Ativas</SelectMenuItem>
                    <SelectMenuItem value="inactive">Inativas</SelectMenuItem>
                    <SelectMenuItem value="error">Com Erro</SelectMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Ordenar por</InputLabel>
                  <Select
                    value={sortBy}
                    label="Ordenar por"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <SelectMenuItem value="name">Nome</SelectMenuItem>
                    <SelectMenuItem value="date">Data</SelectMenuItem>
                    <SelectMenuItem value="channels">Nº Canais</SelectMenuItem>
                    <SelectMenuItem value="size">Tamanho</SelectMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                >
                  Atualizar
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista de Playlists */}
        {filteredPlaylists.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <PlaylistPlay sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                {playlists.length === 0 ? 'Nenhuma playlist encontrada' : 'Nenhuma playlist corresponde aos filtros'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {playlists.length === 0
                  ? 'Adicione uma playlist para começar'
                  : 'Tente ajustar os filtros ou termos de busca'
                }
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/dashboard/upload')}
                startIcon={<Add />}
              >
                Adicionar Primeira Playlist
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Playlist</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Canais</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Última Atualização</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tamanho</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlaylists.map((playlist) => (
                  <TableRow key={playlist.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <PlaylistPlay />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {playlist.name}
                          </Typography>
                          {playlist.url && playlist.url !== 'upload' && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {playlist.url}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={playlist.type || 'M3U'}
                        size="small"
                        color="primary"
                        variant="outlined"
                        icon={playlist.source === 'url' ? <LinkIcon /> : <FileUpload />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={playlist.channelCount}
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(playlist.status)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {getStatusLabel(playlist.status)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(playlist.updatedAt).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(playlist.updatedAt).toLocaleTimeString('pt-BR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatFileSize(playlist.fileSize)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Ver Detalhes">
                          <IconButton size="small" onClick={() => handleViewDetails(playlist)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEditPlaylist(playlist)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mais Opções">
                          <IconButton size="small" onClick={(e) => handleMenuClick(e, playlist)}>
                            <MoreVert />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Menu de Contexto */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            if (selectedPlaylistForMenu) {
              router.push(`/dashboard/channels?playlist=${selectedPlaylistForMenu.id}`);
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Tv />
            </ListItemIcon>
            <ListItemText>Ver Canais</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedPlaylistForMenu) {
              handleEditPlaylist(selectedPlaylistForMenu);
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText>Editar</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            // Implementar refresh da playlist
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Update />
            </ListItemIcon>
            <ListItemText>Atualizar</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            // Implementar compartilhamento
            handleMenuClose();
          }}>
            <ListItemIcon>
              <Share />
            </ListItemIcon>
            <ListItemText>Compartilhar</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedPlaylistForMenu) {
                handleDeletePlaylist(selectedPlaylistForMenu.id);
              }
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete color="error" />
            </ListItemIcon>
            <ListItemText>Excluir</ListItemText>
          </MenuItem>
        </Menu>

        {/* Dialog de Detalhes */}
        <Dialog open={isDetailsDialogOpen} onClose={() => setIsDetailsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Detalhes da Playlist</DialogTitle>
          <DialogContent>
            {selectedPlaylist && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {selectedPlaylist.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPlaylist.channelCount} canais • {getStatusLabel(selectedPlaylist.status)}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Tipo:</Typography>
                    <Typography>{selectedPlaylist.type || 'M3U'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Fonte:</Typography>
                    <Typography>{selectedPlaylist.source === 'url' ? 'URL' : 'Upload'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Criada em:</Typography>
                    <Typography>{new Date(selectedPlaylist.createdAt).toLocaleString('pt-BR')}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Atualizada em:</Typography>
                    <Typography>{new Date(selectedPlaylist.updatedAt).toLocaleString('pt-BR')}</Typography>
                  </Grid>
                </Grid>

                {selectedPlaylist.url && selectedPlaylist.url !== 'upload' && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>URL:</Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                      >
                        {selectedPlaylist.url}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Canais da Playlist ({getPlaylistChannels(selectedPlaylist.id).length}):
                  </Typography>
                  <Box sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    {getPlaylistChannels(selectedPlaylist.id).slice(0, 10).map((channel, index) => (
                      <Box key={channel.id} sx={{ p: 1, borderBottom: index < 9 ? 1 : 0, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={channel.logo} sx={{ mr: 1, width: 24, height: 24 }}>
                            <Tv />
                          </Avatar>
                          <Typography variant="body2">{channel.name}</Typography>
                          {channel.group && (
                            <Chip label={channel.group} size="small" variant="outlined" sx={{ ml: 'auto' }} />
                          )}
                        </Box>
                      </Box>
                    ))}
                    {getPlaylistChannels(selectedPlaylist.id).length > 10 && (
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          ... e mais {getPlaylistChannels(selectedPlaylist.id).length - 10} canais
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Fechar</Button>
            <Button variant="contained" onClick={() => {
              setIsDetailsDialogOpen(false);
              if (selectedPlaylist) {
                router.push(`/dashboard/channels?playlist=${selectedPlaylist.id}`);
              }
            }}>
              Ver Canais
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Playlist</DialogTitle>
          <DialogContent>
            {editingPlaylist && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Nome da Playlist"
                  fullWidth
                  value={editingPlaylist.name}
                  onChange={(e) => setEditingPlaylist({ ...editingPlaylist, name: e.target.value })}
                />
                <TextField
                  label="URL (se aplicável)"
                  fullWidth
                  value={editingPlaylist.url || ''}
                  onChange={(e) => setEditingPlaylist({ ...editingPlaylist, url: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editingPlaylist.status}
                    label="Status"
                    onChange={(e) => setEditingPlaylist({ ...editingPlaylist, status: e.target.value })}
                  >
                    <SelectMenuItem value="active">Ativa</SelectMenuItem>
                    <SelectMenuItem value="inactive">Inativa</SelectMenuItem>
                    <SelectMenuItem value="error">Erro</SelectMenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePlaylist} variant="contained">Salvar</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
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