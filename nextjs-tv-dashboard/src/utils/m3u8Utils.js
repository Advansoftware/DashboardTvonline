// Tipos para os canais IPTV baseados na versão Svelte
export const channelTypes = {
  Channel: 'Channel'
};

// Identificar tipo de conteúdo (VOD ou canal de TV) - Versão melhorada
const identifyContentType = (name, group, url) => {
  const name_lower = name.toLowerCase();
  const group_lower = group?.toLowerCase() || '';
  const url_lower = url?.toLowerCase() || '';

  // 1. PRIORIDADE MÁXIMA: Extensões de arquivo (indicam VOD)
  const vodExtensions = [
    '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v',
    '.3gp', '.ts', '.mpg', '.mpeg', '.f4v', '.asf', '.divx', '.xvid'
  ];

  // Verificar se a URL contém extensão de arquivo VOD
  const hasVodExtension = vodExtensions.some(ext =>
    url_lower.includes(ext) || url_lower.endsWith(ext)
  );

  // 2. Indicadores de streaming ao vivo (têm prioridade sobre keywords)
  const liveIndicators = [
    '.m3u8', '/live/', '/stream/', '/playlist.m3u8',
    'live=1', 'type=live', '/tv/', '/channel/'
  ];

  const hasLiveIndicator = liveIndicators.some(indicator =>
    url_lower.includes(indicator)
  );

  // 3. Palavras-chave para identificar VOD (filmes e séries)
  const vodKeywords = [
    'filme', 'movie', 'cinema', 'serie', 'series', 'show', 'drama', 'reality',
    'documentario', 'documentary', 'cartoon', 'desenho', 'anime', 'novela',
    'miniserie', 'temporada', 'season', 'episode', 'episodio', 'ep.', 'ep ',
    'dublado', 'legendado', 'hd', '720p', '1080p', '4k', 'bluray', 'dvdrip'
  ];

  // 4. Grupos típicos de VOD
  const vodGroups = [
    'filmes', 'movies', 'cinema', 'series', 'desenhos', 'cartoons', 'anime',
    'documentarios', 'documentaries', 'novelas', 'reality', 'shows', 'vod',
    'on demand', 'replay', 'catchup'
  ];

  // 5. Grupos típicos de TV ao vivo
  const liveGroups = [
    'tv', 'channels', 'canais', 'televisao', 'television', 'live', 'ao vivo',
    'news', 'noticias', 'sport', 'esporte', 'kids', 'infantil', 'music', 'musica'
  ];

  // LÓGICA DE DECISÃO (em ordem de prioridade):

  // Se tem extensão de arquivo VOD, é definitivamente VOD
  if (hasVodExtension) {
    return 'vod';
  }

  // Se tem indicador de live streaming, é provavelmente live
  if (hasLiveIndicator) {
    return 'live';
  }

  // Verificar grupos (mais confiável que nomes)
  const isVodByGroup = vodGroups.some(keyword => group_lower.includes(keyword));
  const isLiveByGroup = liveGroups.some(keyword => group_lower.includes(keyword));

  if (isVodByGroup && !isLiveByGroup) {
    return 'vod';
  }

  if (isLiveByGroup && !isVodByGroup) {
    return 'live';
  }

  // Verificar por nome (menos confiável)
  const isVodByName = vodKeywords.some(keyword => name_lower.includes(keyword));

  if (isVodByName) {
    return 'vod';
  }

  // Por padrão, assumir que é canal de TV ao vivo
  return 'live';
};

