import React, { useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import CorsTester from './CorsTester';
import { lightTheme, darkTheme } from './theme';

function App() {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('cors-tester-theme');
    return savedMode || 'light';
  });

  const theme = useMemo(() => {
    return mode === 'dark' ? darkTheme : lightTheme;
  }, [mode]);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('cors-tester-theme', newMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <CorsTester toggleTheme={toggleTheme} mode={mode} />
      </div>
    </ThemeProvider>
  );
}

export default App;
