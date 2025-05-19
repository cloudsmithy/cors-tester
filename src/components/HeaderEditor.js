import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  TextField,
  Grid,
  Divider,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const HeaderEditor = ({ headers, onChange }) => {
  const [headerPairs, setHeaderPairs] = useState(() => {
    try {
      if (headers) {
        const parsed = typeof headers === 'string' ? JSON.parse(headers) : headers;
        return Object.entries(parsed).map(([key, value]) => ({ key, value }));
      }
    } catch (e) {}
    return [{ key: '', value: '' }];
  });

  const handleHeaderChange = (index, field, value) => {
    const newPairs = [...headerPairs];
    newPairs[index][field] = value;
    setHeaderPairs(newPairs);
    updateHeaders(newPairs);
  };

  const addHeader = () => {
    setHeaderPairs([...headerPairs, { key: '', value: '' }]);
  };

  const removeHeader = (index) => {
    const newPairs = headerPairs.filter((_, i) => i !== index);
    setHeaderPairs(newPairs.length ? newPairs : [{ key: '', value: '' }]);
    updateHeaders(newPairs);
  };

  const updateHeaders = (pairs) => {
    const headerObj = {};
    pairs.forEach(pair => {
      if (pair.key.trim()) {
        headerObj[pair.key.trim()] = pair.value;
      }
    });
    onChange(JSON.stringify(headerObj, null, 2));
  };

  const addCommonHeaders = (type) => {
    let newHeader = {};
    
    switch(type) {
      case 'json':
        newHeader = { key: 'Content-Type', value: 'application/json' };
        break;
      case 'form':
        newHeader = { key: 'Content-Type', value: 'application/x-www-form-urlencoded' };
        break;
      case 'auth':
        newHeader = { key: 'Authorization', value: 'Bearer ' };
        break;
      default:
        return;
    }
    
    // 检查是否已存在相同的键
    const exists = headerPairs.some(pair => pair.key === newHeader.key);
    
    if (!exists) {
      const newPairs = [...headerPairs, newHeader];
      setHeaderPairs(newPairs);
      updateHeaders(newPairs);
    }
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">请求头</Typography>
        <Box>
          <Tooltip title="添加JSON内容类型">
            <Button 
              size="small" 
              onClick={() => addCommonHeaders('json')}
              sx={{ mr: 1 }}
            >
              +JSON
            </Button>
          </Tooltip>
          <Tooltip title="添加表单内容类型">
            <Button 
              size="small" 
              onClick={() => addCommonHeaders('form')}
              sx={{ mr: 1 }}
            >
              +表单
            </Button>
          </Tooltip>
          <Tooltip title="添加授权头">
            <Button 
              size="small" 
              onClick={() => addCommonHeaders('auth')}
            >
              +授权
            </Button>
          </Tooltip>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {headerPairs.map((pair, index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
          <Grid item xs={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Header名称"
              value={pair.key}
              onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Header值"
              value={pair.value}
              onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              size="small" 
              onClick={() => removeHeader(index)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      
      <Button
        startIcon={<AddIcon />}
        onClick={addHeader}
        size="small"
        sx={{ mt: 1 }}
      >
        添加请求头
      </Button>
    </Paper>
  );
};

export default HeaderEditor;