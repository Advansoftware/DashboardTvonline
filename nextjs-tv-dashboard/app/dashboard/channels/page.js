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
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Avatar,
  Stack
} from '@mui/material';
import {
  Search,
  FilterList,
  Edit,
  Delete,
  PlayArrow,
  Favorite,
  FavoriteBorder,
  MoreVert,
  Add,
  GridView,
  ViewList,
  Tv,
  Language,
  Group,
  Link as LinkIcon,
  Check,
  Close
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../src/components/MainLayout';
import ChannelGrid from '../../../src/components/ChannelGrid';
import HlsPlayer from '../../../src/components/HlsPlayer';
import { useIndexedDB } from '../../../src/hooks/useIndexedDB';

export default function ChannelsPage() {
  const router = useRouter();
  const { isReady, getChannels, saveChannels, getFavorites, addToFavorites, removeFromFavorites } = useIndexedDB();

  const [channels, setChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentTab, setCurrentTab] = useState(0); // 0: Todos, 1: Favoritos
  const [selectedChannels, setSelectedChannels] = useState(new Set());
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedChannelForMenu, setSelectedChannelForMenu] = useState(null);

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return;

      try {
        const [savedChannels, savedFavorites] = await Promise.all([
          getChannels(),
          getFavorites()
        ]);

        setChannels(savedChannels);
        setFavorites(savedFavorites);
        setFilteredChannels(savedChannels);
      } catch (error) {
        console.error('Erro ao carregar canais:', error);
      }
    };

    loadData();
  }, [isReady]);

  // Filtrar canais
  useEffect(() => {
    let filtered = channels;

    // Filtro por aba
    if (currentTab === 1) {
      const favoriteIds = new Set(favorites.map(fav => fav.channelId));
      filtered = channels.filter(ch => favoriteIds.has(ch.id));
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(ch =>
        ch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ch.group?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por grupo
    if (selectedGroup) {
      filtered = filtered.filter(ch => ch.group === selectedGroup);
    }

    setFilteredChannels(filtered);
  }, [channels, favorites, searchTerm, selectedGroup, currentTab]);

  // Obter grupos únicos
  const groups = [...new Set(channels.map(ch => ch.group).filter(Boolean))].sort();

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    setIsPlayerOpen(true);
  };

  const handleToggleFavorite = async (channel) => {
    const favoriteIds = new Set(favorites.map(fav => fav.channelId));

    try {
      if (favoriteIds.has(channel.id)) {
        await removeFromFavorites(channel.id);
        setFavorites(prev => prev.filter(fav => fav.channelId !== channel.id));
        setSnackbar({ open: true, message: 'Removido dos favoritos', severity: 'info' });
      } else {
        await addToFavorites(channel);
        setFavorites(prev => [...prev, { channelId: channel.id, addedAt: new Date().toISOString() }]);
        setSnackbar({ open: true, message: 'Adicionado aos favoritos', severity: 'success' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao atualizar favoritos', severity: 'error' });
    }
  };

  const handleEditChannel = (channel) => {
    setEditingChannel({ ...channel });
    setIsEditDialogOpen(true);
    setAnchorEl(null);
  };

  const handleSaveChannel = async () => {
    if (!editingChannel) return;

    try {
      const updatedChannels = channels.map(ch =>
        ch.id === editingChannel.id ? editingChannel : ch
      );

      await saveChannels(updatedChannels);
      setChannels(updatedChannels);
      setIsEditDialogOpen(false);
      setEditingChannel(null);
      setSnackbar({ open: true, message: 'Canal atualizado com sucesso!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar canal', severity: 'error' });
    }
  };

  const handleDeleteChannel = async (channelId) => {
    if (!confirm('Deseja realmente excluir este canal?')) return;

    try {
      const updatedChannels = channels.filter(ch => ch.id !== channelId);
      await saveChannels(updatedChannels);
      setChannels(updatedChannels);
      setSnackbar({ open: true, message: 'Canal excluído com sucesso!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao excluir canal', severity: 'error' });
    }
  };

  const handleSelectChannel = (channelId) => {
    const newSelected = new Set(selectedChannels);
    if (newSelected.has(channelId)) {
      newSelected.delete(channelId);
    } else {
      newSelected.add(channelId);
    }
    setSelectedChannels(newSelected);
  };

  const handleMenuClick = (event, channel) => {
    setAnchorEl(event.currentTarget);
    setSelectedChannelForMenu(channel);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChannelForMenu(null);
  };

  const favoriteIds = new Set(favorites.map(fav => fav.channelId));

  return (
    <MainLayout currentPage="channels">
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Canais IPTV
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie seus canais de TV
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/dashboard/upload')}
          >
            Adicionar Canais
          </Button>
        </Box>

        {/* Filtros e Controles */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Buscar canais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Grupo</InputLabel>
                  <Select
                    value={selectedGroup}
                    label="Grupo"
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <MenuItem value="">Todos os grupos</MenuItem>
                    {groups.map(group => (
                      <MenuItem key={group} value={group}>{group}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tabs
                    value={currentTab}
                    onChange={(e, newValue) => setCurrentTab(newValue)}
                  >
                    <Tab label={`Todos (${channels.length})`} />
                    <Tab label={`Favoritos (${favorites.length})`} />
                  </Tabs>
                  <Box>
                    <Tooltip title="Visualização em Grade">
                      <IconButton
                        color={viewMode === 'grid' ? 'primary' : 'default'}
                        onClick={() => setViewMode('grid')}
                      >
                        <GridView />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Visualização em Lista">
                      <IconButton
                        color={viewMode === 'list' ? 'primary' : 'default'}
                        onClick={() => setViewMode('list')}
                      >
                        <ViewList />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lista/Grid de Canais */}
        {viewMode === 'grid' ? (
          <ChannelGrid
            channels={filteredChannels}
            onChannelSelect={handleChannelSelect}
            showOptions={true}
            onChannelOptions={(channel, action) => {
              if (action === 'edit') {
                handleEditChannel(channel);
              } else if (action === 'delete') {
                handleDeleteChannel(channel.id);
              } else if (action === 'favorite') {
                handleToggleFavorite(channel);
              }
            }}
          />
        ) : (
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>Canal</TableCell>
                    <TableCell>Grupo</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredChannels.map((channel) => (
                    <TableRow key={channel.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedChannels.has(channel.id)}
                          onChange={() => handleSelectChannel(channel.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={channel.logo} sx={{ mr: 2, width: 40, height: 40 }}>
                            <Tv />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {channel.name}
                            </Typography>
                            {favoriteIds.has(channel.id) && (
                              <Chip
                                label="Favorito"
                                size="small"
                                color="primary"
                                icon={<Favorite />}
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={channel.group || 'Sem grupo'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {channel.url}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Ativo"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleChannelSelect(channel)} color="primary">
                          <PlayArrow />
                        </IconButton>
                        <IconButton
                          onClick={() => handleToggleFavorite(channel)}
                          color={favoriteIds.has(channel.id) ? 'error' : 'default'}
                        >
                          {favoriteIds.has(channel.id) ? <Favorite /> : <FavoriteBorder />}
                        </IconButton>
                        <IconButton onClick={(e) => handleMenuClick(e, channel)}>
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Menu de Contexto */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuList>
            <MenuItem onClick={() => {
              if (selectedChannelForMenu) {
                handleChannelSelect(selectedChannelForMenu);
              }
              handleMenuClose();
            }}>
              <ListItemIcon>
                <PlayArrow />
              </ListItemIcon>
              <ListItemText>Reproduzir</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedChannelForMenu) {
                handleEditChannel(selectedChannelForMenu);
              }
              handleMenuClose();
            }}>
              <ListItemIcon>
                <Edit />
              </ListItemIcon>
              <ListItemText>Editar</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedChannelForMenu) {
                handleToggleFavorite(selectedChannelForMenu);
              }
              handleMenuClose();
            }}>
              <ListItemIcon>
                {selectedChannelForMenu && favoriteIds.has(selectedChannelForMenu.id) ? <Favorite /> : <FavoriteBorder />}
              </ListItemIcon>
              <ListItemText>
                {selectedChannelForMenu && favoriteIds.has(selectedChannelForMenu.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
              </ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (selectedChannelForMenu) {
                  handleDeleteChannel(selectedChannelForMenu.id);
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
          </MenuList>
        </Menu>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Editar Canal</DialogTitle>
          <DialogContent>
            {editingChannel && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Nome do Canal"
                  fullWidth
                  value={editingChannel.name}
                  onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                />
                <TextField
                  label="URL do Stream"
                  fullWidth
                  value={editingChannel.url}
                  onChange={(e) => setEditingChannel({ ...editingChannel, url: e.target.value })}
                />
                <TextField
                  label="Logo URL"
                  fullWidth
                  value={editingChannel.logo || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, logo: e.target.value })}
                />
                <TextField
                  label="Grupo"
                  fullWidth
                  value={editingChannel.group || ''}
                  onChange={(e) => setEditingChannel({ ...editingChannel, group: e.target.value })}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveChannel} variant="contained">Salvar</Button>
          </DialogActions>
        </Dialog>

        {/* Player Dialog */}
        <Dialog
          open={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedChannel?.name}</Typography>
            <IconButton onClick={() => setIsPlayerOpen(false)}>
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