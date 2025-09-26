#!/usr/bin/env node

/**
 * Script de Teste de Performance - IPTV Dashboard
 * 
 * Este script gera dados de teste para validar as otimizações
 * de performance implementadas no dashboard.
 */

const fs = require('fs');
const path = require('path');

// Configurações do teste
const CONFIGS = {
  SMALL_DATASET: 100,    // Dataset pequeno (interface padrão)
  MEDIUM_DATASET: 1000,  // Dataset médio (threshold de otimização)
  LARGE_DATASET: 5000,   // Dataset grande (teste de performance)
  STRESS_DATASET: 10000  // Dataset de stress test
};

// Categorias de canais
const CATEGORIES = [
  'Entretenimento', 'Esportes', 'Filmes', 'Séries', 'Documentários',
  'Infantil', 'Música', 'Notícias', 'Internacional', 'Religioso',
  'Culinária', 'Natureza', 'História', 'Ciência', 'Tecnologia'
];

// Tipos de conteúdo
const CONTENT_TYPES = ['live', 'vod'];

// Extensões de arquivo para VOD
const VOD_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov', '.wmv'];

// Extensões para streaming
const STREAM_EXTENSIONS = ['.m3u8', '.ts'];

/**
 * Gera um canal aleatório
 */
function generateChannel(id) {
  const isVod = Math.random() > 0.7; // 30% chance de ser VOD
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const extension = isVod
    ? VOD_EXTENSIONS[Math.floor(Math.random() * VOD_EXTENSIONS.length)]
    : STREAM_EXTENSIONS[Math.floor(Math.random() * STREAM_EXTENSIONS.length)];

  return {
    id: `channel_${id}`,
    name: `Canal ${id} - ${category}`,
    url: `https://example.com/stream${id}${extension}`,
    logo: `https://picsum.photos/200/200?random=${id}`,
    category: category,
    type: isVod ? 'vod' : 'live',
    group: category.toLowerCase(),
    country: Math.random() > 0.5 ? 'Brasil' : 'Internacional',
    language: Math.random() > 0.5 ? 'Português' : 'Inglês',
    quality: ['HD', '4K', 'SD'][Math.floor(Math.random() * 3)],
    description: `Descrição do ${isVod ? 'conteúdo' : 'canal'} ${id} da categoria ${category}`,
    added: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastWatched: Math.random() > 0.8 ? new Date().toISOString() : null,
    viewCount: Math.floor(Math.random() * 1000),
    duration: isVod ? Math.floor(Math.random() * 180) + 30 : null, // Duração em minutos para VOD
    rating: Math.floor(Math.random() * 5) + 1,
    tags: generateTags(category),
    metadata: {
      bandwidth: Math.floor(Math.random() * 10000) + 1000,
      codec: isVod ? 'H.264' : 'HLS',
      resolution: ['1920x1080', '1280x720', '854x480'][Math.floor(Math.random() * 3)],
      framerate: [24, 30, 60][Math.floor(Math.random() * 3)]
    }
  };
}

/**
 * Gera tags baseadas na categoria
 */
function generateTags(category) {
  const tagSets = {
    'Entretenimento': ['variedade', 'talk-show', 'reality'],
    'Esportes': ['futebol', 'basquete', 'tênis', 'automobilismo'],
    'Filmes': ['ação', 'comédia', 'drama', 'terror', 'romance'],
    'Séries': ['drama', 'comédia', 'crime', 'sci-fi', 'fantasia'],
    'Documentários': ['natureza', 'história', 'ciência', 'biografia'],
    'Infantil': ['desenho', 'educativo', 'aventura', 'família'],
    'Música': ['pop', 'rock', 'clássica', 'jazz', 'eletrônica'],
    'Notícias': ['nacional', 'internacional', 'economia', 'política'],
    'Internacional': ['europa', 'asia', 'américa', 'áfrica'],
    'Religioso': ['católico', 'evangélico', 'espírita', 'ecumênico']
  };

  const baseTags = tagSets[category] || ['geral'];
  const numTags = Math.floor(Math.random() * 3) + 1;
  const shuffled = baseTags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
}

/**
 * Gera dataset de teste
 */
function generateDataset(size, name) {
  console.log(`Gerando dataset "${name}" com ${size} canais...`);

  const startTime = Date.now();
  const channels = [];

  for (let i = 1; i <= size; i++) {
    channels.push(generateChannel(i));

    // Progress indicator
    if (i % 1000 === 0) {
      console.log(`  Progresso: ${i}/${size} canais gerados`);
    }
  }

  const endTime = Date.now();
  console.log(`  ✓ Dataset gerado em ${endTime - startTime}ms`);

  return {
    metadata: {
      name,
      size,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      categories: CATEGORIES,
      stats: {
        totalChannels: size,
        liveChannels: channels.filter(c => c.type === 'live').length,
        vodChannels: channels.filter(c => c.type === 'vod').length,
        categoriesCount: CATEGORIES.length,
        averageViewCount: Math.floor(channels.reduce((acc, c) => acc + c.viewCount, 0) / size)
      }
    },
    channels
  };
}

/**
 * Salva dataset em arquivo
 */
