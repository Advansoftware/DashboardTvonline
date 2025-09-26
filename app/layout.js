import "./globals.css";
import { CustomThemeProvider } from '../src/theme/ThemeProvider';

export const metadata = {
  title: "TV Dashboard - IPTV Player & Manager",
  description: "Dashboard para gerenciamento e reprodução de canais IPTV com suporte a listas M3U8",
  keywords: "IPTV, M3U8, TV, Dashboard, Streaming, Player",
  authors: [{ name: "TV Dashboard Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <CustomThemeProvider>
          {children}
        </CustomThemeProvider>
      </body>
    </html>
  );
}
