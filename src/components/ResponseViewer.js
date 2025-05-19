import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Tabs, 
  Tab, 
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorAnalyzer from './ErrorAnalyzer';

const StyledPre = styled('pre')(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
  borderRadius: theme.shape.borderRadius,
  overflow: 'auto',
  maxHeight: '300px',
  fontSize: '0.875rem',
  fontFamily: '"Roboto Mono", monospace',
}));

const ResponseViewer = ({ response, error, consoleErrors }) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (!response && !error && (!consoleErrors || consoleErrors.length === 0)) {
    return (
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: 3, 
          mt: 3, 
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
        }}
      >
        <Typography color="text.secondary" align="center">
          发送请求后，响应结果将显示在这里
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <>
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            p: 3, 
            mt: 3, 
            borderRadius: 2,
            borderColor: 'error.main',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" color="error" gutterBottom>
              请求失败
            </Typography>
            <Chip 
              label={error.response && error.response.status ? `${error.response.status} ${error.response.statusText || ''}` : '网络错误'} 
              color="error" 
              size="small" 
              variant="outlined"
            />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" gutterBottom>错误信息:</Typography>
          <StyledPre>
            {error.message}
          </StyledPre>
          
          {error.response && error.response.data && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>响应数据:</Typography>
              <StyledPre>
                {typeof error.response.data === 'object' 
                  ? JSON.stringify(error.response.data, null, 2) 
                  : String(error.response.data)}
              </StyledPre>
            </>
          )}
        </Paper>
        
        {/* 添加错误分析组件 */}
        <ErrorAnalyzer error={error} consoleErrors={consoleErrors} />
      </>
    );
  }

  if (response) {
    return (
      <>
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            p: 3, 
            mt: 3, 
            borderRadius: 2,
            borderColor: 'success.main',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.05)'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              请求成功
            </Typography>
            <Chip 
              label={`${response.status} ${response.statusText || ''}`} 
              color="success" 
              size="small" 
              variant="outlined"
            />
          </Box>
          
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="响应数据" />
            <Tab label="响应头" />
            <Tab label="请求信息" />
          </Tabs>
          
          <Box hidden={tabValue !== 0}>
            {response.data && (
              <StyledPre>
                {typeof response.data === 'object' 
                  ? JSON.stringify(response.data, null, 2) 
                  : response.data}
              </StyledPre>
            )}
          </Box>
          
          <Box hidden={tabValue !== 1}>
            <StyledPre>
              {JSON.stringify(response.headers, null, 2)}
            </StyledPre>
          </Box>
          
          <Box hidden={tabValue !== 2}>
            <Typography variant="subtitle2" gutterBottom>请求URL:</Typography>
            <StyledPre>{response.config.url}</StyledPre>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>请求方法:</Typography>
            <StyledPre>{response.config.method.toUpperCase()}</StyledPre>
            
            {response.config.headers && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>请求头:</Typography>
                <StyledPre>{JSON.stringify(response.config.headers, null, 2)}</StyledPre>
              </>
            )}
            
            {response.config.data && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>请求体:</Typography>
                <StyledPre>
                  {typeof response.config.data === 'string' 
                    ? response.config.data 
                    : JSON.stringify(response.config.data, null, 2)}
                </StyledPre>
              </>
            )}
          </Box>
        </Paper>
        
        {/* 即使请求成功，也可能有控制台错误需要显示 */}
        {consoleErrors && consoleErrors.length > 0 && (
          <ErrorAnalyzer consoleErrors={consoleErrors} />
        )}
      </>
    );
  }
  
  // 只有控制台错误但没有响应或错误的情况
  return (
    <>
      {consoleErrors && consoleErrors.length > 0 && (
        <Paper 
          elevation={0} 
          variant="outlined" 
          sx={{ 
            p: 3, 
            mt: 3, 
            borderRadius: 2,
            borderColor: 'warning.main',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,152,0,0.1)' : 'rgba(255,152,0,0.05)'
          }}
        >
          <Typography variant="h6" color="warning.main" gutterBottom>
            检测到控制台错误
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <ErrorAnalyzer consoleErrors={consoleErrors} />
        </Paper>
      )}
    </>
  );
};

export default ResponseViewer;