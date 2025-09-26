# TV Dashboard - IPTV Player & Manager

Um dashboard moderno e completo para gerenciamento e reprodução de canais IPTV com suporte a listas M3U8, desenvolvido com Next.js, Material-UI e tema Material You personalizado.

## 🚀 Características

### 🎯 Funcionalidades Principais
- **Player HLS Avançado**: Reprodução de streams M3U8 com controles personalizados
- **Interface Netflix-style**: Grid de canais com design moderno inspirado em serviços de streaming
- **Dashboard Administrativo**: Gerenciamento completo de playlists e canais
- **Tema Material You**: Interface moderna com suporte a modo claro/escuro
- **Responsivo**: Funciona perfeitamente em desktops, tablets e dispositivos móveis
- **Upload de Listas**: Importação fácil de listas M3U8 via URL
- **Categorização**: Organização automática de canais por grupos
- **Busca e Filtros**: Sistema de pesquisa e filtros por categoria
- **Estatísticas**: Dashboard com métricas de uso e performance

### 🎨 Design e UI/UX
- **Material You Design System**: Tema personalizado seguindo as diretrizes do Google
- **Grid Responsivo**: Layout adaptativo com sistema de grid do Material-UI
- **Animações Suaves**: Transições e efeitos visuais modernos
- **Acessibilidade**: Interface acessível com suporte a leitores de tela
- **Modo Escuro/Claro**: Alternância automática baseada na preferência do sistema

### 🔧 Tecnologias Utilizadas
- **Next.js 15** - Framework React para produção
- **Material-UI (MUI)** - Biblioteca de componentes React
- **HLS.js** - Reprodução de streams HLS/M3U8
- **JavaScript ES6+** - Linguagem de programação moderna
- **localStorage** - Armazenamento local de dados

## 📋 Pré-requisitos

- Node.js 18+ 
- NPM ou Yarn
- Navegador moderno com suporte a HLS

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/DashboardTvonline.git
cd DashboardTvonline/nextjs-tv-dashboard
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto em modo de desenvolvimento**
```bash
npm run dev
```

4. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📁 Estrutura do Projeto

```
nextjs-tv-dashboard/
├── app/                          # App Router (Next.js 13+)
│   ├── dashboard/               # Página do dashboard administrativo
│   ├── layout.js               # Layout raiz da aplicação
│   ├── page.js                 # Página inicial
│   └── globals.css             # Estilos globais
├── src/
│   ├── components/             # Componentes React reutilizáveis
│   │   ├── HlsPlayer.js       # Player de vídeo HLS
│   │   ├── ChannelGrid.js     # Grid de canais estilo Netflix
│   │   └── MainLayout.js      # Layout principal com navegação
│   ├── theme/                  # Configuração de temas
│   │   ├── theme.js           # Definição dos temas Material You
│   │   └── ThemeProvider.js   # Provider de contexto do tema
│   └── utils/                  # Utilitários e helpers
│       └── m3u8Utils.js       # Funções para parsing de M3U8
├── public/                     # Arquivos estáticos
├── package.json               # Dependências e scripts
└── README.md                  # Este arquivo
```

## 🎮 Como Usar

### 1. Página Inicial
- Visualize estatísticas gerais do sistema
- Navegue pelos canais disponíveis
- Use a busca e filtros para encontrar conteúdo específico
- Clique em qualquer canal para iniciar a reprodução

### 2. Adicionar Lista M3U8
- Clique no botão "Adicionar Lista M3U8"
- Cole a URL da sua playlist IPTV
- A aplicação processará automaticamente os canais
- Os canais serão organizados por categorias

### 3. Dashboard Administrativo
- Acesse via menu lateral "Dashboard"
- Gerencie suas playlists importadas
- Visualize estatísticas detalhadas
- Execute ações em lote nos canais

### 4. Player de Vídeo
- Player HLS otimizado para streams M3U8
- Controles customizados (play/pause, volume, fullscreen)
- Suporte a múltiplas qualidades
- Detecção automática de formato

## 🔧 Configuração Avançada

### Personalização do Tema
Edite `src/theme/theme.js` para customizar:
- Paleta de cores Material You
- Tipografia e fontes
- Componentes e estilos
- Breakpoints responsivos

### Adição de Funcionalidades
- **Favoritos**: Implemente sistema de favoritos
- **Histórico**: Adicione histórico de reprodução
- **EPG**: Integre guia de programação eletrônica
- **Multi-usuário**: Sistema de contas e perfis

## 🐛 Solução de Problemas

### Streams não reproduzem
- Verifique se a URL M3U8 está acessível
- Confirme se o navegador suporta HLS
- Teste com diferentes streams para isolar o problema

### Interface não carrega
- Limpe o cache do navegador
- Verifique o console para erros JavaScript
- Reinstale as dependências com `npm install`

### Problemas de CORS
- Alguns provedores IPTV bloqueiam acesso via browser
- Use um proxy CORS ou servidor próprio para contornar

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvido Com

- **Next.js** - The React Framework for Production
- **Material-UI** - React components for faster and easier web development
- **HLS.js** - JavaScript HLS client using Media Source Extension

## 🎯 Roadmap

- [ ] Sistema de favoritos e listas personalizadas
- [ ] Integração com EPG (Electronic Program Guide)
- [ ] Suporte a múltiplos usuários
- [ ] API REST para gerenciamento remoto
- [ ] Aplicativo móvel companion
- [ ] Integração com smart TVs
- [ ] Sistema de notificações
- [ ] Analytics avançados

## 📞 Suporte

Se você encontrar algum problema ou tiver sugestões, por favor:
- Abra uma [issue](https://github.com/seu-usuario/DashboardTvonline/issues)
- Entre em contato através do email: suporte@tvdashboard.com

---

⭐ **Gostou do projeto? Deixe uma estrela no repositório!**
