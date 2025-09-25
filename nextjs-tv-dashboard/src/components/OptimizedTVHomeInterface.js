'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
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
  Chip,
  FormControl,
  Select,
  Pagination,
  Switch,
  FormControlLabel,
  Alert
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
  ViewList,
  Speed
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useOptimizedIndexedDB } from '../hooks/useOptimizedIndexedDB';
import { VirtualizedChannelGrid, PerformanceMonitor } from './VirtualizedComponents';
import PerformanceSettings from './PerformanceSettings';

export default function OptimizedTVHomeInterface({
  channels: initialChannels = [],
  onChannelSelect,
  onStartTV
}) {
  const theme = useTheme();
  const router = useRouter();
  const {
    isReady,
    getChannelsPaginated,
    searchChannels,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    getHistory,
    getCacheStats,
    clearCache
  } = useOptimizedIndexedDB();

  // Estados básicos
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [useVirtualization, setUseVirtualization] = useState(true);

  // Estados de dados
  const [channels, setChannels] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentChannels, setRecentChannels] = useState([]);
  const [categories, setCategories] = useState(['Todos']);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChannels, setTotalChannels] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(48);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Estados de UI
  const [hoveredChannel, setHoveredChannel] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);

  // Função para redirecionamento seguro
  const handleDashboardRedirect = useCallback(() => {
    try {
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      window.location.href = '/dashboard';
    }
  }, [router]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isReady) return;

      setIsLoading(true);
      try {
        const [savedFavorites, savedHistory] = await Promise.all([
          getFavorites(),
          getHistory(10)
        ]);

        setFavorites(savedFavorites);

        // Processar histórico para canais recentes
        const recentChannelIds = savedHistory.map(h => h.channelId);
        const recentChannelsData = initialChannels.filter(ch => recentChannelIds.includes(ch.id));
        setRecentChannels(recentChannelsData);

        // Se há canais iniciais (da prop), usar eles
        if (initialChannels && initialChannels.length > 0) {
          setAllChannels(initialChannels);
          setChannels(initialChannels.slice(0, itemsPerPage));
          setTotalChannels(initialChannels.length);
          setTotalPages(Math.ceil(initialChannels.length / itemsPerPage));

          // Extrair categorias únicas
          const uniqueCategories = ['Todos', ...new Set(initialChannels
            .map(ch => ch.group || ch.category)
            .filter(Boolean)
            .sort()
          )];
          setCategories(uniqueCategories);
        } else {
          // Fallback para carregar do IndexedDB
          await loadChannels(1);
        }

      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [isReady, initialChannels, itemsPerPage]);

  // Função para carregar canais com paginação
  const loadChannels = useCallback(async (page = 1, reset = false) => {
    setIsLoading(true);
    try {
      let channelsToProcess = [];

      // Se há canais iniciais, usar eles; senão usar IndexedDB
      if (initialChannels && initialChannels.length > 0) {
        channelsToProcess = [...initialChannels];
      } else if (isReady) {
        // Fallback para IndexedDB quando não há canais na prop
        const filters = {};
        if (selectedCategory !== 'Todos') {
          filters.group = selectedCategory;
        }
        if (selectedType !== 'all') {
          filters.type = selectedType;
        }

        if (searchTerm) {
          channelsToProcess = await searchChannels(searchTerm, 1000); // Buscar muitos para filtrar localmente
        } else {
          const result = await getChannelsPaginated(1, 1000, filters); // Carregar tudo de uma vez para otimização local
          channelsToProcess = result.data;
        }
      }

      // Aplicar filtros locais
      let filteredChannels = channelsToProcess;

      if (selectedCategory !== 'Todos') {
        filteredChannels = filteredChannels.filter(ch =>
          (ch.group || ch.category) === selectedCategory
        );
      }

      if (selectedType !== 'all') {
        filteredChannels = filteredChannels.filter(ch => ch.type === selectedType);
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredChannels = filteredChannels.filter(ch =>
          ch.name?.toLowerCase().includes(searchLower) ||
          ch.group?.toLowerCase().includes(searchLower) ||
          ch.category?.toLowerCase().includes(searchLower)
        );
      }

      // Aplicar ordenação
      filteredChannels.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'group':
            return (a.group || a.category || '').localeCompare(b.group || b.category || '');
          case 'recent':
            return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
          case 'popular':
            const aIsFav = favorites.some(fav => fav.channelId === a.id);
            const bIsFav = favorites.some(fav => fav.channelId === b.id);
            return bIsFav - aIsFav;
          default:
            return 0;
        }
      });

      // Aplicar paginação local
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedChannels = filteredChannels.slice(startIndex, endIndex);

      if (reset || page === 1) {
        setChannels(paginatedChannels);
        setAllChannels(filteredChannels);
      } else {
        setChannels(prev => [...prev, ...paginatedChannels]);
      }

      setTotalChannels(filteredChannels.length);
      setTotalPages(Math.ceil(filteredChannels.length / itemsPerPage));
      setHasMore(endIndex < filteredChannels.length);
      setCurrentPage(page);

      // Extrair categorias únicas
      const uniqueCategories = ['Todos', ...new Set(
        channelsToProcess
          .map(ch => ch.group || ch.category)
          .filter(Boolean)
          .sort()
      )];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Erro ao carregar canais:', error);
    } finally {
      setIsLoading(false);
    }
  }, [initialChannels, isReady, selectedCategory, selectedType, searchTerm, sortBy, itemsPerPage, favorites, getChannelsPaginated, searchChannels]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    if (isReady) {
      loadChannels(1, true);
    }
  }, [selectedCategory, selectedType, sortBy, searchTerm]);

  // Carregar mais dados (scroll infinito)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadChannels(currentPage + 1, false);
  }, [hasMore, isLoading, currentPage, loadChannels]);

  // Estatísticas
  const stats = useMemo(() => {
    const live = channels.filter(ch => ch.type === 'live').length;
    const vod = channels.filter(ch => ch.type === 'vod').length;
    const favoriteIds = new Set(favorites.map(fav => fav.channelId));
    const favCount = channels.filter(ch => favoriteIds.has(ch.id)).length;

    return { live, vod, favorites: favCount, total: totalChannels };
  }, [channels, favorites, totalChannels]);

  const favoriteIds = new Set(favorites.map(fav => fav.channelId));

  // Toggle favorito otimizado
  const handleToggleFavorite = useCallback(async (channel, event) => {
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
  }, [favoriteIds, addToFavorites, removeFromFavorites]);

  // Renderizar card de canal otimizado
  const renderChannelCard = useCallback((channel) => {
    const isFavorite = favoriteIds.has(channel.id);

    return (
      <Box
        key={channel.id}
        sx={{
          position: 'relative',
          cursor: 'pointer',
          height: '100%',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: theme.shadows[4],
            borderColor: 'primary.main',
            zIndex: 2
          }
        }}
        onClick={() => onChannelSelect(channel)}
        onMouseEnter={() => setHoveredChannel(channel.id)}
        onMouseLeave={() => setHoveredChannel(null)}
      >
        {/* Background/Poster */}
        <Box
          sx={{
            height: 120,
            position: 'relative',
            background: channel.image || channel.logo
              ? `url(${channel.image || channel.logo})`
              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.secondary.main, 0.8)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay com botões */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha('#000', 0.3),
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: 1
            }}
          >
            {/* Botão de favorito */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                size="small"
                onClick={(e) => handleToggleFavorite(channel, e)}
                sx={{
                  backgroundColor: alpha('#fff', 0.9),
                  '&:hover': {
                    backgroundColor: '#fff'
                  }
                }}
              >
                {isFavorite ? (
                  <Favorite sx={{ color: 'error.main', fontSize: 18 }} />
                ) : (
                  <FavoriteBorder sx={{ color: 'text.secondary', fontSize: 18 }} />
                )}
              </IconButton>
            </Box>

            {/* Botão de play */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.9),
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main
                  }
                }}
              >
                <PlayArrow />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Informações do canal */}
        <Box sx={{ p: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.9rem',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {channel.name}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {channel.group && (
              <Chip
                label={channel.group}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}

            <Chip
              label={channel.type === 'vod' ? 'VOD' : 'TV'}
              size="small"
              color={channel.type === 'vod' ? 'secondary' : 'primary'}
              variant="filled"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Stack>
        </Box>
      </Box>
    );
  }, [favoriteIds, handleToggleFavorite, onChannelSelect, theme, hoveredChannel]);

  // Atualizar estatísticas de performance periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const cacheStats = getCacheStats();
      setPerformanceStats({
        cache: cacheStats,
        channels: channels.length,
        memory: performance.memory?.usedJSHeapSize
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [getCacheStats, channels.length]);

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(10px)',
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
              TV Dashboard
            </Typography>
            <Badge badgeContent={stats.total} color="primary" max={9999}>
              <Tv sx={{ color: 'text.secondary' }} />
            </Badge>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            {/* Stats rápidas */}
            <Stack direction="row" spacing={1}>
              <Chip label={`${stats.live} TV`} size="small" color="primary" />
              <Chip label={`${stats.vod} VOD`} size="small" color="secondary" />
              <Chip label={`${stats.favorites} ♥`} size="small" color="error" />
            </Stack>

            {/* Controles de visualização */}
            <FormControlLabel
              control={
                <Switch
                  checked={useVirtualization}
                  onChange={(e) => setUseVirtualization(e.target.checked)}
                  size="small"
                />
              }
              label="Virtualização"
              sx={{ ml: 1 }}
            />

            <IconButton onClick={() => setSortMenuAnchor(true)}>
              <Sort />
            </IconButton>

            <IconButton onClick={() => setFilterMenuAnchor(true)}>
              <FilterList />
            </IconButton>

            <IconButton
              onClick={() => setShowPerformanceSettings(true)}
              color="inherit"
              title="Configurações de Performance"
            >
              <Settings />
            </IconButton>

            <Button variant="outlined" onClick={handleDashboardRedirect} startIcon={<Dashboard />}>
              Dashboard
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Controles de busca e filtros */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
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
            sx={{ flex: 1, maxWidth: 400 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              displayEmpty
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="live">TV ao Vivo</MenuItem>
              <MenuItem value="vod">VOD</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
              <MenuItem value={96}>96</MenuItem>
              <MenuItem value={192}>192</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Indicador de loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Alert severity="info" sx={{ display: 'flex', alignItems: 'center' }}>
            Carregando canais... {channels.length > 0 && `(${channels.length} carregados)`}
          </Alert>
        </Box>
      )}

      {/* Grid de canais */}
      <Box sx={{ minHeight: 600 }}>
        {channels.length === 0 && !isLoading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum canal encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tente ajustar os filtros ou termos de busca
            </Typography>
          </Box>
        ) : useVirtualization && channels.length > 48 ? (
          <VirtualizedChannelGrid
            channels={channels}
            onChannelSelect={onChannelSelect}
            renderChannel={renderChannelCard}
            itemWidth={280}
            itemHeight={220}
            containerHeight={600}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 3,
              mb: 4
            }}
          >
            {channels.map(channel => (
              <Box key={channel.id}>
                {renderChannelCard(channel)}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Controles de paginação */}
      {!useVirtualization && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Página {currentPage} de {totalPages} • {totalChannels} canais total
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => loadChannels(page, true)}
              color="primary"
              showFirstButton
              showLastButton
              size="large"
            />
          </Stack>
        </Box>
      )}

      {/* Botão carregar mais para scroll infinito */}
      {useVirtualization && hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={isLoading}
            startIcon={isLoading ? <Speed className="animate-spin" /> : <TrendingUp />}
          >
            {isLoading ? 'Carregando...' : 'Carregar Mais'}
          </Button>
        </Box>
      )}

      {/* Menus */}
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
            <ListItemIcon><Category /></ListItemIcon>
            <ListItemText>{category}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Monitor de Performance */}
      <PerformanceMonitor
        dbStats={performanceStats?.cache}
        renderStats={{
          componentCount: channels.length,
          renderTime: 0
        }}
      />

      {/* Configurações de Performance */}
      <PerformanceSettings
        open={showPerformanceSettings}
        onClose={() => setShowPerformanceSettings(false)}
        onSave={(settings) => {
          console.log('Configurações salvas:', settings);
          // Aplicar configurações...
        }}
      />
    </Container>
  );
}