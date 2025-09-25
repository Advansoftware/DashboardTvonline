// Tipos para os canais IPTV baseados na versão Svelte
export const channelTypes = {
  Channel: 'Channel'
};

// Identificar tipo de conteúdo (VOD ou canal de TV)
const identifyContentType = (name, group) => {
  const name_lower = name.toLowerCase();
  const group_lower = group?.toLowerCase() || '';

  // Palavras-chave para identificar VOD (filmes e séries)
  const vodKeywords = [
    'filme', 'movie', 'cinema', 'serie', 'series', 'show', 'drama', 'reality',
    'documentario', 'documentary', 'cartoon', 'desenho', 'anime', 'novela',
    'miniserie', 'temporada', 'season', 'episode', 'episodio'
  ];

  // Grupos típicos de VOD
  const vodGroups = [
    'filmes', 'movies', 'cinema', 'series', 'desenhos', 'cartoons', 'anime',
    'documentarios', 'documentaries', 'novelas', 'reality', 'shows'
  ];

  // Verificar se é VOD por nome ou grupo
  const isVodByName = vodKeywords.some(keyword => name_lower.includes(keyword));
  const isVodByGroup = vodGroups.some(keyword => group_lower.includes(keyword));

  return (isVodByName || isVodByGroup) ? 'vod' : 'live';
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
        // Identificar tipo de conteúdo
        const type = identifyContentType(nome, grupo);

        channels.push({
          name: nome.trim(),
          image: img,
          group: grupo,
          link: link,
          type: type, // 'live' para canais de TV, 'vod' para filmes/séries
          id: `${nome.trim()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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