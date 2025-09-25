'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Fab,
  Stack,
  Button,
  alpha,
  useTheme,
  Container,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Pagination,
  FormControl,
  Select
} from '@mui/material';
import {
  Search,
  Tv,
  Movie,
  Favorite,
  FavoriteBorder,
  PlayArrow,
  Settings,
  Dashboard,
  FilterList,
  Sort,
  Category,
  Schedule,
  TrendingUp,
  Star,
  Groups,
  Language,
  Home,
  GridView,
  ViewList
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useIndexedDB } from '../hooks/useIndexedDB';

export default function TVHomeInterface({
  channels = [],
  onChannelSelect,
  onStartTV
}) {
  const theme = useTheme();
  const router = useRouter();
  const { isReady, getFavorites, addToFavorites, removeFromFavorites, getHistory } = useIndexedDB();

  // Função para redirecionamento seguro
  const handleDashboardRedirect = () => {
    try {
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      // Fallback para redirecionamento manual
      window.location.href = '/dashboard';
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedType, setSelectedType] = useState('all'); // all, live, vod
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [recentChannels, setRecentChannels] = useState([]);
  const [hoveredChannel, setHoveredChannel] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [showPagination, setShowPagination] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return;

      try {
        const [savedFavorites, savedHistory] = await Promise.all([
          getFavorites(),
          getHistory(10)
        ]);

        setFavorites(savedFavorites);

        // Processar histórico para canais recentes
        const recentChannelIds = savedHistory.map(h => h.channelId);
        const recent = channels.filter(ch => recentChannelIds.includes(ch.id))
          .slice(0, 6);
        setRecentChannels(recent);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, [isReady, channels, getFavorites, getHistory]);

  // Organizar canais por categoria e filtros
  const organizedChannels = useMemo(() => {
    let filtered = channels;

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(ch => ch.type === selectedType);
    }

    // Filtrar por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(ch => ch.group === selectedCategory);
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(ch =>
        ch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ch.group?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'group':
          return (a.group || '').localeCompare(b.group || '');
        case 'recent':
          return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
        case 'popular':
          // Simular popularidade baseada em favoritos
          const aIsFav = favorites.some(fav => fav.channelId === a.id);
          const bIsFav = favorites.some(fav => fav.channelId === b.id);
          return bIsFav - aIsFav;
        default:
          return 0;
      }
    });

    return filtered;
  }, [channels, selectedType, selectedCategory, searchTerm, sortBy, favorites]);

  // Paginação
  const paginatedChannels = useMemo(() => {
    if (!showPagination) return organizedChannels;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return organizedChannels.slice(startIndex, endIndex);
  }, [organizedChannels, currentPage, itemsPerPage, showPagination]);

  const totalPages = Math.ceil(organizedChannels.length / itemsPerPage);

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedType, sortBy]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    const cats = [...new Set(channels.map(ch => ch.group).filter(Boolean))].sort();
    return ['Todos', ...cats];
  }, [channels]);

  // Estatísticas
  const stats = useMemo(() => {
    const live = channels.filter(ch => ch.type === 'live').length;
    const vod = channels.filter(ch => ch.type === 'vod').length;
    const favoriteIds = new Set(favorites.map(fav => fav.channelId));
    const favCount = channels.filter(ch => favoriteIds.has(ch.id)).length;

    return { live, vod, favorites: favCount, total: channels.length };
  }, [channels, favorites]);

  const favoriteIds = new Set(favorites.map(fav => fav.channelId));

  // Toggle favorito
  const handleToggleFavorite = async (channel, event) => {
    event.stopPropagation();

    try {
      if (favoriteIds.has(channel.id)) {
        await removeFromFavorites(channel.id);
        setFavorites(prev => prev.filter(fav => fav.channelId !== channel.id));
      } else {
        await addToFavorites(channel.id, channel.name, channel.link || channel.url);
        setFavorites(prev => [...prev, {
          channelId: channel.id,
          channelName: channel.name,
          channelUrl: channel.link || channel.url,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    }
  };

  // Renderizar card de canal
  const renderChannelCard = (channel, size = 'normal') => {
    const isLarge = size === 'large';
    const isFavorite = favoriteIds.has(channel.id);

    return (
      <Card
        key={channel.id}
        sx={{
          cursor: 'pointer',
          height: isLarge ? 280 : 220,
          transition: 'all 0.3s ease',
          border: 1,
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: theme.shadows[8],
            borderColor: 'primary.main',
            zIndex: 2
          }
        }}
        onClick={() => onChannelSelect(channel)}
        onMouseEnter={() => setHoveredChannel(channel.id)}
        onMouseLeave={() => setHoveredChannel(null)}
      >
        {/* Background/Poster */}
        <CardMedia
          component="div"
          sx={{
            height: isLarge ? 180 : 140,
            position: 'relative',
            background: channel.image || channel.logo
              ? `url(${channel.image || channel.logo})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))',
              display: 'flex',
              alignItems: 'flex-end',
              p: 1
            }}
          >
            {/* Play Button */}
            {hoveredChannel === channel.id && (
              <Fab
                size="medium"
                color="primary"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <PlayArrow />
              </Fab>
            )}

            {/* Type Badge */}
            <Chip
              label={channel.type === 'vod' ? 'VOD' : 'TV'}
              size="small"
              color={channel.type === 'vod' ? 'secondary' : 'primary'}
              sx={{ position: 'absolute', top: 8, left: 8 }}
            />

            {/* Favorite Button */}
            <IconButton
              size="small"
              onClick={(e) => handleToggleFavorite(channel, e)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: isFavorite ? 'error.main' : 'white',
                bgcolor: 'rgba(0,0,0,0.5)'
              }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>
        </CardMedia>

        {/* Content */}
        <CardContent sx={{ p: isLarge ? 2 : 1.5, height: isLarge ? 100 : 80 }}>
          <Typography
            variant={isLarge ? 'h6' : 'subtitle2'}
            sx={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mb: 0.5
            }}
          >
            {channel.name}
          </Typography>

          {channel.group && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <Category fontSize="inherit" />
              {channel.group}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  if (channels.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Header */}
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Tv sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                TV Dashboard
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<Dashboard />}
                onClick={handleDashboardRedirect}
                variant="contained"
              >
                Dashboard
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Hero Section - Estado Vazio */}
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                borderRadius: 4,
                p: 8,
                mb: 4
              }}
            >
              <Tv sx={{ fontSize: 80, color: 'white', mb: 3 }} />
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
                Bem-vindo ao TV Dashboard
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
                Sua experiência de streaming personalizada
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Dashboard />}
                onClick={handleDashboardRedirect}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Adicionar Canais
              </Button>
            </Box>
          </Box>

          {/* Recursos em Destaque */}
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
            O que você pode fazer
          </Typography>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  height: '100%'
                }}
              >
                <Tv sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Canais de TV
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Adicione seus canais de TV favoritos via IPTV e assista com qualidade
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  height: '100%'
                }}
              >
                <Movie sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Filmes e Séries
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organize seu conteúdo VOD e tenha uma biblioteca personalizada
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  height: '100%'
                }}
              >
                <Favorite sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Favoritos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Marque seus conteúdos favoritos e tenha acesso rápido
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Call to Action */}
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              Pronto para começar?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Acesse o dashboard para adicionar seus primeiros canais e começar a assistir
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Dashboard />}
              onClick={handleDashboardRedirect}
              sx={{ px: 4, py: 1.5 }}
            >
              Ir para Dashboard
            </Button>
          </Box>
        </Container>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          onClick={handleDashboardRedirect}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
        >
          <Dashboard />
        </Fab>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Tv sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              TV Dashboard
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Badge badgeContent={stats.total} color="primary" max={9999}>
              <Button
                startIcon={<Home />}
                onClick={onStartTV}
                variant="contained"
              >
                Iniciar TV
              </Button>
            </Badge>

            <Button
              startIcon={<Dashboard />}
              onClick={handleDashboardRedirect}
              variant="outlined"
            >
              Dashboard
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Hero Section com Busca */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Escolha o que assistir
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            {stats.live} canais de TV • {stats.vod} conteúdos VOD • {stats.favorites} favoritos
          </Typography>

          {/* Barra de Busca */}
          <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Buscar canais, filmes, séries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.1rem',
                  height: 56
                }
              }}
            />
          </Box>

          {/* Filtros Rápidos */}
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" gap={1}>
            <Button
              variant={selectedType === 'all' ? 'contained' : 'outlined'}
              onClick={() => setSelectedType('all')}
              startIcon={<Tv />}
            >
              Todos ({stats.total})
            </Button>
            <Button
              variant={selectedType === 'live' ? 'contained' : 'outlined'}
              onClick={() => setSelectedType('live')}
              startIcon={<Tv />}
            >
              TV ({stats.live})
            </Button>
            <Button
              variant={selectedType === 'vod' ? 'contained' : 'outlined'}
              onClick={() => setSelectedType('vod')}
              startIcon={<Movie />}
            >
              VOD ({stats.vod})
            </Button>
            <Button
              startIcon={<FilterList />}
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              variant="outlined"
            >
              Categoria
            </Button>
            <Button
              startIcon={<Sort />}
              onClick={(e) => setSortMenuAnchor(e.currentTarget)}
              variant="outlined"
            >
              Ordenar
            </Button>
          </Stack>
        </Box>

        {/* Canais Recentes */}
        {recentChannels.length > 0 && !searchTerm && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ mr: 1 }} />
              Assistidos Recentemente
            </Typography>
            <Grid container spacing={3}>
              {recentChannels.map(channel => (
                <Grid key={channel.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  {renderChannelCard(channel)}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Favoritos */}
        {favorites.length > 0 && !searchTerm && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
              <Favorite sx={{ mr: 1, color: 'error.main' }} />
              Meus Favoritos
            </Typography>
            <Grid container spacing={3}>
              {channels.filter(ch => favoriteIds.has(ch.id)).slice(0, 6).map(channel => (
                <Grid key={channel.id} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
                  {renderChannelCard(channel)}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Todos os Canais */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
            <Category sx={{ mr: 1 }} />
            {searchTerm ? `Resultados para "${searchTerm}"` : selectedCategory}
            <Chip label={organizedChannels.length} color="primary" sx={{ ml: 2 }} />
          </Typography>

          {organizedChannels.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhum resultado encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tente ajustar os filtros ou termos de busca
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {paginatedChannels.map(channel => (
                  <Grid key={channel.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                    {renderChannelCard(channel)}
                  </Grid>
                ))}
              </Grid>

              {/* Controles de Paginação */}
              {organizedChannels.length > 0 && showPagination && (
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 4,
                  gap: 2,
                  p: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, organizedChannels.length)} de {organizedChannels.length} canais
                    </Typography>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        displayEmpty
                      >
                        <MenuItem value={12}>12 por página</MenuItem>
                        <MenuItem value={24}>24 por página</MenuItem>
                        <MenuItem value={48}>48 por página</MenuItem>
                        <MenuItem value={96}>96 por página</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setShowPagination(!showPagination)}
                    >
                      {showPagination ? 'Ver Todos' : 'Paginar'}
                    </Button>
                  </Box>

                  {totalPages > 1 && (
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(event, page) => setCurrentPage(page)}
                      color="primary"
                      showFirstButton
                      showLastButton
                      size="medium"
                    />
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Container>

      {/* Menu de Ordenação */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setSortBy('name'); setSortMenuAnchor(null); }}>
          <ListItemIcon><Sort /></ListItemIcon>
          <ListItemText>Nome</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('group'); setSortMenuAnchor(null); }}>
          <ListItemIcon><Category /></ListItemIcon>
          <ListItemText>Categoria</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('recent'); setSortMenuAnchor(null); }}>
          <ListItemIcon><Schedule /></ListItemIcon>
          <ListItemText>Mais Recentes</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('popular'); setSortMenuAnchor(null); }}>
          <ListItemIcon><Star /></ListItemIcon>
          <ListItemText>Mais Populares</ListItemText>
        </MenuItem>
      </Menu>

      {/* Menu de Filtros */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        {categories.map(category => (
          <MenuItem
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setFilterMenuAnchor(null);
            }}
            selected={selectedCategory === category}
          >
            <ListItemIcon>
              <Category />
            </ListItemIcon>
            <ListItemText>{category}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={onStartTV}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <PlayArrow />
      </Fab>
    </Box>
  );
}