import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Button, 
  TextField, 
  MenuItem, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  Paper,
  Tooltip,
  InputAdornment,
  Switch,
  FormControlLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HistoryIcon from '@mui/icons-material/History';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ClearIcon from '@mui/icons-material/Clear';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import BugReportIcon from '@mui/icons-material/BugReport';

import ResponseViewer from './components/ResponseViewer';
import RequestHistory from './components/RequestHistory';
import HeaderEditor from './components/HeaderEditor';
import ConsoleErrorViewer from './components/ConsoleErrorViewer';
import consoleErrorCatcher from './utils/ConsoleErrorCatcher';

const CorsTester = ({ toggleTheme, mode }) => {
  const theme = useTheme();
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('cors-tester-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('cors-tester-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentRequestIsFavorite, setCurrentRequestIsFavorite] = useState(false);
  const [debugMode, setDebugMode] = useState(true); // 默认启用调试模式
  const [consoleErrors, setConsoleErrors] = useState([]);

  useEffect(() => {
    localStorage.setItem('cors-tester-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('cors-tester-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    // 检查当前请求是否在收藏夹中
    if (url) {
      const isFavorite = favorites.some(fav => 
        fav.url === url && 
        fav.method === method && 
        fav.headers === headers && 
        fav.body === body
      );
      setCurrentRequestIsFavorite(isFavorite);
    } else {
      setCurrentRequestIsFavorite(false);
    }
  }, [url, method, headers, body, favorites]);

  // 启用或禁用控制台错误捕获
  useEffect(() => {
    if (debugMode) {
      consoleErrorCatcher.startCapturing();
    } else {
      consoleErrorCatcher.stopCapturing();
      setConsoleErrors([]);
    }
    
    return () => {
      consoleErrorCatcher.stopCapturing();
    };
  }, [debugMode]);

  const handleUrlChange = (event) => {
    setUrl(event.target.value);
  };

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
  };

  const handleHeadersChange = (value) => {
    setHeaders(value);
  };

  const handleBodyChange = (event) => {
    setBody(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRequest = async () => {
    if (!url) {
      showSnackbar('请输入URL', 'warning');
      return;
    }

    setLoading(true);
    setResponse(null);
    setError(null);
    
    // 清除之前捕获的控制台错误
    if (debugMode) {
      consoleErrorCatcher.clearErrors();
    }

    try {
      let parsedHeaders = {};
      let parsedBody = null;

      try {
        parsedHeaders = headers ? (typeof headers === 'string' ? JSON.parse(headers) : headers) : {};
      } catch (e) {
        showSnackbar('请求头格式错误，请检查JSON格式', 'error');
        setLoading(false);
        return;
      }

      try {
        parsedBody = body ? JSON.parse(body) : null;
      } catch (e) {
        showSnackbar('请求体格式错误，请检查JSON格式', 'error');
        setLoading(false);
        return;
      }
      
      // 使用更详细的配置来捕获更多信息
      const axiosConfig = {
        url: url,
        method: method,
        headers: parsedHeaders,
        data: parsedBody,
        timeout: 30000, // 30秒超时
        validateStatus: function (status) {
          // 允许所有状态码，这样即使是错误状态码也会进入then而不是catch
          return true;
        }
      };
      
      const response = await axios(axiosConfig);
      
      // 检查状态码，如果是错误状态码，则设置为错误
      if (response.status >= 400) {
        const errorObj = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        errorObj.response = response;
        throw errorObj;
      }
      
      setResponse(response);
      
      // 添加到历史记录
      const newHistoryItem = {
        url,
        method,
        headers,
        body,
        timestamp: new Date().getTime(),
        status: response.status
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 19)]); // 最多保存20条记录
      
    } catch (error) {
      console.error('Error details:', error);
      
      // 增强错误对象，确保包含所有可能的信息
      if (error.response) {
        // 服务器响应了，但状态码不在2xx范围内
        error.message = `HTTP Error: ${error.response.status} ${error.response.statusText || ''}`;
      } else if (error.request) {
        // 请求已发送但没有收到响应
        if (error.message === 'Network Error') {
          // 检查是否是CORS错误
          const corsErrors = consoleErrorCatcher.getErrors().filter(err => 
            err.message && (
              err.message.includes('CORS') || 
              err.message.includes('cross-origin') ||
              err.message.includes('Access-Control-Allow-Origin')
            )
          );
          
          if (corsErrors.length > 0) {
            error.message = `CORS Error: ${corsErrors[0].message}`;
            error.corsError = true;
          } else {
            error.message = 'Network Error: 无法连接到服务器或请求被中断';
          }
        }
      } else {
        // 设置请求时发生了错误
        error.message = `Request Error: ${error.message}`;
      }
      
      setError(error);
    } finally {
      setLoading(false);
      
      // 获取捕获的控制台错误
      if (debugMode) {
        setTimeout(() => {
          setConsoleErrors(consoleErrorCatcher.getErrors());
        }, 100); // 给一点时间让错误被捕获
      }
    }
  };

  const clearForm = () => {
    setUrl('');
    setMethod('GET');
    setHeaders('');
    setBody('');
    setResponse(null);
    setError(null);
    setConsoleErrors([]);
  };

  const handleHistorySelect = (item) => {
    setUrl(item.url);
    setMethod(item.method);
    setHeaders(item.headers);
    setBody(item.body);
  };

  const handleHistoryClear = () => {
    setHistory([]);
    showSnackbar('历史记录已清空');
  };

  const handleHistoryDelete = (index) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
    showSnackbar('已删除该记录');
  };

  const toggleFavorite = () => {
    if (currentRequestIsFavorite) {
      // 从收藏夹中移除
      setFavorites(prev => prev.filter(fav => 
        !(fav.url === url && fav.method === method && fav.headers === headers && fav.body === body)
      ));
      showSnackbar('已从收藏夹移除', 'info');
    } else {
      // 添加到收藏夹
      if (!url) {
        showSnackbar('请先填写URL', 'warning');
        return;
      }
      
      const newFavorite = {
        url,
        method,
        headers,
        body,
        timestamp: new Date().getTime()
      };
      
      setFavorites(prev => [newFavorite, ...prev]);
      showSnackbar('已添加到收藏夹', 'success');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => showSnackbar('已复制到剪贴板', 'success'))
      .catch(() => showSnackbar('复制失败', 'error'));
  };

  const handleClearConsoleErrors = () => {
    consoleErrorCatcher.clearErrors();
    setConsoleErrors([]);
  };

  const handleCopyConsoleError = (text) => {
    copyToClipboard(text);
  };

  return (
    <Box sx={{ 
      padding: { xs: 2, sm: 3 }, 
      maxWidth: 1200, 
      margin: '0 auto', 
      marginTop: { xs: 2, sm: 5 }
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          CORS 跨域测试工具
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch 
                checked={debugMode}
                onChange={(e) => setDebugMode(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BugReportIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">调试模式</Typography>
              </Box>
            }
            sx={{ mr: 2 }}
          />
          <IconButton onClick={toggleTheme} color="primary">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  select
                  label="请求方法"
                  value={method}
                  onChange={handleMethodChange}
                  variant="outlined"
                  size="small"
                  sx={{ width: '120px', mr: 2 }}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                  <MenuItem value="OPTIONS">OPTIONS</MenuItem>
                  <MenuItem value="HEAD">HEAD</MenuItem>
                </TextField>
                
                <TextField
                  fullWidth
                  label="请求URL"
                  placeholder="https://example.com/api"
                  value={url}
                  onChange={handleUrlChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: url && (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => setUrl('')}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                  <Tab label="请求头" />
                  <Tab label="请求体" />
                </Tabs>
                
                <Box hidden={tabValue !== 0}>
                  <HeaderEditor 
                    headers={headers} 
                    onChange={handleHeadersChange} 
                  />
                </Box>
                
                <Box hidden={tabValue !== 1}>
                  <TextField
                    fullWidth
                    label="请求体 (JSON)"
                    value={body}
                    onChange={handleBodyChange}
                    variant="outlined"
                    multiline
                    minRows={8}
                    placeholder='{\n  "key": "value"\n}'
                    InputProps={{
                      endAdornment: body && (
                        <InputAdornment position="end">
                          <Tooltip title="复制">
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(body)}
                              sx={{ position: 'absolute', top: 8, right: 8 }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRequest}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  >
                    {loading ? '发送中...' : '发送请求'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={clearForm}
                    sx={{ ml: 2 }}
                  >
                    清空
                  </Button>
                </Box>
                <Tooltip title={currentRequestIsFavorite ? "从收藏夹移除" : "添加到收藏夹"}>
                  <IconButton 
                    color={currentRequestIsFavorite ? "primary" : "default"}
                    onClick={toggleFavorite}
                  >
                    {currentRequestIsFavorite ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
              
              {/* 显示控制台错误 */}
              {debugMode && (
                <ConsoleErrorViewer 
                  errors={consoleErrors} 
                  onClear={handleClearConsoleErrors}
                  onCopy={handleCopyConsoleError}
                />
              )}
              
              {/* 响应查看器 */}
              <ResponseViewer 
                response={response} 
                error={error} 
                consoleErrors={debugMode ? consoleErrors : []}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                <HistoryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                请求历史
              </Typography>
              <Divider />
            </Box>
            
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <RequestHistory 
                history={history} 
                onSelect={handleHistorySelect} 
                onClear={handleHistoryClear}
                onDelete={handleHistoryDelete}
              />
              
              {favorites.length > 0 && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    <BookmarkIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    收藏请求
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <RequestHistory 
                    history={favorites} 
                    onSelect={handleHistorySelect} 
                    onClear={() => {
                      setFavorites([]);
                      showSnackbar('收藏夹已清空');
                    }}
                    onDelete={(index) => {
                      setFavorites(prev => prev.filter((_, i) => i !== index));
                      showSnackbar('已从收藏夹移除');
                    }}
                  />
                </Box>
              )}
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                CORS 跨域测试工具 - 帮助您测试和调试API跨域请求
              </Typography>
              {debugMode && (
                <Typography variant="caption" color="primary" align="center" sx={{ display: 'block', mt: 1 }}>
                  调试模式已启用 - 正在捕获控制台错误
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CorsTester;