function saveDataset(dataset, filename) {
  const filePath = path.join(__dirname, 'test-data', filename);

  // Criar diretório se não existir
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log(`Salvando em ${filename}...`);
  const startTime = Date.now();

  fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2));

  const endTime = Date.now();
  const stats = fs.statSync(filePath);
  console.log(`  ✓ Arquivo salvo (${Math.round(stats.size / 1024 / 1024 * 100) / 100}MB) em ${endTime - startTime}ms`);
}

/**
 * Gera arquivo de playlist M3U
 */
function generateM3U(channels, filename) {
  console.log(`Gerando playlist M3U com ${channels.length} canais...`);

  let m3uContent = '#EXTM3U\n';

  channels.forEach(channel => {
    const extinf = `#EXTINF:-1 tvg-id="${channel.id}" tvg-name="${channel.name}" tvg-logo="${channel.logo}" group-title="${channel.category}",${channel.name}`;
    m3uContent += `${extinf}\n${channel.url}\n`;
  });

  const filePath = path.join(__dirname, 'test-data', filename);
  fs.writeFileSync(filePath, m3uContent);

  const stats = fs.statSync(filePath);
  console.log(`  ✓ Playlist M3U salva (${Math.round(stats.size / 1024 / 1024 * 100) / 100}MB)`);
}

/**
 * Gera relatório de performance
 */
function generatePerformanceReport(datasets) {
  const report = {
    generatedAt: new Date().toISOString(),
    testConfigs: CONFIGS,
    datasets: datasets.map(d => ({
      name: d.metadata.name,
      size: d.metadata.size,
      stats: d.metadata.stats,
      estimatedLoadTime: calculateEstimatedLoadTime(d.metadata.size),
      memoryUsage: calculateEstimatedMemory(d.metadata.size),
      recommendedSettings: getRecommendedSettings(d.metadata.size)
    }))
  };

  const filePath = path.join(__dirname, 'test-data', 'performance-report.json');
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  console.log('  ✓ Relatório de performance gerado');

  return report;
}

/**
 * Calcula tempo estimado de carregamento
 */
function calculateEstimatedLoadTime(size) {
  // Baseado em benchmarks empíricos
  if (size <= 100) return '< 100ms';
  if (size <= 1000) return '< 500ms';
  if (size <= 5000) return '< 2s';
  return '< 5s';
}

/**
 * Calcula uso estimado de memória
 */
function calculateEstimatedMemory(size) {
  const baseMemory = 20; // MB base da aplicação
  const perChannelMemory = 0.01; // MB por canal
  const totalMB = baseMemory + (size * perChannelMemory);
  return `~${Math.round(totalMB)}MB`;
}

/**
 * Retorna configurações recomendadas
 */
function getRecommendedSettings(size) {
  if (size <= 100) {
    return {
      useOptimizedInterface: false,
      virtualization: false,
      cacheSize: '10MB',
      batchSize: 50
    };
  } else if (size <= 1000) {
    return {
      useOptimizedInterface: true,
      virtualization: true,
      cacheSize: '25MB',
      batchSize: 100
    };
  } else if (size <= 5000) {
    return {
      useOptimizedInterface: true,
      virtualization: true,
      cacheSize: '50MB',
      batchSize: 200
    };
  } else {
    return {
      useOptimizedInterface: true,
      virtualization: true,
      cacheSize: '100MB',
      batchSize: 500
    };
  }
}

/**
 * Função principal
 */
function main() {
  console.log('🚀 Iniciando geração de dados de teste para IPTV Dashboard\n');

  const datasets = [];

  // Gerar datasets de diferentes tamanhos
  Object.entries(CONFIGS).forEach(([name, size]) => {
    const dataset = generateDataset(size, name);
    datasets.push(dataset);

    // Salvar JSON
    saveDataset(dataset, `${name.toLowerCase()}.json`);

    // Gerar playlist M3U
    generateM3U(dataset.channels, `${name.toLowerCase()}.m3u`);

    console.log('');
  });

  // Gerar relatório de performance
  console.log('Gerando relatório de performance...');
  const report = generatePerformanceReport(datasets);

  console.log('\n📊 Resumo dos Datasets Gerados:');
  console.log('='.repeat(50));

  datasets.forEach(dataset => {
    const stats = dataset.metadata.stats;
    console.log(`\n${dataset.metadata.name}:`);
    console.log(`  📺 Total: ${stats.totalChannels} canais`);
    console.log(`  🔴 Live: ${stats.liveChannels} canais`);
    console.log(`  🎬 VOD: ${stats.vodChannels} canais`);
    console.log(`  📂 Categorias: ${stats.categoriesCount}`);
    console.log(`  👁️  Média de visualizações: ${stats.averageViewCount}`);
  });

  console.log('\n✅ Todos os dados de teste foram gerados com sucesso!');
  console.log('\n📁 Arquivos gerados na pasta "test-data/":');
  console.log('  - *.json (dados estruturados)');
  console.log('  - *.m3u (playlists compatíveis)');
  console.log('  - performance-report.json (relatório de análise)');

  console.log('\n🎯 Próximos passos:');
  console.log('  1. Use os arquivos .m3u para testar upload de playlists');
  console.log('  2. Monitore a performance com datasets grandes');
  console.log('  3. Ajuste configurações baseado no relatório');
  console.log('  4. Teste a interface otimizada com LARGE_DATASET');
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  generateChannel,
  generateDataset,
  generateM3U,
  CONFIGS,
  CATEGORIES
};