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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Stack,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  Tv,
  AccessTime,
  Favorite,
  PlayArrow,
  Visibility,
  Schedule,
  Group,
  Star,
  Refresh,
  Download,
  DateRange
} from '@mui/icons-material';
import MainLayout from '../../../src/components/MainLayout';
import { useIndexedDB } from '../../../src/hooks/useIndexedDB';

export default function AnalyticsPage() {
  const { isReady, getChannels, getFavorites, getHistory, getPlaylists } = useIndexedDB();

  const [channels, setChannels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [timeFilter, setTimeFilter] = useState('7'); // 7, 30, 90 dias
  const [stats, setStats] = useState({
    totalChannels: 0,
    totalPlaylists: 0,
    totalFavorites: 0,
    totalWatchTime: 0,
    mostWatchedChannel: null,
    topChannels: [],
    channelsByGroup: {},
    dailyUsage: [],
    recentActivity: []
  });

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return;

      try {
        const [savedChannels, savedFavorites, savedHistory, savedPlaylists] = await Promise.all([
          getChannels(),
          getFavorites(),
          getHistory(),
          getPlaylists()
        ]);

        setChannels(savedChannels);
        setFavorites(savedFavorites);
        setHistory(savedHistory);
        setPlaylists(savedPlaylists);

        // Calcular estatísticas
        calculateStats(savedChannels, savedFavorites, savedHistory, savedPlaylists);
      } catch (error) {
        console.error('Erro ao carregar dados para analytics:', error);
      }
    };

    loadData();
  }, [isReady, timeFilter]);

  const calculateStats = (channels, favorites, history, playlists) => {
    const filterDays = parseInt(timeFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);

    // Filtrar histórico por período
    const filteredHistory = history.filter(item =>
      new Date(item.timestamp) >= cutoffDate
    );

    // Canais mais assistidos
    const channelViews = {};
    filteredHistory.forEach(item => {
      channelViews[item.channelId] = (channelViews[item.channelId] || 0) + 1;
    });

    const topChannels = Object.entries(channelViews)
      .map(([channelId, views]) => {
        const channel = channels.find(ch => ch.id === channelId);
        return { channel, views };
      })
      .filter(item => item.channel)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Canal mais assistido
    const mostWatchedChannel = topChannels[0] || null;

    // Canais por grupo
    const channelsByGroup = {};
    channels.forEach(channel => {
      const group = channel.group || 'Sem Grupo';
      channelsByGroup[group] = (channelsByGroup[group] || 0) + 1;
    });

    // Uso diário (últimos 7 dias)
    const dailyUsage = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayViews = history.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= date && itemDate < nextDate;
      }).length;

      dailyUsage.push({
        date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
        views: dayViews
      });
    }

    // Atividade recente
    const recentActivity = filteredHistory
      .slice(-10)
      .reverse()
      .map(item => {
        const channel = channels.find(ch => ch.id === item.channelId);
        return { ...item, channel };
      })
      .filter(item => item.channel);

    // Tempo total assistido (estimativa baseada no número de visualizações)
    const totalWatchTime = filteredHistory.length * 15; // 15 min por visualização (estimativa)

    setStats({
      totalChannels: channels.length,
      totalPlaylists: playlists.length,
      totalFavorites: favorites.length,
      totalWatchTime,
      mostWatchedChannel,
      topChannels,
      channelsByGroup,
      dailyUsage,
      recentActivity
    });
  };

  const formatWatchTime = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const exportData = () => {
    const data = {
      stats,
      exportDate: new Date().toISOString(),
      period: `${timeFilter} dias`
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `analytics-${timeFilter}days-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <MainLayout currentPage="analytics">
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Estatísticas e Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Análise de uso e estatísticas detalhadas
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={timeFilter}
                label="Período"
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <MenuItem value="7">Últimos 7 dias</MenuItem>
                <MenuItem value="30">Últimos 30 dias</MenuItem>
                <MenuItem value="90">Últimos 90 dias</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportData}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
            >
              Atualizar
            </Button>
          </Box>
        </Box>

        {/* Cards de Estatísticas Principais */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      Total de Canais
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {stats.totalChannels}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        +{Math.floor(stats.totalChannels * 0.12)} este mês
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
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
                      Canais Favoritos
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {stats.totalFavorites}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {((stats.totalFavorites / stats.totalChannels) * 100).toFixed(1)}% do total
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
                      Tempo Assistido
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {formatWatchTime(stats.totalWatchTime)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Últimos {timeFilter} dias
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
                      Playlists Ativas
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {stats.totalPlaylists}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.floor(stats.totalChannels / Math.max(stats.totalPlaylists, 1))} canais/playlist
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Analytics />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Canais Mais Assistidos */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Canais Mais Assistidos
                </Typography>
                {stats.topChannels.length === 0 ? (
                  <Alert severity="info">
                    Nenhum histórico de visualização nos últimos {timeFilter} dias
                  </Alert>
                ) : (
                  <List>
                    {stats.topChannels.slice(0, 8).map((item, index) => (
                      <ListItem key={item.channel.id} divider={index < 7}>
                        <ListItemAvatar>
                          <Avatar src={item.channel.logo} sx={{ width: 40, height: 40 }}>
                            <Tv />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {item.channel.name}
                              </Typography>
                              <Chip
                                label={`${item.views} views`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {item.channel.group || 'Sem grupo'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {((item.views / Math.max(stats.topChannels[0].views, 1)) * 100).toFixed(0)}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(item.views / Math.max(stats.topChannels[0].views, 1)) * 100}
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Uso por Grupo */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Canais por Grupo
                </Typography>
                <List>
                  {Object.entries(stats.channelsByGroup)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([group, count], index) => (
                      <ListItem key={group} divider={index < 7}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `hsl(${index * 45}, 70%, 50%)` }}>
                            <Group />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {group}
                              </Typography>
                              <Chip
                                label={`${count} canais`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {((count / stats.totalChannels) * 100).toFixed(1)}% do total
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(count / stats.totalChannels) * 100}
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Uso Diário */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Uso nos Últimos 7 Dias
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, mt: 3, height: 200 }}>
                  {stats.dailyUsage.map((day, index) => {
                    const maxViews = Math.max(...stats.dailyUsage.map(d => d.views)) || 1;
                    const height = Math.max((day.views / maxViews) * 150, 10);

                    return (
                      <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                        <Box
                          sx={{
                            height: `${height}px`,
                            bgcolor: 'primary.main',
                            borderRadius: 1,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'white', pb: 1 }}>
                            {day.views}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {day.date}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Atividade Recente */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Atividade Recente
                </Typography>
                {stats.recentActivity.length === 0 ? (
                  <Alert severity="info">
                    Nenhuma atividade recente
                  </Alert>
                ) : (
                  <List dense>
                    {stats.recentActivity.map((activity, index) => (
                      <ListItem key={index} divider={index < stats.recentActivity.length - 1}>
                        <ListItemAvatar>
                          <Avatar src={activity.channel.logo} sx={{ width: 32, height: 32 }}>
                            <PlayArrow />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.channel.name}
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {new Date(activity.timestamp).toLocaleString('pt-BR')}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Canal Mais Popular */}
          {stats.mostWatchedChannel && (
            <Grid size={{ xs: 12 }}>
              <Card sx={{ bgcolor: 'primary.50', border: 1, borderColor: 'primary.200' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                      src={stats.mostWatchedChannel.channel.logo}
                      sx={{ width: 80, height: 80 }}
                    >
                      <Star sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                        Canal Mais Assistido
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                        {stats.mostWatchedChannel.channel.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stats.mostWatchedChannel.views} visualizações nos últimos {timeFilter} dias
                      </Typography>
                      {stats.mostWatchedChannel.channel.group && (
                        <Chip
                          label={stats.mostWatchedChannel.channel.group}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                        #{1}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        TOP CANAL
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </MainLayout>
  );
}