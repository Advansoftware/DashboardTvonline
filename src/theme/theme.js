import { createTheme } from '@mui/material/styles';

// Paleta de cores Material You personalizada
const materialYouColors = {
  primary: {
    main: '#6750A4',
    light: '#9A82DB',
    dark: '#4F378B',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#625B71',
    light: '#908399',
    dark: '#463D52',
    contrastText: '#FFFFFF',
  },
  tertiary: {
    main: '#7D5260',
    light: '#A97C89',
    dark: '#633B48',
    contrastText: '#FFFFFF',
  },
  surface: {
    main: '#FEF7FF',
    variant: '#E7E0EC',
    container: '#F3EDF7',
    containerHigh: '#ECE6F0',
  },
  background: {
    default: '#FEF7FF',
    paper: '#FEF7FF',
  },
  error: {
    main: '#BA1A1A',
    light: '#DE5147',
    dark: '#93000A',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FF8F00',
    light: '#FFA726',
    dark: '#E65100',
    contrastText: '#000000',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
  },
};

// Tema escuro Material You
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D0BCFF',
      light: '#EADDFF',
      dark: '#4F378B',
      contrastText: '#21005D',
    },
    secondary: {
      main: '#CCC2DC',
      light: '#E8DEF8',
      dark: '#4A4458',
      contrastText: '#332D41',
    },
    tertiary: {
      main: '#EFB8C8',
      light: '#FFD8E4',
      dark: '#492532',
      contrastText: '#31111D',
    },
    background: {
      default: '#10061A',
      paper: '#1D1B20',
    },
    surface: {
      main: '#1D1B20',
      variant: '#49454F',
      container: '#211F26',
      containerHigh: '#2B2930',
    },
    error: {
      main: '#FFB4AB',
      light: '#FFDAD6',
      dark: '#93000A',
      contrastText: '#690005',
    },
  },
});

// Tema claro Material You
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...materialYouColors,
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.16)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0px 16px 16px 0px',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

// Aplicar as mesmas configurações ao tema escuro
const darkThemeComplete = createTheme({
  ...darkTheme,
  typography: lightTheme.typography,
  components: {
    ...lightTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
  },
  breakpoints: lightTheme.breakpoints,
});

export { lightTheme, darkThemeComplete as darkTheme };