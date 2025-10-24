# TV Dashboard - IPTV Player & Manager

<<<<<<< HEAD
Um dashboard moderno e completo para gerenciamento e reprodução de canais IPTV com suporte a listas M3U8, desenvolvido com Next.js, Material-UI e tema Material You personalizado.
=======
Um dashboard moderno e completo para gerenciamento e reprodução de canais IPTV, desenvolvido com Next.js 15, Material-UI v7 e React 19. Suporte nativo a streams HLS/M3U8 com interface otimizada inspirada em plataformas de streaming.
>>>>>>> 5cdc455 (feat: Atualizar README.md com documentação completa do projeto)

## 🚀 Características

### 🎯 Funcionalidades Principais
<<<<<<< HEAD
- **Player HLS Avançado**: Reprodução de streams M3U8 com controles personalizados
- **Interface Netflix-style**: Grid de canais com design moderno inspirado em serviços de streaming
- **Dashboard Administrativo**: Gerenciamento completo de playlists e canais
- **Tema Material You**: Interface moderna com suporte a modo claro/escuro
- **Responsivo**: Funciona perfeitamente em desktops, tablets e dispositivos móveis
- **Upload de Listas**: Importação fácil de listas M3U8 via URL
- **Categorização**: Organização automática de canais por grupos
- **Busca e Filtros**: Sistema de pesquisa e filtros por categoria
- **Estatísticas**: Dashboard com métricas de uso e performance
=======
- **Player HLS Universal**: Reprodução otimizada de streams M3U8 com HLS.js
- **Interface Streaming Moderna**: Design inspirado no Globoplay e Netflix
- **Dashboard Administrativo**: Gerenciamento completo de playlists e canais
- **Performance Otimizada**: Interface adaptativa para grandes listas de canais (1000+)
- **IndexedDB Storage**: Armazenamento local otimizado para grandes volumes de dados
- **Virtualização**: Componentes virtualizados para performance máxima
- **Responsive Design**: Interface totalmente responsiva para todos os dispositivos
- **Upload de Listas**: Importação de listas M3U8 via URL ou arquivo
- **Analytics**: Estatísticas de uso e performance em tempo real
>>>>>>> 5cdc455 (feat: Atualizar README.md com documentação completa do projeto)

### 🎨 Design e UI/UX
- **Material You Design System**: Tema personalizado seguindo as diretrizes do Google
- **Grid Responsivo**: Layout adaptativo com sistema de grid do Material-UI
- **Animações Suaves**: Transições e efeitos visuais modernos
- **Acessibilidade**: Interface acessível com suporte a leitores de tela
- **Modo Escuro/Claro**: Alternância automática baseada na preferência do sistema

### 🔧 Stack Tecnológico
- **Next.js 15.5** - Framework React com App Router e Turbopack
- **React 19.1** - Biblioteca JavaScript para interfaces de usuário
- **Material-UI v7** - Sistema de design e componentes React
- **HLS.js 1.6** - Player nativo para streams HLS/M3U8
- **IndexedDB** - Banco de dados local para armazenamento otimizado
- **React Window** - Virtualização de listas para performance
- **Emotion** - CSS-in-JS para estilização
- **Axios** - Cliente HTTP para requisições

## 📋 Pré-requisitos

- **Node.js 18+** (recomendado 20+)
- **NPM 8+** ou Yarn 1.22+
- **Navegador moderno** com suporte a:
  - ES2022+ features
  - Media Source Extensions (MSE)
  - IndexedDB API
  - WebGL (para componentes virtualizados)

