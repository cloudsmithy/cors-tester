[![Netlify Status](https://api.netlify.com/api/v1/badges/fd9a4041-0c73-408c-9249-551e6110d73a/deploy-status)](https://app.netlify.com/sites/cors-tool/deploys)
# CORS Tester
CORS Tester 是一个简单的 React 应用，旨在帮助开发者测试跨域请求。你可以输入 URL、选择请求方法，并添加自定义的请求头和请求体。应用将展示 API 响应或错误信息。

## 功能

- 输入目标 API 的 URL。
- 选择 HTTP 请求方法（GET、POST、PUT、DELETE、PATCH）。
- 输入自定义的请求头和请求体（JSON 格式）。
- 发送请求并在浏览器控制台中查看响应或错误信息。

## 安装与运行

### 克隆项目

```bash
git@github.com:cloudsmithy/cors-tester.git
cd cors-tester
```



### 安装依赖

确保你已经安装了 Node.js 和 npm。然后在项目目录下运行以下命令安装所需的依赖：

```bash
npm install
```

### 启动开发服务器

运行以下命令启动开发服务器：

```bash
npm start
```

打开浏览器并访问 `http://localhost:3000` 来查看应用。

## 使用方法

1. **输入 URL**: 在 URL 输入框中输入你想要测试的 API 地址。
2. **选择请求方法**: 从下拉菜单中选择请求方法（GET、POST、PUT、DELETE、PATCH）。
3. **输入 Headers**: 在 Headers 输入框中输入请求头信息，格式为 JSON。例如：
    ```json
    {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_TOKEN"
    }
    ```
4. **输入 Request Body**: 在 Request Body 输入框中输入请求体信息，格式为 JSON。例如：
    ```json
    {
      "key": "value"
    }
    ```
5. **发送请求**: 点击 “Send Request” 按钮发送请求。响应或错误信息将显示在浏览器的控制台中。

## 依赖

- [React](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Axios](https://axios-http.com/)

## 贡献

欢迎贡献！如果你有任何改进建议或发现问题，请提交 Issues 或 Pull Requests。

## 许可证

此项目使用 [MIT 许可证](LICENSE)。