// Utilitário para parser de listas M3U8 (baseado no helper Svelte)
export const parseM3U8List = (content) => {
  if (!content.includes("#EXTM3U")) {
    throw new Error("Este não é um arquivo de lista IPTV válido");
  }

  let lista = content + " SENYDE";
  lista = lista.split("#EXTINF").join("SENYDEEXTINF");
  lista = lista.split('",').join('"SCNLGME ');

  const channels = [];
  const listaEmArray = lista.match(/EXTINF([\S\s]*?)SENYDE/g);

  if (listaEmArray) {
    listaEmArray.forEach((ch) => {
      let img = null;
      const logoMatch = ch.match(/tvg-logo="([\S\s]*?)"/i);
      if (logoMatch) {
        img = logoMatch[1];
      }

      const nomeMatch = ch.match(/"SCNLGME([\S\s]*?)http/i);
      if (!nomeMatch) return;

      let nome = nomeMatch[1];
      nome = nome.replace(/\r/g, "").replace(/\n/g, "");

      let grupo = null;
      const grupoMatch = ch.match(/group-title="([\S\s]*?)"/i);
      if (grupoMatch) {
        grupo = grupoMatch[1];
      }

      let link = null;
      const linkMatches = ch.match(/https?:\/\/[^\s]+/gi);
      if (linkMatches && linkMatches.length > 0) {
        link = linkMatches.length === 1 ? linkMatches[0] : linkMatches[1];
      }

      if (nome && link) {
        // Identificar tipo de conteúdo usando URL para análise mais precisa
        const type = identifyContentType(nome, grupo, link);
        
        // Detectar formato do arquivo para auxiliar o player
        const format = detectStreamFormat(link);

        channels.push({
          name: nome.trim(),
          image: img,
          group: grupo,
          link: link,
          url: link, // Alias para compatibilidade
          type: type, // 'live' para canais de TV, 'vod' para filmes/séries
          format: format, // 'hls', 'vod', 'dash', 'unknown'
          id: `${nome.trim()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          addedAt: new Date().toISOString()
        });
      }
    });
  }

  return channels;
};

// Utilitário para buscar e parsear lista M3U8 de URL
export const fetchM3U8FromUrl = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; TV-Dashboard/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.text();
    return parseM3U8List(content);
  } catch (error) {
    console.error('Erro ao buscar lista M3U8:', error);
    throw error;
  }
};

// Utilitário para organizar canais por grupo
export const organizeChannelsByGroup = (channels) => {
  const groupedChannels = {};

  channels.forEach(channel => {
    const group = channel.group || 'Sem Categoria';
    if (!groupedChannels[group]) {
      groupedChannels[group] = [];
    }
    groupedChannels[group].push(channel);
  });

  return groupedChannels;
};

// Utilitário para organizar por tipo de conteúdo
export const organizeChannelsByType = (channels) => {
  const organized = {
    live: channels.filter(ch => ch.type === 'live'),
    vod: channels.filter(ch => ch.type === 'vod')
  };

  return organized;
};

// Utilitário para obter estatísticas de conteúdo
export const getContentStats = (channels) => {
  const live = channels.filter(ch => ch.type === 'live').length;
  const vod = channels.filter(ch => ch.type === 'vod').length;

  return {
    live,
    vod,
    total: channels.length
  };
};

// Utilitário para filtrar canais
export const filterChannels = (channels, searchTerm) => {
  if (!searchTerm) return channels;

  const term = searchTerm.toLowerCase();
  return channels.filter(channel =>
    channel.name.toLowerCase().includes(term) ||
    (channel.group && channel.group.toLowerCase().includes(term))
  );
};

// Utilitário para validar URL de stream
export const isValidStreamUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Utilitário para formatação de tempo
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Reclassificar canais existentes com base na nova lógica
export const reclassifyChannels = (channels) => {
  return channels.map(channel => ({
    ...channel,
    type: identifyContentType(channel.name, channel.group, channel.url || channel.link),
    updatedAt: new Date().toISOString()
  }));
};

// Atualização inteligente de playlist
export const updatePlaylistIntelligently = async (playlistUrl, existingChannels = []) => {
  try {
    // Buscar nova versão da playlist
    const newChannels = await fetchM3U8FromUrl(playlistUrl);

    // Criar mapa de canais existentes por nome e URL
    const existingChannelsMap = new Map();
    existingChannels.forEach(channel => {
      const key = `${channel.name}-${channel.url || channel.link}`;
      existingChannelsMap.set(key, channel);
    });

    // Processar novos canais
    const updatedChannels = [];
    const addedChannels = [];
    const removedChannels = [...existingChannels]; // Começar com todos como removidos

    newChannels.forEach(newChannel => {
      const key = `${newChannel.name}-${newChannel.url || newChannel.link}`;
      const existingChannel = existingChannelsMap.get(key);

      if (existingChannel) {
        // Canal já existe - manter ID e favoritos, mas atualizar dados
        const updatedChannel = {
          ...newChannel,
          id: existingChannel.id, // Manter ID original
          addedAt: existingChannel.addedAt, // Manter data original
          updatedAt: new Date().toISOString(),
          // Reaplicar categorização inteligente
          type: identifyContentType(newChannel.name, newChannel.group, newChannel.url || newChannel.link)
        };

        updatedChannels.push(updatedChannel);

        // Remover da lista de removidos
        const indexToRemove = removedChannels.findIndex(ch => ch.id === existingChannel.id);
        if (indexToRemove > -1) {
          removedChannels.splice(indexToRemove, 1);
        }
      } else {
        // Canal novo
        addedChannels.push({
          ...newChannel,
          updatedAt: new Date().toISOString()
        });
      }
    });

    // Combinar canais atualizados e novos
    const finalChannels = [...updatedChannels, ...addedChannels];

    // Estatísticas da atualização
    const updateStats = {
      total: finalChannels.length,
      added: addedChannels.length,
      updated: updatedChannels.length,
      removed: removedChannels.length,
      addedChannels,
      removedChannels,
      reclassified: {
        live: finalChannels.filter(ch => ch.type === 'live').length,
        vod: finalChannels.filter(ch => ch.type === 'vod').length
      }
    };

    return {
      channels: finalChannels,
      stats: updateStats
    };

  } catch (error) {
    console.error('Erro na atualização inteligente:', error);
    throw error;
  }
};

// Validar qualidade de categorização
export const validateCategorization = (channels) => {
  const validation = {
    total: channels.length,
    withExtensions: 0,
    withLiveIndicators: 0,
    withGroups: 0,
    uncategorized: 0,
    confidence: {
      high: 0,  // Baseado em extensão ou indicadores específicos
      medium: 0, // Baseado em grupos
      low: 0     // Baseado apenas em keywords de nome
    }
  };

  channels.forEach(channel => {
    const url = (channel.url || channel.link || '').toLowerCase();
    const name = channel.name.toLowerCase();
    const group = (channel.group || '').toLowerCase();

    // Verificar confiança da categorização
    const vodExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];
    const liveIndicators = ['.m3u8', '/live/', '/stream/', '/playlist.m3u8'];

    const hasVodExtension = vodExtensions.some(ext => url.includes(ext));
    const hasLiveIndicator = liveIndicators.some(indicator => url.includes(indicator));

    if (hasVodExtension || hasLiveIndicator) {
      validation.confidence.high++;
      if (hasVodExtension) validation.withExtensions++;
      if (hasLiveIndicator) validation.withLiveIndicators++;
    } else if (group) {
      validation.confidence.medium++;
      validation.withGroups++;
    } else {
      validation.confidence.low++;
    }

    if (!group && !hasVodExtension && !hasLiveIndicator) {
      validation.uncategorized++;
    }
  });

  return validation;
};

// Detectar formato de streaming baseado na URL
export const detectStreamFormat = (url) => {
  if (!url) return 'unknown';
  
  const urlLower = url.toLowerCase();
  
  // Extensões de arquivo VOD (arquivos diretos)
  const vodExtensions = [
    '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v',
    '.3gp', '.ts', '.mpg', '.mpeg', '.f4v', '.asf', '.divx', '.xvid'
  ];
  
  // Indicadores de streaming HLS
  const hlsIndicators = [
    '.m3u8', '/playlist.m3u8', '/live/', '/stream/'
  ];
  
  // Indicadores de streaming DASH
  const dashIndicators = [
    '.mpd', '/manifest.mpd'
  ];
  
  // Verificar HLS primeiro (mais comum em IPTV)
  if (hlsIndicators.some(indicator => urlLower.includes(indicator))) {
    return 'hls';
  }
  
  // Verificar DASH
  if (dashIndicators.some(indicator => urlLower.includes(indicator))) {
    return 'dash';
  }
  
  // Verificar VOD por extensão
  if (vodExtensions.some(ext => urlLower.includes(ext))) {
    return 'vod';
  }
  
  // Se não detectar, assumir HLS por padrão (comum em IPTV)
  return 'hls';
};