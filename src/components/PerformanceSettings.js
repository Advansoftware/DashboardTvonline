'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Slider,
  FormControl,
  FormLabel,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  Divider,
  Box,
  Chip,
  Alert
} from '@mui/material';
import { Settings, Speed, Memory, Visibility } from '@mui/icons-material';

const PerformanceSettings = ({ open, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    // Cache Settings
    cacheSize: 50, // MB
    cacheTTL: 5, // minutes
    enableMemoryCache: true,

    // Virtualization Settings
    itemHeight: 200, // pixels
    overscan: 3, // items
    enableVirtualization: true,
    virtualizationThreshold: 100,

    // IndexedDB Settings
    batchSize: 100, // items per batch
    pageSize: 50, // items per page
    enablePagination: true,

    // Performance Settings
    enableDebugMode: false,
    performanceMonitoring: true,
    lazyLoadImages: true,
    optimizeRendering: true
  });

  const [performanceInfo, setPerformanceInfo] = useState({
    memoryUsage: '0 MB',
    cacheHitRate: '0%',
    renderTime: '0ms'
  });

  useEffect(() => {
    // Carregar configurações salvas
    const savedSettings = localStorage.getItem('performanceSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Atualizar informações de performance
    updatePerformanceInfo();
  }, []);

  const updatePerformanceInfo = () => {
    // Simular informações de performance
    if (performance.memory) {
      setPerformanceInfo({
        memoryUsage: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
        cacheHitRate: '85%', // Simulado
        renderTime: `${Math.round(Math.random() * 100)}ms`
      });
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('performanceSettings', JSON.stringify(settings));
    onSave?.(settings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      cacheSize: 50,
      cacheTTL: 5,
      enableMemoryCache: true,
      itemHeight: 200,
      overscan: 3,
      enableVirtualization: true,
      virtualizationThreshold: 100,
      batchSize: 100,
      pageSize: 50,
      enablePagination: true,
      enableDebugMode: false,
      performanceMonitoring: true,
      lazyLoadImages: true,
      optimizeRendering: true
    };
    setSettings(defaultSettings);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Settings />
        Configurações de Performance
      </DialogTitle>

      <DialogContent>
        {/* Performance Info */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Status de Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Memory color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Memória
                  </Typography>
                  <Typography variant="h6">
                    {performanceInfo.memoryUsage}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Speed color="success" />
                  <Typography variant="body2" color="text.secondary">
                    Cache Hit Rate
                  </Typography>
                  <Typography variant="h6">
                    {performanceInfo.cacheHitRate}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Visibility color="info" />
                  <Typography variant="body2" color="text.secondary">
                    Render Time
                  </Typography>
                  <Typography variant="h6">
                    {performanceInfo.renderTime}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Cache Settings */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configurações de Cache
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableMemoryCache}
                  onChange={(e) => handleSettingChange('enableMemoryCache', e.target.checked)}
                />
              }
              label="Habilitar Cache em Memória"
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Tamanho do Cache: {settings.cacheSize} MB</FormLabel>
              <Slider
                value={settings.cacheSize}
                onChange={(e, value) => handleSettingChange('cacheSize', value)}
                min={10}
                max={200}
                step={10}
                marks={[
                  { value: 10, label: '10MB' },
                  { value: 50, label: '50MB' },
                  { value: 100, label: '100MB' },
                  { value: 200, label: '200MB' }
                ]}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>TTL do Cache: {settings.cacheTTL} minutos</FormLabel>
              <Slider
                value={settings.cacheTTL}
                onChange={(e, value) => handleSettingChange('cacheTTL', value)}
                min={1}
                max={30}
                step={1}
                marks={[
                  { value: 1, label: '1min' },
                  { value: 5, label: '5min' },
                  { value: 15, label: '15min' },
                  { value: 30, label: '30min' }
                ]}
              />
            </FormControl>
          </CardContent>
        </Card>

        {/* Virtualization Settings */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configurações de Virtualização
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableVirtualization}
                  onChange={(e) => handleSettingChange('enableVirtualization', e.target.checked)}
                />
              }
              label="Habilitar Virtualização"
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Limite para Virtualização: {settings.virtualizationThreshold} itens</FormLabel>
              <Slider
                value={settings.virtualizationThreshold}
                onChange={(e, value) => handleSettingChange('virtualizationThreshold', value)}
                min={50}
                max={500}
                step={50}
                marks={[
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                  { value: 250, label: '250' },
                  { value: 500, label: '500' }
                ]}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Altura do Item: {settings.itemHeight}px</FormLabel>
              <Slider
                value={settings.itemHeight}
                onChange={(e, value) => handleSettingChange('itemHeight', value)}
                min={100}
                max={400}
                step={50}
                marks={[
                  { value: 100, label: '100px' },
                  { value: 200, label: '200px' },
                  { value: 300, label: '300px' },
                  { value: 400, label: '400px' }
                ]}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Overscan: {settings.overscan} itens</FormLabel>
              <Slider
                value={settings.overscan}
                onChange={(e, value) => handleSettingChange('overscan', value)}
                min={1}
                max={10}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 3, label: '3' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' }
                ]}
              />
            </FormControl>
          </CardContent>
        </Card>

        {/* IndexedDB Settings */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configurações de IndexedDB
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enablePagination}
                  onChange={(e) => handleSettingChange('enablePagination', e.target.checked)}
                />
              }
              label="Habilitar Paginação"
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Tamanho do Lote: {settings.batchSize} itens</FormLabel>
              <Slider
                value={settings.batchSize}
                onChange={(e, value) => handleSettingChange('batchSize', value)}
                min={50}
                max={500}
                step={50}
                marks={[
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                  { value: 250, label: '250' },
                  { value: 500, label: '500' }
                ]}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Tamanho da Página: {settings.pageSize} itens</FormLabel>
              <Slider
                value={settings.pageSize}
                onChange={(e, value) => handleSettingChange('pageSize', value)}
                min={25}
                max={200}
                step={25}
                marks={[
                  { value: 25, label: '25' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                  { value: 200, label: '200' }
                ]}
              />
            </FormControl>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configurações Avançadas
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={settings.performanceMonitoring}
                  onChange={(e) => handleSettingChange('performanceMonitoring', e.target.checked)}
                />
              }
              label="Monitoramento de Performance"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.lazyLoadImages}
                  onChange={(e) => handleSettingChange('lazyLoadImages', e.target.checked)}
                />
              }
              label="Carregamento Lazy de Imagens"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.optimizeRendering}
                  onChange={(e) => handleSettingChange('optimizeRendering', e.target.checked)}
                />
              }
              label="Otimização de Renderização"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableDebugMode}
                  onChange={(e) => handleSettingChange('enableDebugMode', e.target.checked)}
                />
              }
              label="Modo Debug"
            />

            {settings.enableDebugMode && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Modo Debug habilitado. Logs detalhados serão exibidos no console.
              </Alert>
            )}
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset} color="warning">
          Restaurar Padrões
        </Button>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PerformanceSettings;