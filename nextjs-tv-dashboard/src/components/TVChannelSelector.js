'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Collapse,
  Drawer,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Badge,
  Fab,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search,
  Tv,
  Movie,
  Favorite,
  FavoriteBorder,
  ExpandLess,
  ExpandMore,
  FilterList,
  Sort,
  Close,
  PlayArrow,
  Settings,
  Home,
  Category,
  Language,
  Schedule,
  GridView,
  ViewList,
  Groups
} from '@mui/icons-material';

export default function TVChannelSelector({
  channels = [],
  onChannelSelect,
  selectedChannel,
  favorites = [],
  onToggleFavorite,
  isOpen = false,
  onClose
}) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [currentTab, setCurrentTab] = useState(0); // 0: Todos, 1: TV, 2: VOD, 3: Favoritos
  const [sortBy, setSortBy] = useState('name'); // name, group, recent
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  // Organizar canais por tipo e grupo
  const organizedChannels = useMemo(() => {
    let filtered = channels;

    // Filtrar por tipo baseado na aba
    switch (currentTab) {
      case 1:
        filtered = filtered.filter(ch => ch.type === 'live');
        break;
      case 2:
        filtered = filtered.filter(ch => ch.type === 'vod');
        break;
      case 3:
        const favoriteIds = new Set(favorites.map(fav => fav.channelId));
        filtered = filtered.filter(ch => favoriteIds.has(ch.id));
        break;
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(ch =>
        ch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ch.group?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por grupo
    if (selectedGroup) {
      filtered = filtered.filter(ch => ch.group === selectedGroup);
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
        default:
          return 0;
      }
    });

    // Agrupar por categoria
    const grouped = {};
    filtered.forEach(channel => {
      const group = channel.group || 'Sem Categoria';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(channel);
    });

    return grouped;
  }, [channels, currentTab, searchTerm, selectedGroup, sortBy, favorites]);

  // Obter grupos únicos
  const allGroups = useMemo(() => {
    const groups = [...new Set(channels.map(ch => ch.group).filter(Boolean))].sort();
    return groups;
  }, [channels]);

  // Estatísticas por tipo
  const stats = useMemo(() => {
    const live = channels.filter(ch => ch.type === 'live').length;
    const vod = channels.filter(ch => ch.type === 'vod').length;
    const favoriteIds = new Set(favorites.map(fav => fav.channelId));
    const favCount = channels.filter(ch => favoriteIds.has(ch.id)).length;

    return { live, vod, favorites: favCount, total: channels.length };
  }, [channels, favorites]);

  const handleToggleGroup = (group) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const favoriteIds = new Set(favorites.map(fav => fav.channelId));

  const renderChannelItem = (channel, compact = false) => (
    <Card
      key={channel.id}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: selectedChannel?.id === channel.id ? 2 : 1,
        borderColor: selectedChannel?.id === channel.id ? 'primary.main' : 'divider',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[4],
          borderColor: 'primary.main'
        }
      }}
      onClick={() => onChannelSelect(channel)}
    >
      <CardContent sx={{ p: compact ? 1 : 2, '&:last-child': { pb: compact ? 1 : 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 1 : 2 }}>
          <Avatar
            src={channel.image || channel.logo}
            sx={{
              width: compact ? 40 : 56,
              height: compact ? 40 : 56,
              bgcolor: channel.type === 'vod' ? 'secondary.main' : 'primary.main'
            }}
          >
            {channel.type === 'vod' ? <Movie /> : <Tv />}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant={compact ? 'body2' : 'subtitle1'}
              sx={{
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {channel.name}
            </Typography>

            {channel.group && (
              <Chip
                label={channel.group}
                size="small"
                variant="outlined"
                sx={{ mt: 0.5, fontSize: '0.7rem' }}
              />
            )}

            {channel.type === 'vod' && (
              <Chip
                label="VOD"
                size="small"
                color="secondary"
                sx={{ mt: 0.5, ml: 0.5 }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(channel);
              }}
            >
              {favoriteIds.has(channel.id) ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>

            <IconButton size="small" color="primary">
              <PlayArrow />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400, md: 450 },
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      {/* Header */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Selecionar Canal
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              <Badge badgeContent={stats.total} color="primary" max={9999}>
                <Typography variant="caption">Todos</Typography>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={stats.live} color="primary" max={9999}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tv fontSize="small" />
                  <Typography variant="caption">TV</Typography>
                </Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={stats.vod} color="secondary" max={9999}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Movie fontSize="small" />
                  <Typography variant="caption">VOD</Typography>
                </Box>
              </Badge>
            }
          />
          <Tab
            label={
              <Badge badgeContent={stats.favorites} color="error" max={9999}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Favorite fontSize="small" />
                  <Typography variant="caption">Favoritos</Typography>
                </Box>
              </Badge>
            }
          />
        </Tabs>
      </Box>

      {/* Controles */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Buscar canais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
            <Button
              size="small"
              startIcon={<Groups />}
              onClick={() => setShowGroupSelector(true)}
              variant={selectedGroup ? 'contained' : 'outlined'}
            >
              {selectedGroup || 'Grupos'}
            </Button>

            <Button
              size="small"
              startIcon={<Sort />}
              onClick={(e) => setSortMenuAnchor(e.currentTarget)}
              variant="outlined"
            >
              Ordenar
            </Button>

            <Button
              size="small"
              startIcon={viewMode === 'grid' ? <ViewList /> : <GridView />}
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              variant="outlined"
            >
              {viewMode === 'grid' ? 'Lista' : 'Grade'}
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Lista de Canais */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {Object.keys(organizedChannels).length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Tv sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Nenhum canal encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tente ajustar os filtros ou termos de busca
            </Typography>
          </Box>
        ) : (
          Object.entries(organizedChannels).map(([group, groupChannels]) => (
            <Box key={group} sx={{ mb: 2 }}>
              {/* Group Header */}
              <ListItemButton
                onClick={() => handleToggleGroup(group)}
                sx={{
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {group}
                      </Typography>
                      <Chip
                        label={groupChannels.length}
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                    </Box>
                  }
                />
                {expandedGroups.has(group) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              {/* Group Channels */}
              <Collapse in={expandedGroups.has(group)} timeout="auto" unmountOnExit>
                <Stack spacing={1} sx={{ pl: 2 }}>
                  {viewMode === 'grid' ? (
                    <Grid container spacing={1}>
                      {groupChannels.map(channel => (
                        <Grid key={channel.id} size={{ xs: 12 }}>
                          {renderChannelItem(channel, true)}
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    groupChannels.map(channel => renderChannelItem(channel, true))
                  )}
                </Stack>
              </Collapse>
            </Box>
          ))
        )}
      </Box>

      {/* Menu de Ordenação */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setSortBy('name'); setSortMenuAnchor(null); }}>
          Por Nome
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('group'); setSortMenuAnchor(null); }}>
          Por Grupo
        </MenuItem>
        <MenuItem onClick={() => { setSortBy('recent'); setSortMenuAnchor(null); }}>
          Mais Recentes
        </MenuItem>
      </Menu>

      {/* Dialog de Seleção de Grupo */}
      <Dialog open={showGroupSelector} onClose={() => setShowGroupSelector(false)}>
        <DialogTitle>Selecionar Grupo</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemButton onClick={() => { setSelectedGroup(''); setShowGroupSelector(false); }}>
                <ListItemText primary="Todos os Grupos" />
              </ListItemButton>
            </ListItem>
            {allGroups.map(group => (
              <ListItem key={group}>
                <ListItemButton onClick={() => { setSelectedGroup(group); setShowGroupSelector(false); }}>
                  <ListItemText primary={group} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Drawer>
  );
}