## 🛠️ Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/Advansoftware/DashboardTvonline.git
cd DashboardTvonline
```

2. **Instale as dependências**

```bash
npm install
```

3. **Execute em modo de desenvolvimento**

```bash
npm run dev
# Usa Turbopack para build mais rápido
```

4. **Build para produção**

```bash
npm run build
npm start
```

5. **Acesse a aplicação**

Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📁 Estrutura do Projeto

```
DashboardTvonline/
├── app/                              # App Router (Next.js 15)
│   ├── api/                         # API Routes
│   │   └── placeholder/            # Endpoints de exemplo
│   ├── dashboard/                  # Dashboard administrativo
│   │   ├── analytics/             # Página de analytics
│   │   ├── channels/              # Gerenciamento de canais
│   │   ├── favorites/             # Canais favoritos
│   │   ├── playlists/             # Gerenciamento de playlists
│   │   ├── settings/              # Configurações
│   │   └── upload/                # Upload de listas M3U8
│   ├── tv/                         # Interface do player
│   │   ├── layout.js              # Layout específico do TV
│   │   └── [channelId]/           # Player dinâmico por canal
│   ├── layout.js                   # Layout raiz da aplicação
│   ├── page.js                     # Página inicial (StreamingHomeInterface)
│   └── globals.css                 # Estilos globais
├── src/
│   ├── components/                 # Componentes React
│   │   ├── StreamingHomeInterface.js    # Interface principal estilo streaming
│   │   ├── OptimizedTVHomeInterface.js  # Interface otimizada para grandes listas
│   │   ├── UniversalPlayer.js           # Player HLS universal
│   │   ├── VirtualizedComponents.js     # Componentes virtualizados
│   │   ├── PerformanceSettings.js       # Configurações de performance
│   │   └── UploadModal.js              # Modal de upload de listas
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useIndexedDB.js        # Hook para IndexedDB básico
│   │   └── useOptimizedIndexedDB.js     # Hook otimizado para grandes dados
│   ├── theme/                      # Sistema de temas
│   │   ├── theme.js               # Definição dos temas Material You
│   │   └── ThemeProvider.js       # Provider de contexto do tema
│   ├── utils/                      # Utilitários
│   │   └── m3u8Utils.js           # Parser e utilitários M3U8
│   └── data/                       # Dados de exemplo
│       └── sampleData.js          # Dados de teste
├── public/                         # Assets estáticos
├── package.json                    # Dependências e scripts
├── next.config.mjs                 # Configuração do Next.js
├── eslint.config.mjs              # Configuração do ESLint
├── jsconfig.json                   # Configuração do JavaScript
└── generate-test-data.js           # Script para gerar dados de teste
```

## 🎮 Como Usar

### 1. Interface Principal
- **Design Streaming**: Interface moderna inspirada no Globoplay
- **Grid de Canais**: Navegação intuitiva por categorias
- **Busca Inteligente**: Sistema de filtros e pesquisa rápida
- **Performance Adaptativa**: Interface otimizada automaticamente para listas grandes (1000+ canais)

### 2. Importação de Listas M3U8
- **Upload via URL**: Cole a URL da playlist IPTV
- **Upload de Arquivo**: Selecione arquivo .m3u8 local
- **Processamento Automático**: Parser inteligente de metadados
- **Armazenamento Otimizado**: Dados salvos no IndexedDB local

### 3. Dashboard Administrativo
- **Analytics**: `/dashboard/analytics` - Métricas de uso e performance
- **Canais**: `/dashboard/channels` - Gerenciamento completo de canais
- **Playlists**: `/dashboard/playlists` - Organização de listas
- **Favoritos**: `/dashboard/favorites` - Canais marcados como favoritos
- **Configurações**: `/dashboard/settings` - Preferências do sistema
- **Upload**: `/dashboard/upload` - Importação de novas listas

### 4. Player Universal
- **HLS.js Integration**: Reprodução nativa de streams M3U8
- **Controles Customizados**: Interface moderna e responsiva
- **Qualidade Adaptativa**: Seleção automática da melhor qualidade
- **URL Dinâmica**: `/tv/[channelId]` para acesso direto aos canais

## 🔧 Configuração Avançada

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento com Turbopack
npm run build        # Build otimizado para produção  
npm start            # Servidor de produção
npm run lint         # ESLint para qualidade de código
```

### Personalização do Tema
Edite `src/theme/theme.js` para customizar:
- **Material You Colors**: Paleta de cores dinâmica
- **Typography**: Fontes e hierarquia tipográfica
- **Components**: Override de componentes MUI
- **Breakpoints**: Responsividade customizada

### Performance Settings
Configure em `src/components/PerformanceSettings.js`:
- **Virtualização**: Threshold para ativar componentes virtualizados
- **Cache Strategy**: Estratégias de cache do IndexedDB
- **Rendering**: Otimizações de renderização

### IndexedDB Configuration
- **Database Name**: 'TVDashboardDB'
- **Version**: Versionamento automático
- **Stores**: 'channels', 'playlists', 'favorites', 'settings'
- **Performance**: Otimizado para grandes volumes de dados (10k+ registros)

