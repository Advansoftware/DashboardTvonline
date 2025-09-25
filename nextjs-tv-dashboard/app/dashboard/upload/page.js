'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
  Stack,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  CloudUpload,
  Link as LinkIcon,
  FileUpload,
  Delete,
  Refresh,
  PlaylistPlay,
  CheckCircle,
  Error,
  Warning,
  Info,
  ExpandMore,
  Add,
  Download,
  Tv,
  Language,
  Group,
  AccessTime
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import MainLayout from '../../../src/components/MainLayout';
import { useIndexedDB } from '../../../src/hooks/useIndexedDB';
import { parseM3U8List } from '../../../src/utils/m3u8Utils';

export default function UploadPage() {
  const router = useRouter();
  const { isReady, getChannels, saveChannels, getPlaylists, savePlaylist, deletePlaylist } = useIndexedDB();

  const [currentTab, setCurrentTab] = useState(0); // 0: URL, 1: Upload, 2: Histórico
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistName, setPlaylistName] = useState('');
  const [m3u8Content, setM3u8Content] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [channels, setChannels] = useState([]);
  const [previewChannels, setPreviewChannels] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [autoDetectName, setAutoDetectName] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('auto'); // auto, m3u, hls
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // URLs de exemplo fornecidas pelo usuário
  const exampleUrls = [
    {
      name: 'Link Grande (M3U)',
      url: 'http://gcorecdns.xyz:80/get.php?username=16272011&password=40062316&type=m3u_plus&output=mpegts',
      type: 'M3U',
      description: 'Link completo com parâmetros de autenticação'
    },
    {
      name: 'Link Grande (HLS)',
      url: 'http://gcorecdns.xyz:80/get.php?username=16272011&password=40062316&type=m3u_plus&output=hls',
      type: 'HLS',
      description: 'Link completo HLS com parâmetros de autenticação'
    },
    {
      name: 'Link Curto (M3U)',
      url: 'http://e.gcorecdns.xyz/p/16272011/40062316/m3u',
      type: 'M3U',
      description: 'Link simplificado para M3U'
    },
    {
      name: 'Link Curto (HLS)',
      url: 'http://e.gcorecdns.xyz/p/16272011/40062316/hls',
      type: 'HLS',
      description: 'Link simplificado para HLS'
    }
  ];

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!isReady) return;

      try {
        const [savedChannels, savedPlaylists] = await Promise.all([
          getChannels(),
          getPlaylists()
        ]);

        setChannels(savedChannels);
        setPlaylists(savedPlaylists);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, [isReady]);

  const handleUrlLoad = async () => {
    if (!playlistUrl.trim()) {
      setError('Por favor, insira uma URL válida');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(playlistUrl);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const content = await response.text();
      setM3u8Content(content);

      // Auto-detectar nome da playlist
      if (autoDetectName && !playlistName) {
        const urlName = playlistUrl.split('/').pop() || 'Playlist';
        setPlaylistName(urlName.replace(/\.[^/.]+$/, ""));
      }

      // Fazer preview
      try {
        const parsedChannels = parseM3U8List(content);
        setPreviewChannels(parsedChannels);
        setShowPreview(true);
        setSuccess(`${parsedChannels.length} canais encontrados na playlist`);
      } catch (parseError) {
        setError('Conteúdo carregado, mas erro ao fazer parse: ' + parseError.message);
      }
    } catch (error) {
      setError('Erro ao carregar URL: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(m3u|m3u8|txt)$/i)) {
      setError('Por favor, selecione um arquivo .m3u, .m3u8 ou .txt');
      return;
    }

    setUploadFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setM3u8Content(content);

      // Auto-detectar nome
      if (autoDetectName && !playlistName) {
        setPlaylistName(file.name.replace(/\.[^/.]+$/, ""));
      }

      // Fazer preview
      try {
        const parsedChannels = parseM3U8List(content);
        setPreviewChannels(parsedChannels);
        setShowPreview(true);
        setSuccess(`${parsedChannels.length} canais encontrados no arquivo`);
      } catch (parseError) {
        setError('Erro ao processar arquivo: ' + parseError.message);
      }
    };

    reader.readAsText(file);
  };

  const handleSavePlaylist = async () => {
    if (!m3u8Content.trim()) {
      setError('Nenhum conteúdo para salvar');
      return;
    }

    if (!playlistName.trim()) {
      setError('Por favor, insira um nome para a playlist');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const parsedChannels = parseM3U8List(m3u8Content);
      if (parsedChannels.length === 0) {
        setError('Nenhum canal encontrado no conteúdo');
        return;
      }

      // Verificar se já existe playlist com mesmo nome
      const existingPlaylist = playlists.find(p => p.name === playlistName);
      if (existingPlaylist && !overwriteExisting) {
        setError('Já existe uma playlist com este nome. Marque "Sobrescrever" para substituir.');
        return;
      }

      // Adicionar IDs únicos e metadata
      const playlistId = existingPlaylist?.id || `playlist_${Date.now()}`;
      const channelsWithIds = parsedChannels.map((channel, index) => ({
        ...channel,
        id: `channel_${Date.now()}_${index}`,
        playlistId,
        addedAt: new Date().toISOString()
      }));

      // Informações da playlist
      const playlistInfo = {
        id: playlistId,
        name: playlistName,
        url: playlistUrl || 'upload',
        channelCount: channelsWithIds.length,
        type: selectedFormat === 'auto' ? (playlistUrl.includes('hls') ? 'HLS' : 'M3U') : selectedFormat.toUpperCase(),
        createdAt: existingPlaylist?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        source: playlistUrl ? 'url' : 'file',
        fileSize: uploadFile?.size || m3u8Content.length
      };

      // Salvar canais e playlist
      let updatedChannels;
      if (overwriteExisting && existingPlaylist) {
        // Remover canais da playlist anterior
        updatedChannels = channels.filter(ch => ch.playlistId !== playlistId);
        updatedChannels.push(...channelsWithIds);
      } else {
        updatedChannels = [...channels, ...channelsWithIds];
      }

      await Promise.all([
        saveChannels(channelsWithIds),
        savePlaylist(playlistInfo)
      ]);

      setChannels(updatedChannels);
      setPlaylists(prev => {
        const filtered = prev.filter(p => p.id !== playlistId);
        return [...filtered, playlistInfo];
      });

      // Limpar formulário
      setPlaylistUrl('');
      setPlaylistName('');
      setM3u8Content('');
      setUploadFile(null);
      setPreviewChannels([]);
      setShowPreview(false);
      setError('');

      setSnackbar({
        open: true,
        message: `Playlist "${playlistInfo.name}" salva com ${channelsWithIds.length} canais!`,
        severity: 'success'
      });

      // Resetar input de arquivo
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setError('Erro ao salvar playlist: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!confirm('Deseja realmente excluir esta playlist?')) return;

    try {
      await deletePlaylist(playlistId);

      // Remover canais da playlist
      const updatedChannels = channels.filter(ch => ch.playlistId !== playlistId);
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);

      setChannels(updatedChannels);
      setPlaylists(updatedPlaylists);

      setSnackbar({
        open: true,
        message: 'Playlist excluída com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao excluir playlist',
        severity: 'error'
      });
    }
  };

  const handleExampleUrlClick = (url) => {
    setPlaylistUrl(url);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <MainLayout currentPage="upload">
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Gerenciar Playlists
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Adicione playlists M3U/M3U8 por URL ou upload de arquivo
          </Typography>
        </Box>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab label="Por URL" icon={<LinkIcon />} />
              <Tab label="Upload de Arquivo" icon={<FileUpload />} />
              <Tab label={`Playlists Salvas (${playlists.length})`} icon={<PlaylistPlay />} />
            </Tabs>
          </Box>

          {/* Tab 1: Por URL */}
          <TabPanel value={currentTab} index={0}>
            <CardContent>
              <Stack spacing={3}>
                {/* URLs de Exemplo */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">URLs de Exemplo</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {exampleUrls.map((example, index) => (
                        <Grid item xs={12} md={6} key={index}>
                          <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {example.name}
                              </Typography>
                              <Chip label={example.type} size="small" color="primary" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                              {example.description}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                wordBreak: 'break-all',
                                mb: 2
                              }}
                            >
                              {example.url}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleExampleUrlClick(example.url)}
                              fullWidth
                            >
                              Usar Esta URL
                            </Button>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {/* Formulário de URL */}
                <TextField
                  label="URL da Playlist M3U/M3U8"
                  fullWidth
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="http://exemplo.com/playlist.m3u8"
                  InputProps={{
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      label="Nome da Playlist"
                      fullWidth
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="Minha Playlist IPTV"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Formato</InputLabel>
                      <Select
                        value={selectedFormat}
                        label="Formato"
                        onChange={(e) => setSelectedFormat(e.target.value)}
                      >
                        <MenuItem value="auto">Detectar Automaticamente</MenuItem>
                        <MenuItem value="m3u">M3U/M3U8</MenuItem>
                        <MenuItem value="hls">HLS</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={<Switch checked={autoDetectName} onChange={(e) => setAutoDetectName(e.target.checked)} />}
                    label="Auto-detectar nome"
                  />
                  <FormControlLabel
                    control={<Switch checked={overwriteExisting} onChange={(e) => setOverwriteExisting(e.target.checked)} />}
                    label="Sobrescrever existente"
                  />
                </Box>

                <Button
                  variant="contained"
                  onClick={handleUrlLoad}
                  disabled={isLoading || !playlistUrl.trim()}
                  startIcon={<Download />}
                  size="large"
                >
                  {isLoading ? 'Carregando...' : 'Carregar Playlist'}
                </Button>
              </Stack>
            </CardContent>
          </TabPanel>

          {/* Tab 2: Upload de Arquivo */}
          <TabPanel value={currentTab} index={1}>
            <CardContent>
              <Stack spacing={3}>
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Clique para selecionar arquivo
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Suporte a arquivos .m3u, .m3u8 e .txt
                  </Typography>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".m3u,.m3u8,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </Paper>

                {uploadFile && (
                  <Alert severity="info" icon={<CheckCircle />}>
                    Arquivo selecionado: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      label="Nome da Playlist"
                      fullWidth
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="Nome da playlist"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Formato</InputLabel>
                      <Select
                        value={selectedFormat}
                        label="Formato"
                        onChange={(e) => setSelectedFormat(e.target.value)}
                      >
                        <MenuItem value="auto">Detectar Automaticamente</MenuItem>
                        <MenuItem value="m3u">M3U/M3U8</MenuItem>
                        <MenuItem value="hls">HLS</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControlLabel
                    control={<Switch checked={autoDetectName} onChange={(e) => setAutoDetectName(e.target.checked)} />}
                    label="Auto-detectar nome"
                  />
                  <FormControlLabel
                    control={<Switch checked={overwriteExisting} onChange={(e) => setOverwriteExisting(e.target.checked)} />}
                    label="Sobrescrever existente"
                  />
                </Box>
              </Stack>
            </CardContent>
          </TabPanel>

          {/* Tab 3: Playlists Salvas */}
          <TabPanel value={currentTab} index={2}>
            <CardContent>
              {playlists.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PlaylistPlay sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhuma playlist salva
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Adicione uma playlist usando as abas acima
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {playlists.map((playlist) => (
                    <Grid item xs={12} md={6} key={playlist.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                <PlaylistPlay />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  {playlist.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {playlist.channelCount} canais
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={playlist.type || 'M3U'}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<Tv />}
                              label={`${playlist.channelCount} canais`}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={<AccessTime />}
                              label={new Date(playlist.updatedAt).toLocaleDateString('pt-BR')}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={playlist.source === 'url' ? <LinkIcon /> : <FileUpload />}
                              label={playlist.source === 'url' ? 'URL' : 'Upload'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>

                          {playlist.url && playlist.url !== 'upload' && (
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                bgcolor: 'grey.100',
                                p: 1,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                wordBreak: 'break-all',
                                mb: 2
                              }}
                            >
                              {playlist.url}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Tooltip title="Ver Canais">
                              <IconButton onClick={() => router.push('/dashboard/channels')}>
                                <Tv />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir Playlist">
                              <IconButton
                                onClick={() => handleDeletePlaylist(playlist.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </TabPanel>
        </Card>

        {/* Preview de Canais */}
        {showPreview && previewChannels.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Preview - {previewChannels.length} canais encontrados</Typography>
                <Button
                  variant="contained"
                  onClick={handleSavePlaylist}
                  disabled={isLoading || !playlistName.trim()}
                  startIcon={<Add />}
                >
                  {isLoading ? 'Salvando...' : 'Salvar Playlist'}
                </Button>
              </Box>

              <Grid container spacing={2}>
                {previewChannels.slice(0, 12).map((channel, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                    <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar src={channel.logo} sx={{ mr: 1, width: 32, height: 32 }}>
                          <Tv />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                          {channel.name}
                        </Typography>
                      </Box>
                      {channel.group && (
                        <Chip label={channel.group} size="small" variant="outlined" />
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {previewChannels.length > 12 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  ... e mais {previewChannels.length - 12} canais
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        {isLoading && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="body2" gutterBottom>
                Processando playlist...
              </Typography>
              <LinearProgress />
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {success}
          </Alert>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
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