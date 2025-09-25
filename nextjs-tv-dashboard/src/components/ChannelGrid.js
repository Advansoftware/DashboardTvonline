'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  PlayArrow,
  MoreVert,
  Search,
  Add,
  Tv,
  Movie,
  SportsFootball as Sports,
  Article as News,
  MusicNote
} from '@mui/icons-material';

const getGroupIcon = (groupName) => {
  const group = groupName?.toLowerCase() || '';
  if (group.includes('sport') || group.includes('esporte')) return <Sports />;
  if (group.includes('news') || group.includes('noticia') || group.includes('jornalismo')) return <News />;
  if (group.includes('movie') || group.includes('filme') || group.includes('cinema')) return <Movie />;
  if (group.includes('music') || group.includes('musica')) return <MusicNote />;
  return <Tv />;
};

const getGroupColor = (groupName) => {
  const group = groupName?.toLowerCase() || '';
  if (group.includes('sport') || group.includes('esporte')) return '#4CAF50';
  if (group.includes('news') || group.includes('noticia') || group.includes('jornalismo')) return '#FF5722';
  if (group.includes('movie') || group.includes('filme') || group.includes('cinema')) return '#9C27B0';
  if (group.includes('music') || group.includes('musica')) return '#E91E63';
  return '#2196F3';
};

const ChannelGrid = ({ channels, onChannelSelect, onChannelOptions }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Filtrar canais
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = !searchTerm ||
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (channel.group && channel.group.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGroup = selectedGroup === 'all' || channel.group === selectedGroup;

    return matchesSearch && matchesGroup;
  });

  // Obter grupos únicos
  const groups = ['all', ...new Set(channels.map(ch => ch.group).filter(Boolean))];

  const handleMenuClick = (event, channel) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedChannel(channel);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChannel(null);
  };

  const handleChannelClick = (channel) => {
    onChannelSelect(channel);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Barra de pesquisa e filtros */}
      <Box sx={{
        mb: 3, display: 'flex', flexDirection:
          'column', gap: 2
      }}>
        <TextField
          fullWidth
          placeholder="Pesquisar canais..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }
          }}
        />

        {/* Filtros por grupo */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {groups.map(group => (
            <Chip
              key={group}
              label={group === 'all' ? 'Todos' : group}
              onClick={() => setSelectedGroup(group)}
              color={selectedGroup === group ? 'primary' : 'default'}
              variant={selectedGroup === group ? 'filled' : 'outlined'}
              icon={group !== 'all' ? getGroupIcon(group) : undefined}
              sx={{
                borderRadius: 2,
                '& .MuiChip-icon': {
                  color: selectedGroup === group ? 'inherit' : getGroupColor(group)
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Grid de canais */}
      <Grid container spacing={2}>
        {filteredChannels.map((channel) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={channel.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
                borderRadius: 3,
                overflow: 'hidden'
              }}
              onClick={() => handleChannelClick(channel)}
            >
              {/* Imagem do canal */}
              <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                <CardMedia
                  component="img"
                  image={channel.image || '/api/placeholder/320/180'}
                  alt={channel.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/320/180';
                  }}
                />

                {/* Overlay com botão play */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    '.MuiCard-root:hover &': {
                      opacity: 1,
                    }
                  }}
                >
                  <IconButton
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.9),
                      color: 'white',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                      }
                    }}
                    size="large"
                  >
                    <PlayArrow fontSize="large" />
                  </IconButton>
                </Box>

                {/* Menu de opções */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    color: theme.palette.text.primary,
                    '&:hover': {
                      backgroundColor: theme.palette.background.paper,
                    }
                  }}
                  size="small"
                  onClick={(e) => handleMenuClick(e, channel)}
                >
                  <MoreVert />
                </IconButton>
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    lineHeight: 1.3,
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {channel.name}
                </Typography>

                {channel.group && (
                  <Chip
                    label={channel.group}
                    size="small"
                    icon={getGroupIcon(channel.group)}
                    sx={{
                      backgroundColor: alpha(getGroupColor(channel.group), 0.1),
                      color: getGroupColor(channel.group),
                      borderColor: alpha(getGroupColor(channel.group), 0.3),
                      border: '1px solid',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mensagem quando não há canais */}
      {filteredChannels.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            textAlign: 'center'
          }}
        >
          <Tv sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum canal encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tente ajustar os filtros ou adicionar uma nova lista M3U8
          </Typography>
        </Box>
      )}

      {/* Menu de contexto */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          handleChannelClick(selectedChannel);
          handleMenuClose();
        }}>
          <PlayArrow sx={{ mr: 1 }} />
          Reproduzir
        </MenuItem>
        <MenuItem onClick={() => {
          onChannelOptions?.(selectedChannel, 'favorite');
          handleMenuClose();
        }}>
          Adicionar aos Favoritos
        </MenuItem>
        <MenuItem onClick={() => {
          onChannelOptions?.(selectedChannel, 'info');
          handleMenuClose();
        }}>
          Informações
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ChannelGrid;