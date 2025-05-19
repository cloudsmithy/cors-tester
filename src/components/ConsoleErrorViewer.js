import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  IconButton, 
  Collapse,
  Divider,
  Chip,
  Button,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

/**
 * 控制台错误查看器组件
 * 显示捕获的浏览器控制台错误
 */
const ConsoleErrorViewer = ({ errors, onClear, onCopy }) => {
  const [expandedItems, setExpandedItems] = useState({});

  if (!errors || errors.length === 0) {
    return (
      <Box sx={{ mt: 2, p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          没有捕获到控制台错误
        </Typography>
      </Box>
    );
  }

  const toggleExpand = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleCopy = (error) => {
    const textToCopy = `
类型: ${error.type || 'ERROR'}
消息: ${error.message}
${error.stack ? `堆栈: ${error.stack}` : ''}
时间: ${new Date(error.timestamp).toLocaleString()}
    `.trim();
    
    if (onCopy) {
      onCopy(textToCopy);
    } else {
      navigator.clipboard.writeText(textToCopy)
        .catch(err => console.error('复制失败:', err));
    }
  };

  const getErrorIcon = (error) => {
    if (error.type === 'CONSOLE_ERROR' || error.type === 'WINDOW_ERROR') {
      return <ErrorOutlineIcon fontSize="small" color="error" />;
    } else if (error.type === 'UNHANDLED_REJECTION') {
      return <WarningIcon fontSize="small" color="warning" />;
    } else {
      return <InfoIcon fontSize="small" color="info" />;
    }
  };

  const getErrorTypeColor = (type) => {
    switch (type) {
      case 'CONSOLE_ERROR':
      case 'WINDOW_ERROR':
      case 'XHR_ERROR':
        return 'error';
      case 'UNHANDLED_REJECTION':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1">
          控制台错误 ({errors.length})
        </Typography>
        <Button 
          size="small" 
          variant="outlined" 
          color="error" 
          onClick={onClear}
          startIcon={<DeleteIcon />}
        >
          清除
        </Button>
      </Box>
      
      <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
        <List dense disablePadding>
          {errors.map((error, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider />}
              <ListItem 
                sx={{ 
                  display: 'block', 
                  py: 1,
                  px: 2,
                  bgcolor: index % 2 === 0 ? 'background.default' : 'background.paper'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getErrorIcon(error)}
                    <Chip 
                      label={error.type || 'ERROR'} 
                      size="small" 
                      color={getErrorTypeColor(error.type)}
                      sx={{ ml: 1, fontSize: '0.7rem' }} 
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        ml: 1,
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '300px'
                      }}
                    >
                      {error.message}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Tooltip title="复制错误信息">
                      <IconButton size="small" onClick={() => handleCopy(error)}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => toggleExpand(index)}>
                      {expandedItems[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>
                
                <Collapse in={expandedItems[index]} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 1, pl: 4 }}>
                    <Typography 
                      variant="caption" 
                      component="div" 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        bgcolor: 'background.paper',
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      {error.message}
                      {error.stack && (
                        <Box component="div" sx={{ mt: 1, color: 'text.secondary' }}>
                          {error.stack}
                        </Box>
                      )}
                      {error.source && (
                        <Box component="div" sx={{ mt: 1 }}>
                          来源: {error.source} {error.lineno && `(行 ${error.lineno}, 列 ${error.colno})`}
                        </Box>
                      )}
                      <Box component="div" sx={{ mt: 1, color: 'text.secondary' }}>
                        时间: {new Date(error.timestamp).toLocaleString()}
                      </Box>
                    </Typography>
                  </Box>
                </Collapse>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ConsoleErrorViewer;