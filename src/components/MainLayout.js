'use client';

import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Divider,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Tv,
  PlaylistPlay,
  Settings,
  Favorite,
  Analytics,
  CloudUpload,
  DarkMode,
  LightMode,
  Home
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTheme as useCustomTheme } from '../theme/ThemeProvider';

const DRAWER_WIDTH = 280;

const MainLayout = ({ children, currentPage = 'dashboard' }) => {
  const theme = useTheme();
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (href) => {
    router.push(href);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const menuItems = [
    { id: 'home', label: 'Início', icon: <Home />, href: '/' },
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
    { id: 'channels', label: 'Canais IPTV', icon: <Tv />, href: '/dashboard/channels' },
    { id: 'playlists', label: 'Playlists', icon: <PlaylistPlay />, href: '/dashboard/playlists' },
    { id: 'favorites', label: 'Favoritos', icon: <Favorite />, href: '/dashboard/favorites' },
    { id: 'upload', label: 'Upload M3U8', icon: <CloudUpload />, href: '/dashboard/upload' },
    { id: 'analytics', label: 'Estatísticas', icon: <Analytics />, href: '/dashboard/analytics' },
    { id: 'settings', label: 'Configurações', icon: <Settings />, href: '/dashboard/settings' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Header do Drawer */}
      <Box
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            mx: 'auto',
            mb: 1,
            backgroundColor: 'rgba(255,255,255,0.2)',
            fontSize: '1.5rem'
          }}
        >
          📺
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
          }}
        >
          TV Dashboard
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          IPTV Manager & Player
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flex: 1, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ px: 1 }}>
            <ListItemButton
              selected={currentPage === item.id}
              onClick={() => handleNavigation(item.href)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: currentPage === item.id ? 'inherit' : theme.palette.text.secondary,
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: currentPage === item.id ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Footer do Drawer */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Versão 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems.find(item => item.id === currentPage)?.label || 'TV Dashboard'}
          </Typography>

          {/* Theme Toggle */}
          <Tooltip title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {isDarkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* Avatar do usuário */}
          <Tooltip title="Perfil do Usuário">
            <IconButton sx={{ ml: 1 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: '1rem' }}>
                👤
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              border: 'none',
              boxShadow: theme.shadows[1],
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}

        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: theme.palette.background.default,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;