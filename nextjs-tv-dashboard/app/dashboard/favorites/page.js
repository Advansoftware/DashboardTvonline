'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Divider
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  PlayArrow,
  Delete,
  MoreVert,
  Tv,
  AccessTime,
  Star,
  Share,
  Edit,
  Close
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../src/components/MainLayout';
import ChannelGrid from '../../../src/components/ChannelGrid';
import UniversalPlayer from '../../../src/components/UniversalPlayer';
import { useOptimizedIndexedDB } from '../../../src/hooks/useOptimizedIndexedDB';

export default function FavoritesPage() {
  const router = useRouter();
  const { isReady, getChannels, getFavorites, addToFavorites, removeFromFavorites } = useOptimizedIndexedDB();

  const [channels, setChannels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteChannels, setFavoriteChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
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

        // Filtrar canais favoritos
        const favoriteIds = new Set(savedFavorites.map(fav => fav.channelId));
        const favoriteChannelsList = savedChannels.filter(ch => favoriteIds.has(ch.id));

        // Adicionar data de adição aos favoritos
        const favoriteChannelsWithDate = favoriteChannelsList.map(channel => {
          const favoriteInfo = savedFavorites.find(fav => fav.channelId === channel.id);
          return {
            ...channel,
            favoriteAddedAt: favoriteInfo?.addedAt || new Date().toISOString()
          };
        });

        // Ordenar por data de adição (mais recentes primeiro)
        favoriteChannelsWithDate.sort((a, b) =>
          new Date(b.favoriteAddedAt) - new Date(a.favoriteAddedAt)
        );

        setFavoriteChannels(favoriteChannelsWithDate);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    };

    loadData();
  }, [isReady]);

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
    setIsPlayerOpen(true);
  };

  const handleRemoveFromFavorites = async (channelId) => {
    try {
      await removeFromFavorites(channelId);

      // Atualizar estado local
      setFavorites(prev => prev.filter(fav => fav.channelId !== channelId));
      setFavoriteChannels(prev => prev.filter(ch => ch.id !== channelId));

      setSnackbar({
        open: true,
        message: 'Canal removido dos favoritos',
        severity: 'info'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao remover dos favoritos',
        severity: 'error'
      });
    }
  };

  const handleClearAllFavorites = async () => {
    if (!confirm('Deseja realmente remover todos os canais dos favoritos?')) return;

    try {
      // Remover todos os favoritos
      for (const favorite of favorites) {
        await removeFromFavorites(favorite.channelId);
      }

      setFavorites([]);
      setFavoriteChannels([]);

      setSnackbar({
        open: true,
        message: 'Todos os favoritos foram removidos',
        severity: 'info'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao limpar favoritos',
        severity: 'error'
      });
    }
  };

  const handleMenuClick = (event, channel) => {
    setAnchorEl(event.currentTarget);
    setSelectedChannelForMenu(channel);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChannelForMenu(null);
  };

  const getGroupedFavorites = () => {
    const grouped = {};
    favoriteChannels.forEach(channel => {
      const group = channel.group || 'Sem Grupo';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(channel);
    });
    return grouped;
  };

  const groupedFavorites = getGroupedFavorites();

  return (
    <MainLayout currentPage="favorites">
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Canais Favoritos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {favoriteChannels.length} canais marcados como favoritos
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/dashboard/channels')}
            >
              Ver Todos os Canais
            </Button>
            {favoriteChannels.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearAllFavorites}
              >
                Limpar Favoritos
              </Button>
            )}
          </Box>
        </Box>

        {favoriteChannels.length === 0 ? (
          // Estado vazio
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <FavoriteBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Nenhum canal favorito
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Adicione canais aos favoritos para acesso rápido
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push('/dashboard/channels')}
                startIcon={<Tv />}
              >
                Explorar Canais
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={4}>
            {/* Estatísticas */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                          Total de Favoritos
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          {favoriteChannels.length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <Favorite />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                          Grupos Diferentes
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          {Object.keys(groupedFavorites).length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Star />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                          Adicionados Hoje
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          {favoriteChannels.filter(ch => {
                            const today = new Date().toDateString();
                            const addedDate = new Date(ch.favoriteAddedAt).toDateString();
                            return today === addedDate;
                          }).length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <AccessTime />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="body2">
                          Grupo Mais Popular
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                          {Object.entries(groupedFavorites).sort((a, b) => b[1].length - a[1].length)[0]?.[0] || 'N/A'}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <Tv />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Lista de Favoritos por Grupo */}
            {Object.entries(groupedFavorites).map(([groupName, groupChannels]) => (
              <Card key={groupName}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {groupName}
                    </Typography>
                    <Chip
                      label={`${groupChannels.length} canais`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <ChannelGrid
                    channels={groupChannels}
                    onChannelSelect={handleChannelSelect}
                    showOptions={true}
                    onChannelOptions={(channel, action) => {
                      if (action === 'delete') {
                        handleRemoveFromFavorites(channel.id);
                      } else if (action === 'play') {
                        handleChannelSelect(channel);
                      }
                    }}
                    customActions={[
                      {
                        icon: <Delete />,
                        label: 'Remover dos Favoritos',
                        action: 'delete',
                        color: 'error'
                      }
                    ]}
                  />
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* Menu de Contexto */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
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
              handleRemoveFromFavorites(selectedChannelForMenu.id);
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <FavoriteBorder />
            </ListItemIcon>
            <ListItemText>Remover dos Favoritos</ListItemText>
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
        </Menu>

        {/* Player Dialog */}
        <Dialog
          open={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Favorite sx={{ mr: 1, color: 'error.main' }} />
              {selectedChannel?.name}
            </Box>
            <IconButton onClick={() => setIsPlayerOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {selectedChannel && (
              <UniversalPlayer
                url={selectedChannel.url || selectedChannel.link}
                title={selectedChannel.name}
                poster={selectedChannel.logo || selectedChannel.image}
                autoPlay={true}
                height="500px"
                contentType={selectedChannel.type === 'vod' ? 'vod' : null}
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