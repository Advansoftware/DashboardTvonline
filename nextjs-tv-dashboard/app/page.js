'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import TVInterface from '../src/components/TVInterface';
import { useIndexedDB } from '../src/hooks/useIndexedDB';

export default function Home() {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { isReady, getChannels, saveChannels } = useIndexedDB();

  // Garantir hidratação correta
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Carregar canais do IndexedDB
  useEffect(() => {
    const loadChannels = async () => {
      if (!isReady) return;

      try {
        const savedChannels = await getChannels();

        // Se não tiver canais no IndexedDB, tentar carregar do localStorage (migração)
        if (savedChannels.length === 0) {
          const localStorageChannels = localStorage.getItem('tv-dashboard-channels') ||
            localStorage.getItem('tvChannels');
          if (localStorageChannels) {
            const parsedChannels = JSON.parse(localStorageChannels);
            setChannels(parsedChannels);

            // Migrar para IndexedDB
            await saveChannels(parsedChannels);
          } else {
            // Canais de exemplo para demonstração
            const sampleChannels = [
              {
                id: 'sample-1',
                name: 'Canal Exemplo 1',
                url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                group: 'Entretenimento',
                logo: 'https://via.placeholder.com/100x100/6750A4/FFFFFF?text=C1'
              },
              {
                id: 'sample-2',
                name: 'Canal Exemplo 2',
                url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
                group: 'Esportes',
                logo: 'https://via.placeholder.com/100x100/625B71/FFFFFF?text=C2'
              },
              {
                id: 'sample-3',
                name: 'Canal Exemplo 3',
                url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
                group: 'Notícias',
                logo: 'https://via.placeholder.com/100x100/7D5260/FFFFFF?text=C3'
              }
            ];
            setChannels(sampleChannels);
            await saveChannels(sampleChannels);
          }
        } else {
          setChannels(savedChannels);
        }
      } catch (error) {
        console.error('Erro ao carregar canais:', error);
        // Fallback para localStorage
        const localStorageChannels = localStorage.getItem('tv-dashboard-channels') ||
          localStorage.getItem('tvChannels');
        if (localStorageChannels) {
          setChannels(JSON.parse(localStorageChannels));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadChannels();
  }, [isReady, getChannels, saveChannels]);

  if (!isMounted || isLoading) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Loading será mostrado pelo TVInterface */}
      </Box>
    );
  }

  return <TVInterface channels={channels} />;
}