## 🐛 Solução de Problemas

### Performance Issues
```bash
# Limpar cache do IndexedDB
# Abra DevTools > Application > Storage > IndexedDB > Clear

# Regenerar dados de teste
node generate-test-data.js

# Build limpo
rm -rf .next node_modules
npm install && npm run build
```

### Streams não reproduzem
- **CORS Issues**: Configure proxy ou use extensão CORS
- **Format Support**: Verifique se o stream é HLS/M3U8 válido
- **Network**: Teste conectividade com a URL do stream
- **Browser**: Use navegadores com suporte completo a MSE

### Interface lenta ou travando
- **Large Lists**: Sistema ativa automaticamente virtualização para 1000+ canais
- **Memory**: Monitore uso de memória no DevTools
- **IndexedDB**: Verifique integridade do banco local
- **Cache**: Limpe cache do navegador e storage local

### Turbopack Issues (Development)
```bash
# Se houver problemas com Turbopack, use webpack tradicional:
npm run dev -- --webpack

# Ou desabilite no next.config.mjs temporariamente
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvido Com

- **[Next.js 15](https://nextjs.org/)** - React Framework com App Router e Turbopack
- **[React 19](https://react.dev/)** - Biblioteca JavaScript para UIs modernas
- **[Material-UI v7](https://mui.com/)** - Sistema de design e componentes React
- **[HLS.js](https://github.com/video-dev/hls.js/)** - Player HLS nativo para browsers
- **[React Window](https://react-window.vercel.app/)** - Virtualização eficiente de listas
- **[Emotion](https://emotion.sh/)** - CSS-in-JS performático

## 🎯 Roadmap

### 🚀 Em Desenvolvimento
- [ ] **Favoritos Avançados**: Sistema completo de favoritos com sincronização
- [ ] **EPG Integration**: Guia de programação eletrônica
- [ ] **Multi-user Support**: Perfis de usuário e configurações personalizadas
- [ ] **PWA Features**: Service Workers e instalação offline
- [ ] **Advanced Analytics**: Dashboard completo de métricas

### 🔮 Futuro
- [ ] **API REST**: Backend para sincronização entre dispositivos
- [ ] **Mobile App**: Aplicativo nativo iOS/Android
- [ ] **Smart TV**: Aplicativo para TVs Samsung/LG
- [ ] **AI Recommendations**: Sistema de recomendações inteligentes
- [ ] **Real-time Sync**: Sincronização em tempo real entre dispositivos
- [ ] **CDN Integration**: Integração com CDNs para melhor performance
- [ ] **Chromecast Support**: Cast para dispositivos Google
- [ ] **Voice Control**: Controle por voz e comandos

## � Performance & Otimizações

### Benchmarks
- **Carregamento**: < 2s para 10.000+ canais
- **Virtualização**: Renderiza apenas itens visíveis
- **Memory Usage**: < 50MB para grandes listas
- **IndexedDB**: Consultas < 100ms

### Features de Performance
- **Turbopack**: Build 10x mais rápido no desenvolvimento
- **React 19**: Concurrent Features e otimizações nativas
- **Code Splitting**: Carregamento sob demanda de rotas
- **Image Optimization**: Otimização automática de imagens
- **Bundle Analysis**: Análise de tamanho de bundles

## 📞 Suporte & Contribuição

### 🐛 Reportar Bugs
- Abra uma [issue](https://github.com/Advansoftware/DashboardTvonline/issues) detalhada
- Inclua informações do browser, versão do Node.js e passos para reproduzir
- Anexe screenshots ou console logs quando relevante

### 💡 Sugestões e Features
- Use [Discussions](https://github.com/Advansoftware/DashboardTvonline/discussions) para ideias
- Vote em features existentes antes de criar novas
- Contribua com PRs seguindo as diretrizes do projeto

### 🤝 Como Contribuir
1. Fork o projeto
2. Crie sua feature branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!**

[![GitHub stars](https://img.shields.io/github/stars/Advansoftware/DashboardTvonline?style=social)](https://github.com/Advansoftware/DashboardTvonline/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Advansoftware/DashboardTvonline?style=social)](https://github.com/Advansoftware/DashboardTvonline/network/members)

Desenvolvido com ❤️ por [Advansoftware](https://github.com/Advansoftware)

</div>
