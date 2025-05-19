# CORS 跨域测试工具

一个用于测试和调试API跨域请求的React应用，可以帮助开发者快速诊断和解决CORS（跨域资源共享）相关问题。

## 功能特点

- 支持所有常见HTTP方法（GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD）
- 自定义请求头和请求体
- 详细的响应查看器，包括响应体、响应头和请求信息
- 请求历史记录和收藏功能
- 错误分析和诊断功能
- 控制台错误捕获（调试模式）
- 深色/浅色主题切换

## 错误诊断功能

本工具提供了强大的错误诊断功能，可以帮助开发者快速定位和解决常见的API请求问题：

- **网络错误分析**：分析网络连接问题，提供可能的解决方案
- **CORS错误诊断**：详细解释跨域资源共享错误，并提供修复建议
- **HTTP状态码解析**：针对不同的HTTP错误状态码提供专业解释和解决方案
- **控制台错误捕获**：在调试模式下捕获浏览器控制台中的错误信息，特别是CORS相关错误

## 使用方法

1. 输入目标API的URL
2. 选择HTTP请求方法
3. 添加必要的请求头和请求体
4. 点击"发送请求"按钮
5. 查看响应结果和错误分析

### 调试模式

启用调试模式可以捕获浏览器控制台中的错误信息，这对于诊断CORS问题特别有用：

1. 打开右上角的"调试模式"开关
2. 发送请求
3. 查看捕获的控制台错误
4. 使用错误分析工具获取解决方案

## 常见CORS错误及解决方案

### 1. 缺少 Access-Control-Allow-Origin 头

**错误信息**：
```
Access to XMLHttpRequest at 'https://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**解决方案**：
在服务器端添加适当的CORS头：
```
Access-Control-Allow-Origin: http://localhost:3000
```
或者允许所有来源（不推荐用于生产环境）：
```
Access-Control-Allow-Origin: *
```

### 2. 预检请求失败

**错误信息**：
```
Access to XMLHttpRequest at 'https://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check.
```

**解决方案**：
确保服务器正确响应OPTIONS预检请求，添加以下头信息：
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

### 3. 凭证问题

**错误信息**：
```
Access to XMLHttpRequest at 'https://api.example.com' from origin 'http://localhost:3000' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true' when the request's credentials mode is 'include'.
```

**解决方案**：
在服务器端添加：
```
Access-Control-Allow-Credentials: true
```
并确保Access-Control-Allow-Origin不使用通配符*，而是指定具体的域名。

## 开发

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm start
# 或
yarn start
```

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 技术栈

- React
- Material-UI
- Axios
- JavaScript ES6+

## 许可

MIT