'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Tv,
  VolumeUp,
  Monitor,
  Storage,
  Security,
  Language,
  Palette,
  Speed,
  ExpandMore,
  Restore,
  Save,
  Download,
  Upload
} from '@mui/icons-material';
import MainLayout from '../../../src/components/MainLayout';
import { useTheme as useCustomTheme } from '../../../src/theme/ThemeProvider';
import { useOptimizedIndexedDB } from '../../../src/hooks/useOptimizedIndexedDB';

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useCustomTheme();
  const { isReady, getSetting, setSetting } = useOptimizedIndexedDB();

  const [settings, setSettings] = useState({
    // Aparência
    theme: 'auto', // auto, light, dark
    compactMode: false,
    animations: true,

    // Player
    autoPlay: true,
    defaultVolume: 70,
    showControls: true,
    fullscreenOnPlay: false,

    // Qualidade
    preferredQuality: 'auto',
    bufferSize: 30,
    retryAttempts: 3,

    // Privacidade
    saveHistory: true,
    analytics: true,
    crashReports: true,

    // Sistema
    cacheSize: 100,
    autoUpdate: true,
    language: 'pt-BR'
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar configurações
  useEffect(() => {
    const loadSettings = async () => {
      if (!isReady) return;

      try {
        // Carregar cada configuração individualmente
        const settingsKeys = Object.keys(settings);
        const loadedSettings = {};

        for (const key of settingsKeys) {
          const value = await getSetting(key);
          if (value !== undefined) {
            loadedSettings[key] = value;
          }
        }

        if (Object.keys(loadedSettings).length > 0) {
          setSettings(prev => ({ ...prev, ...loadedSettings }));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadSettings();
  }, [isReady]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      // Salvar cada configuração individualmente
      for (const [key, value] of Object.entries(settings)) {
        await setSetting(key, value);
      }

      setHasChanges(false);
      setSnackbar({ open: true, message: 'Configurações salvas!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar configurações', severity: 'error' });
    }
  };

  const handleResetSettings = async () => {
    if (!confirm('Deseja realmente restaurar as configurações padrão?')) return;

    const defaultSettings = {
      theme: 'auto',
      compactMode: false,
      animations: true,
      autoPlay: true,
      defaultVolume: 70,
      showControls: true,
      fullscreenOnPlay: false,
      preferredQuality: 'auto',
      bufferSize: 30,
      retryAttempts: 3,
      saveHistory: true,
      analytics: true,
      crashReports: true,
      cacheSize: 100,
      autoUpdate: true,
      language: 'pt-BR'
    };

    setSettings(defaultSettings);
    setHasChanges(true);
    setSnackbar({ open: true, message: 'Configurações restauradas!', severity: 'info' });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'tv-dashboard-settings.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        setSettings({ ...settings, ...importedSettings });
        setHasChanges(true);
        setSnackbar({ open: true, message: 'Configurações importadas!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Erro ao importar configurações', severity: 'error' });
      }
    };
    reader.readAsText(file);

    // Limpar input
    event.target.value = '';
  };

  return (
    <MainLayout currentPage="settings">
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Configurações
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Personalize sua experiência
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportSettings}
            >
              Exportar
            </Button>
            <Button
              variant="outlined"
              startIcon={<Upload />}
              component="label"
            >
              Importar
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                style={{ display: 'none' }}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={handleResetSettings}
              color="error"
            >
              Restaurar
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveSettings}
              disabled={!hasChanges}
            >
              Salvar
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Aparência */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Palette sx={{ mr: 1 }} />
                  Aparência
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Tema"
                      secondary="Escolha entre claro, escuro ou automático"
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={settings.theme}
                          onChange={(e) => handleSettingChange('theme', e.target.value)}
                        >
                          <MenuItem value="auto">Automático</MenuItem>
                          <MenuItem value="light">Claro</MenuItem>
                          <MenuItem value="dark">Escuro</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Modo Compacto"
                      secondary="Interface mais densa com menos espaçamento"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.compactMode}
                        onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Animações"
                      secondary="Ativar transições e animações da interface"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.animations}
                        onChange={(e) => handleSettingChange('animations', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Player */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tv sx={{ mr: 1 }} />
                  Player
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Reprodução Automática"
                      secondary="Iniciar reprodução automaticamente"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.autoPlay}
                        onChange={(e) => handleSettingChange('autoPlay', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Tela Cheia ao Reproduzir"
                      secondary="Entrar em tela cheia automaticamente"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.fullscreenOnPlay}
                        onChange={(e) => handleSettingChange('fullscreenOnPlay', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Mostrar Controles"
                      secondary="Exibir controles do player"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.showControls}
                        onChange={(e) => handleSettingChange('showControls', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography gutterBottom>Volume Padrão</Typography>
                  <Slider
                    value={settings.defaultVolume}
                    onChange={(e, value) => handleSettingChange('defaultVolume', value)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 50, label: '50%' },
                      { value: 100, label: '100%' }
                    ]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Qualidade e Performance */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Speed sx={{ mr: 1 }} />
                  Qualidade e Performance
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Qualidade Preferida"
                      secondary="Qualidade de vídeo padrão"
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={settings.preferredQuality}
                          onChange={(e) => handleSettingChange('preferredQuality', e.target.value)}
                        >
                          <MenuItem value="auto">Automática</MenuItem>
                          <MenuItem value="1080p">1080p</MenuItem>
                          <MenuItem value="720p">720p</MenuItem>
                          <MenuItem value="480p">480p</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Tentativas de Reconexão"
                      secondary="Número de tentativas em caso de erro"
                    />
                    <ListItemSecondaryAction>
                      <TextField
                        type="number"
                        size="small"
                        value={settings.retryAttempts}
                        onChange={(e) => handleSettingChange('retryAttempts', parseInt(e.target.value))}
                        inputProps={{ min: 1, max: 10 }}
                        sx={{ width: 80 }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography gutterBottom>Tamanho do Buffer (segundos)</Typography>
                  <Slider
                    value={settings.bufferSize}
                    onChange={(e, value) => handleSettingChange('bufferSize', value)}
                    valueLabelDisplay="auto"
                    min={10}
                    max={60}
                    marks={[
                      { value: 10, label: '10s' },
                      { value: 30, label: '30s' },
                      { value: 60, label: '60s' }
                    ]}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Privacidade */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Security sx={{ mr: 1 }} />
                  Privacidade
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="Salvar Histórico"
                      secondary="Manter histórico de canais assistidos"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.saveHistory}
                        onChange={(e) => handleSettingChange('saveHistory', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Estatísticas de Uso"
                      secondary="Permitir coleta de dados de uso"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.analytics}
                        onChange={(e) => handleSettingChange('analytics', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Relatórios de Erro"
                      secondary="Enviar relatórios de erro automaticamente"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.crashReports}
                        onChange={(e) => handleSettingChange('crashReports', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Sistema */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Storage sx={{ mr: 1 }} />
                  Sistema
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Idioma</InputLabel>
                      <Select
                        value={settings.language}
                        label="Idioma"
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                      >
                        <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                        <MenuItem value="en-US">English (US)</MenuItem>
                        <MenuItem value="es-ES">Español</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoUpdate}
                          onChange={(e) => handleSettingChange('autoUpdate', e.target.checked)}
                        />
                      }
                      label="Atualizações Automáticas"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Tamanho do Cache: {settings.cacheSize} MB
                      </Typography>
                      <Slider
                        value={settings.cacheSize}
                        onChange={(e, value) => handleSettingChange('cacheSize', value)}
                        min={50}
                        max={500}
                        step={10}
                        marks={[
                          { value: 50, label: '50MB' },
                          { value: 250, label: '250MB' },
                          { value: 500, label: '500MB' }
                        ]}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}MB`}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Save Alert */}
        {hasChanges && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Você tem alterações não salvas. Clique em &quot;Salvar&quot; para manter as configurações.
          </Alert>
        )}

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