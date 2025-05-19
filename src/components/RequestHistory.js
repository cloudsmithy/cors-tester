import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  Typography,
  Tooltip,
  Chip,
  Box,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import HistoryIcon from '@mui/icons-material/History';

// 请求方法对应的颜色
const methodColors = {
  GET: 'info',
  POST: 'success',
  PUT: 'warning',
  DELETE: 'error',
  PATCH: 'secondary'
};

const RequestHistory = ({ history, onSelect, onClear, onDelete }) => {
  if (!history || history.length === 0) {
    return (
      <Paper 
        elevation={0} 
        variant="outlined" 
        sx={{ 
          p: 3, 
          mt: 3, 
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '150px',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
        }}
      >
        <HistoryIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
        <Typography color="text.secondary" align="center">
          暂无请求历史记录
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        mt: 3, 
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
      }}>
        <Typography variant="subtitle1">
          请求历史记录
        </Typography>
        <Tooltip title="清空历史记录">
          <IconButton size="small" onClick={onClear}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <List sx={{ maxHeight: '300px', overflow: 'auto', p: 0 }}>
        {history.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem
              button
              onClick={() => onSelect(item)}
              secondaryAction={
                <Box>
                  <Tooltip title="重新发送">
                    <IconButton edge="end" size="small" onClick={(e) => {
                      e.stopPropagation();
                      onSelect(item);
                    }}>
                      <ReplayIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除记录">
                    <IconButton edge="end" size="small" onClick={(e) => {
                      e.stopPropagation();
                      onDelete(index);
                    }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemIcon sx={{ minWidth: '40px' }}>
                <Chip 
                  label={item.method} 
                  color={methodColors[item.method] || 'default'} 
                  size="small" 
                  variant="outlined"
                />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography 
                    variant="body2" 
                    noWrap 
                    sx={{ 
                      maxWidth: '250px', 
                      textOverflow: 'ellipsis',
                      overflow: 'hidden'
                    }}
                  >
                    {item.url}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.timestamp).toLocaleString()}
                  </Typography>
                }
              />
            </ListItem>
            {index < history.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default RequestHistory;