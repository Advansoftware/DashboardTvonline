// Dados de exemplo para demonstração da aplicação
export const sampleChannels = [
  {
    id: 'demo-globo',
    name: 'TV Globo HD',
    image: 'https://upload.wikimedia.org/wikipedia/pt/thumb/b/b4/Logotipo_da_TV_Globo.svg/240px-Logotipo_da_TV_Globo.svg.png',
    group: 'Canais Abertos',
    link: 'https://tv-globo-sp.live.br/hls/tv-globo-sp.m3u8'
  },
  {
    id: 'demo-sbt',
    name: 'SBT HD',
    image: 'https://upload.wikimedia.org/wikipedia/pt/thumb/4/41/Logotipo_do_SBT.svg/240px-Logotipo_do_SBT.svg.png',
    group: 'Canais Abertos',
    link: 'https://sbt.live.br/hls/sbt.m3u8'
  },
  {
    id: 'demo-record',
    name: 'Record TV HD',
    image: 'https://upload.wikimedia.org/wikipedia/pt/thumb/e/e3/Rede_Record_2019.svg/240px-Rede_Record_2019.svg.png',
    group: 'Canais Abertos',
    link: 'https://record.live.br/hls/record.m3u8'
  },
  {
    id: 'demo-band',
    name: 'Band HD',
    image: 'https://upload.wikimedia.org/wikipedia/pt/thumb/5/53/Band_logo_2022.svg/240px-Band_logo_2022.svg.png',
    group: 'Canais Abertos',
    link: 'https://band.live.br/hls/band.m3u8'
  },
  {
    id: 'demo-sportv',
    name: 'SporTV HD',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Logo_SporTV.svg/240px-Logo_SporTV.svg.png',
    group: 'Esportes',
    link: 'https://sportv.live.br/hls/sportv.m3u8'
  },
  {
    id: 'demo-espn',
    name: 'ESPN Brasil HD',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/240px-ESPN_wordmark.svg.png',
    group: 'Esportes',
    link: 'https://espn.live.br/hls/espn.m3u8'
  },
  {
    id: 'demo-cnn',
    name: 'CNN Brasil HD',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/CNN_International_logo.svg/240px-CNN_International_logo.svg.png',
    group: 'Notícias',
    link: 'https://cnn.live.br/hls/cnn.m3u8'
  },
  {
    id: 'demo-globonews',
    name: 'GloboNews HD',
    image: 'https://upload.wikimedia.org/wikipedia/pt/thumb/d/da/Logotipo_da_GloboNews.svg/240px-Logotipo_da_GloboNews.svg.png',
    group: 'Notícias',
    link: 'https://globonews.live.br/hls/globonews.m3u8'
  },
  {
    id: 'demo-premium',
    name: 'Telecine Premium HD',
    image: 'https://via.placeholder.com/240x135/8B0000/FFFFFF?text=Telecine+Premium',
    group: 'Filmes',
    link: 'https://telecine.live.br/hls/premium.m3u8'
  },
  {
    id: 'demo-action',
    name: 'Telecine Action HD',
    image: 'https://via.placeholder.com/240x135/FF4500/FFFFFF?text=Telecine+Action',
    group: 'Filmes',
    link: 'https://telecine.live.br/hls/action.m3u8'
  },
  {
    id: 'demo-multishow',
    name: 'Multishow HD',
    image: 'https://upload.wikimedia.org/wikipedia/pt/thumb/9/91/Multishow_logo_2018.svg/240px-Multishow_logo_2018.svg.png',
    group: 'Entretenimento',
    link: 'https://multishow.live.br/hls/multishow.m3u8'
  },
  {
    id: 'demo-mtv',
    name: 'MTV Brasil HD',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/MTV-2021.svg/240px-MTV-2021.svg.png',
    group: 'Música',
    link: 'https://mtv.live.br/hls/mtv.m3u8'
  }
];

export const samplePlaylists = [
  {
    id: 'playlist-demo-1',
    name: 'Canais Brasileiros Principais',
    url: 'https://exemplo.com/brasil.m3u8',
    channelCount: 45,
    lastUpdated: new Date().toISOString(),
    status: 'active',
    description: 'Lista principal com canais brasileiros abertos e fechados'
  },
  {
    id: 'playlist-demo-2',
    name: 'Esportes Premium',
    url: 'https://exemplo.com/esportes.m3u8',
    channelCount: 23,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    description: 'Canais dedicados ao esporte nacional e internacional'
  },
  {
    id: 'playlist-demo-3',
    name: 'Filmes e Séries',
    url: 'https://exemplo.com/filmes.m3u8',
    channelCount: 31,
    lastUpdated: new Date(Date.now() - 172800000).toISOString(),
    status: 'active',
    description: 'Canais premium de filmes e séries'
  },
  {
    id: 'playlist-demo-4',
    name: 'Infantil',
    url: 'https://exemplo.com/infantil.m3u8',
    channelCount: 18,
    lastUpdated: new Date(Date.now() - 259200000).toISOString(),
    status: 'inactive',
    description: 'Conteúdo educativo e entretenimento para crianças'
  }
];

// URLs de exemplo para teste (estas são URLs fictícias para demonstração)
export const sampleM3U8Urls = [
  'https://exemplo.com/playlist-nacional.m3u8',
  'https://exemplo.com/canais-esportes.m3u8',
  'https://exemplo.com/filmes-hd.m3u8',
  'https://exemplo.com/tv-aberta.m3u8'
];

// Exemplo de lista M3U8 para parsing
export const sampleM3U8Content = `#EXTM3U
#EXTINF:-1 tvg-logo="https://upload.wikimedia.org/wikipedia/pt/thumb/b/b4/Logotipo_da_TV_Globo.svg/240px-Logotipo_da_TV_Globo.svg.png" group-title="Canais Abertos",TV Globo HD
https://tv-globo-sp.live.br/hls/tv-globo-sp.m3u8
#EXTINF:-1 tvg-logo="https://upload.wikimedia.org/wikipedia/pt/thumb/4/41/Logotipo_do_SBT.svg/240px-Logotipo_do_SBT.svg.png" group-title="Canais Abertos",SBT HD
https://sbt.live.br/hls/sbt.m3u8
#EXTINF:-1 tvg-logo="https://upload.wikimedia.org/wikipedia/pt/thumb/e/e3/Rede_Record_2019.svg/240px-Rede_Record_2019.svg.png" group-title="Canais Abertos",Record TV HD
https://record.live.br/hls/record.m3u8
#EXTINF:-1 tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Logo_SporTV.svg/240px-Logo_SporTV.svg.png" group-title="Esportes",SporTV HD
https://sportv.live.br/hls/sportv.m3u8
#EXTINF:-1 tvg-logo="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/240px-ESPN_wordmark.svg.png" group-title="Esportes",ESPN Brasil HD
https://espn.live.br/hls/espn.m3u8`;

export default {
  sampleChannels,
  samplePlaylists,
  sampleM3U8Urls,
  sampleM3U8Content
};