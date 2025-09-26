'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  Button,
  Stack,
  Chip
} from '@mui/material';
import { Grid as VirtualizedGrid } from 'react-window';
import { List as VirtualizedList } from 'react-window';

// Hook para virtualização otimizada
export const useVirtualization = (items, itemHeight = 80, containerHeight = 600) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);

  const itemCount = items.length;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollOffset / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 5, itemCount); // Buffer de 5 itens

  useEffect(() => {
    const visible = items.slice(startIndex, endIndex);
    setVisibleItems(visible);
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback((scrollTop) => {
    setScrollOffset(scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight: itemCount * itemHeight,
    startIndex,
    endIndex,
    handleScroll,
    itemHeight,
    visibleCount
  };
};

// Componente de grid virtualizado para canais
export const VirtualizedChannelGrid = ({
  channels = [],
  onChannelSelect,
  itemWidth = 280,
  itemHeight = 200,
  containerHeight = 600,
  renderChannel
}) => {
  const theme = useTheme();
  const gridRef = useRef();

  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const calculateColumns = () => {
      if (typeof window !== 'undefined') {
        const columns = Math.floor(window.innerWidth / itemWidth) || 4;
        setColumnCount(columns);
      }
    };

    calculateColumns();
    window.addEventListener('resize', calculateColumns);
    return () => window.removeEventListener('resize', calculateColumns);
  }, [itemWidth]);
  const rowCount = Math.ceil(channels.length / columnCount);

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    const channel = channels[index];

    if (!channel) {
      return <div style={style} />;
    }

    return (
      <div style={style}>
        <Box sx={{ p: 1, height: '100%' }}>
          {renderChannel ? renderChannel(channel) : (
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
              onClick={() => onChannelSelect?.(channel)}
            >
              <Typography variant="body2" noWrap>
                {channel.name}
              </Typography>
              {channel.group && (
                <Chip size="small" label={channel.group} sx={{ mt: 1 }} />
              )}
            </Box>
          )}
        </Box>
      </div>
    );
  }, [channels, columnCount, onChannelSelect, renderChannel]);

  if (channels.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: containerHeight,
          flexDirection: 'column'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Nenhum canal encontrado
        </Typography>
      </Box>
    );
  }

  if (typeof window === 'undefined') {
    return (
      <Box sx={{ height: containerHeight, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: containerHeight, width: '100%' }}>
      <VirtualizedGrid
        ref={gridRef}
        columnCount={columnCount}
        columnWidth={itemWidth}
        height={containerHeight}
        rowCount={rowCount}
        rowHeight={itemHeight}
        width="100%"
        overscanRowCount={2}
        overscanColumnCount={1}
      >
        {Cell}
      </VirtualizedGrid>
    </Box>
  );
};

// Componente de lista virtualizada para playlists
export const VirtualizedPlaylistList = ({
  playlists = [],
  onPlaylistSelect,
  itemHeight = 80,
  containerHeight = 400,
  renderPlaylist
}) => {
  const listRef = useRef();

  const Row = useCallback(({ index, style }) => {
    const playlist = playlists[index];

    if (!playlist) {
      return <div style={style} />;
    }

    return (
      <div style={style}>
        <Box sx={{ px: 2, py: 1 }}>
          {renderPlaylist ? renderPlaylist(playlist) : (
            <Box
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
              onClick={() => onPlaylistSelect?.(playlist)}
            >
              <Typography variant="body1">
                {playlist.name}
              </Typography>
              <Chip size="small" label={`${playlist.channelCount} canais`} />
            </Box>
          )}
        </Box>
      </div>
    );
  }, [playlists, onPlaylistSelect, renderPlaylist]);

  if (playlists.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: containerHeight,
          flexDirection: 'column'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Nenhuma playlist encontrada
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: containerHeight, width: '100%' }}>
      <VirtualizedList
        ref={listRef}
        height={containerHeight}
        itemCount={playlists.length}
        itemSize={itemHeight}
        width="100%"
        overscanCount={5}
      >
        {Row}
      </VirtualizedList>
    </Box>
  );
};

// Hook para paginação infinita
export const useInfiniteScroll = (loadMore, hasMore, isLoading) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!isFetching) return;

    const fetchMoreData = async () => {
      if (hasMore && !isLoading) {
        await loadMore();
      }
      setIsFetching(false);
    };

    fetchMoreData();
  }, [isFetching, hasMore, isLoading, loadMore]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) {
        return;
      }

      if (hasMore) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  return [isFetching, setIsFetching];
};

// Componente de diagnóstico de performance
export const PerformanceMonitor = ({ dbStats, renderStats }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <Button
        size="small"
        onClick={() => setIsVisible(true)}
        sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 1000 }}
      >
        Performance
      </Button>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
        minWidth: 300
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Performance</Typography>
          <Button size="small" onClick={() => setIsVisible(false)}>
            ×
          </Button>
        </Box>

        {dbStats && (
          <Box>
            <Typography variant="subtitle2">IndexedDB Cache:</Typography>
            <Typography variant="caption">
              Total: {dbStats.total} | Ativo: {dbStats.active} | Expirado: {dbStats.expired}
            </Typography>
          </Box>
        )}

        {renderStats && (
          <Box>
            <Typography variant="subtitle2">Renderização:</Typography>
            <Typography variant="caption">
              Componentes: {renderStats.componentCount || 0} |
              Tempo: {renderStats.renderTime || 0}ms
            </Typography>
          </Box>
        )}

        <Box>
          <Typography variant="subtitle2">Memória:</Typography>
          <Typography variant="caption">
            Heap: {Math.round((performance.memory?.usedJSHeapSize || 0) / 1024 / 1024)}MB
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};