import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
  Link
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SecurityIcon from '@mui/icons-material/Security';
import DnsIcon from '@mui/icons-material/Dns';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import InfoIcon from '@mui/icons-material/Info';
import CodeIcon from '@mui/icons-material/Code';

const ErrorAnalyzer = ({ error, consoleErrors }) => {
  if (!error && (!consoleErrors || consoleErrors.length === 0)) {
    return null;
  }

  // 分析错误类型
  const getErrorType = () => {
    // 首先检查控制台错误中是否有CORS错误
    if (consoleErrors && consoleErrors.length > 0) {
      const corsError = consoleErrors.find(err => 
        err.type === 'CORS_ERROR' ||
        (err.message && (
          err.message.includes('CORS') || 
          err.message.includes('cross-origin') ||
          err.message.includes('Access-Control-Allow-Origin')
        ))
      );
      
      if (corsError) {
        return 'cors';
      }
    }
    
    // 然后检查Axios错误
    if (error) {
      if (error.message.includes('Network Error')) {
        // 检查是否是由CORS引起的网络错误
        if (consoleErrors && consoleErrors.some(err => 
          err.message && (
            err.message.includes('CORS') || 
            err.message.includes('cross-origin') ||
            err.message.includes('Access-Control-Allow-Origin')
          )
        )) {
          return 'cors';
        }
        return 'network';
      } else if (error.response) {
        if (error.response.status === 403) {
          return 'forbidden';
        } else if (error.response.status === 401) {
          return 'unauthorized';
        } else if (error.response.status === 404) {
          return 'notfound';
        } else if (error.response.status === 500) {
          return 'server';
        } else if (error.response.status === 429) {
          return 'ratelimit';
        }
        return 'http';
      } else if (error.request) {
        return 'request';
      }
    }
    
    return 'unknown';
  };

  const errorType = getErrorType();
  
  // 根据错误类型提供检查项和可能的解决方案
  const getErrorInfo = () => {
    switch (errorType) {
      case 'network':
        return {
          title: '网络连接错误',
          description: '无法建立与服务器的网络连接',
          checkItems: [
            '检查您的网络连接是否正常',
            '确认API服务器是否在线',
            '检查URL是否正确（包括协议、域名和端口）',
            '检查是否存在防火墙或代理限制',
            '尝试禁用浏览器扩展，某些安全扩展可能会阻止请求'
          ],
          possibleSolutions: [
            '使用ping或telnet命令测试服务器连通性',
            '尝试在不同的网络环境下访问',
            '检查服务器日志以获取更多信息'
          ]
        };
      case 'cors':
        return {
          title: 'CORS跨域错误',
          description: '浏览器阻止了跨域请求，这是一种安全机制，防止网站访问不同源的资源',
          checkItems: [
            '检查服务器是否设置了正确的CORS响应头',
            '确认服务器是否正确响应OPTIONS预检请求',
            '检查服务器返回的Access-Control-Allow-Origin头是否包含当前域名或*'
          ],
          possibleSolutions: [
            '在服务器端添加必要的CORS响应头',
            '使用代理服务器转发请求，例如在开发环境中配置代理',
            '对于开发环境，可以使用浏览器插件临时禁用CORS限制',
            '如果您控制服务器，可以在服务器端实现CORS支持'
          ],
          codeExamples: [
            {
              language: 'Node.js (Express)',
              code: `// 在服务器端添加以下代码
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});`
            },
            {
              language: 'Python (Flask)',
              code: `# 在服务器端添加以下代码
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def hello_world():
    return 'Hello, World!'`
            },
            {
              language: 'Java (Spring Boot)',
              code: `// 在服务器端添加以下代码
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}`
            }
          ]
        };
      case 'forbidden':
        return {
          title: '403 Forbidden错误',
          description: '服务器拒绝了请求',
          checkItems: [
            '检查认证信息是否正确',
            '确认您是否有权限访问该资源',
            '检查API密钥或令牌是否有效',
            '检查请求头中的Authorization是否正确'
          ],
          possibleSolutions: [
            '联系API提供者获取正确的访问权限',
            '更新认证凭据',
            '检查服务器日志以获取更多详细信息'
          ]
        };
      case 'unauthorized':
        return {
          title: '401 Unauthorized错误',
          description: '需要认证或认证失败',
          checkItems: [
            '检查认证信息是否已提供',
            '确认令牌或API密钥是否有效',
            '检查令牌是否已过期',
            '确认认证方式是否正确（Basic, Bearer等）'
          ],
          possibleSolutions: [
            '重新获取认证令牌',
            '检查认证头格式是否正确',
            '确认API文档中的认证要求'
          ]
        };
      case 'notfound':
        return {
          title: '404 Not Found错误',
          description: '请求的资源不存在',
          checkItems: [
            '检查URL路径是否正确',
            '确认API端点是否存在',
            '检查API版本是否正确',
            '确认资源ID或参数是否有效'
          ],
          possibleSolutions: [
            '参考API文档确认正确的端点',
            '检查URL拼写是否有误',
            '联系API提供者确认端点可用性'
          ]
        };
      case 'server':
        return {
          title: '500 服务器错误',
          description: '服务器内部错误',
          checkItems: [
            '检查请求参数是否有效',
            '确认请求格式是否正确',
            '检查请求体是否符合API要求',
            '查看服务器日志获取更多信息'
          ],
          possibleSolutions: [
            '联系API提供者报告问题',
            '检查API文档确认正确的请求格式',
            '尝试简化请求以定位问题'
          ]
        };
      case 'ratelimit':
        return {
          title: '429 请求过多',
          description: '超出API请求限制',
          checkItems: [
            '检查API调用频率是否过高',
            '确认是否达到了API使用配额',
            '检查响应头中的限制信息',
            '查看API文档了解限制规则'
          ],
          possibleSolutions: [
            '实现请求节流或限速',
            '联系API提供者增加配额',
            '优化应用减少不必要的API调用',
            '检查响应头中的Retry-After信息'
          ]
        };
      case 'request':
        return {
          title: '请求错误',
          description: '请求已发送但未收到响应',
          checkItems: [
            '检查请求超时设置',
            '确认服务器是否处理了请求但未返回响应',
            '检查网络连接是否中断',
            '确认服务器负载是否过高'
          ],
          possibleSolutions: [
            '增加请求超时时间',
            '检查服务器状态和日志',
            '实现请求重试机制'
          ]
        };
      case 'http':
        return {
          title: `HTTP错误 ${error.response ? error.response.status : ''}`,
          description: '收到了错误的HTTP状态码',
          checkItems: [
            '检查状态码的具体含义',
            '查看响应体中的错误信息',
            '确认请求参数和格式是否正确',
            '检查认证和授权信息'
          ],
          possibleSolutions: [
            '根据状态码和响应信息调整请求',
            '参考API文档了解错误处理',
            '联系API提供者获取帮助'
          ]
        };
      default:
        return {
          title: '未知错误',
          description: '发生了未分类的错误',
          checkItems: [
            '检查控制台错误信息',
            '查看网络请求详情',
            '检查请求和响应数据',
            '确认API文档要求'
          ],
          possibleSolutions: [
            '尝试简化请求以定位问题',
            '检查浏览器控制台获取更多信息',
            '联系API提供者寻求帮助'
          ]
        };
    }
  };

  const errorInfo = getErrorInfo();
  
  // 获取错误严重性
  const getSeverity = () => {
    switch (errorType) {
      case 'network':
      case 'server':
        return 'error';
      case 'cors':
      case 'forbidden':
      case 'unauthorized':
        return 'warning';
      default:
        return 'info';
    }
  };
  
  const severity = getSeverity();
  
  // 获取CORS相关的控制台错误
  const getCorsErrors = () => {
    if (!consoleErrors) return [];
    
    return consoleErrors.filter(err => 
      err.type === 'CORS_ERROR' ||
      (err.message && (
        err.message.includes('CORS') || 
        err.message.includes('cross-origin') ||
        err.message.includes('Access-Control-Allow-Origin')
      ))
    );
  };
  
  const corsErrors = getCorsErrors();
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom color="error">
        <ErrorOutlineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        错误分析
      </Typography>
      
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2, 
          borderColor: severity === 'error' ? 'error.main' : 
                      severity === 'warning' ? 'warning.main' : 'info.main',
          borderWidth: 1,
          borderRadius: 1,
          mb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {severity === 'error' ? (
            <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
          ) : severity === 'warning' ? (
            <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
          ) : (
            <InfoIcon color="info" sx={{ mr: 1 }} />
          )}
          <Typography variant="subtitle1" fontWeight="bold">
            {errorInfo.title}
          </Typography>
          <Chip 
            label={errorType} 
            size="small" 
            color={severity === 'error' ? 'error' : 
                  severity === 'warning' ? 'warning' : 'info'} 
            sx={{ ml: 2 }} 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {errorInfo.description}
        </Typography>
        
        {/* 显示CORS错误 */}
        {errorType === 'cors' && corsErrors.length > 0 && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              浏览器控制台CORS错误:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.8rem'
              }}
            >
              {corsErrors[0].message}
            </Typography>
          </Box>
        )}
        
        {/* 显示Axios错误 */}
        {error && (
          <Typography 
            variant="body2" 
            sx={{ 
              p: 1, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              fontFamily: 'monospace',
              mb: 2,
              overflowX: 'auto'
            }}
          >
            {error.message}
            {error.response && error.response.data && (
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                响应数据: {typeof error.response.data === 'object' 
                  ? JSON.stringify(error.response.data, null, 2) 
                  : String(error.response.data)}
              </Box>
            )}
          </Typography>
        )}
        
        <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">
              <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              检查项
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense disablePadding>
              {errorInfo.checkItems.map((item, index) => (
                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">
              <SettingsEthernetIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              可能的解决方案
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense disablePadding>
              {errorInfo.possibleSolutions.map((item, index) => (
                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <DnsIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item} 
                    sx={{ 
                      '& .MuiTypography-root': { 
                        whiteSpace: 'pre-wrap' 
                      } 
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
        
        {/* 代码示例部分 */}
        {errorInfo.codeExamples && (
          <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                <CodeIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                服务器端代码示例
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {errorInfo.codeExamples.map((example, index) => (
                <Box key={index} sx={{ mb: index < errorInfo.codeExamples.length - 1 ? 2 : 0 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {example.language}:
                  </Typography>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: 'background.paper', 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto'
                    }}
                  >
                    {example.code}
                  </Box>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        )}
        
        {/* 所有控制台错误 */}
        {consoleErrors && consoleErrors.length > 0 && (
          <Accordion disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">
                <SecurityIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                控制台错误 ({consoleErrors.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense disablePadding>
                {consoleErrors.map((err, index) => (
                  <ListItem key={index} sx={{ 
                    display: 'block', 
                    py: 1,
                    borderBottom: index < consoleErrors.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="caption" color="error.main" sx={{ fontWeight: 'bold' }}>
                      {err.type || 'ERROR'}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {err.message}
                    </Typography>
                    {err.stack && (
                      <Typography variant="caption" sx={{ 
                        display: 'block',
                        mt: 0.5,
                        fontFamily: 'monospace',
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {err.stack}
                      </Typography>
                    )}
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}
        
        {/* 学习资源链接 */}
        {errorType === 'cors' && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              学习资源:
            </Typography>
            <List dense disablePadding>
              <ListItem disablePadding sx={{ py: 0.5 }}>
                <Link 
                  href="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS" 
                  target="_blank"
                  rel="noopener"
                >
                  MDN Web文档: 跨源资源共享 (CORS)
                </Link>
              </ListItem>
              <ListItem disablePadding sx={{ py: 0.5 }}>
                <Link 
                  href="https://web.dev/cross-origin-resource-sharing/" 
                  target="_blank"
                  rel="noopener"
                >
                  web.dev: 跨源资源共享
                </Link>
              </ListItem>
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ErrorAnalyzer;