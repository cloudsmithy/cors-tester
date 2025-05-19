/**
 * 控制台错误捕获工具
 * 用于捕获浏览器控制台中的错误信息，特别是网络和CORS相关错误
 */

class ConsoleErrorCatcher {
  constructor() {
    this.errors = [];
    this.isListening = false;
    this.originalConsoleError = null;
    this.originalWindowError = null;
    this.originalWindowUnhandledRejection = null;
    this.originalXHROpen = null;
  }

  /**
   * 开始捕获控制台错误
   */
  startCapturing() {
    if (this.isListening) return;
    
    this.errors = [];
    this.isListening = true;
    
    // 保存原始console.error方法
    this.originalConsoleError = console.error;
    
    // 重写console.error
    console.error = (...args) => {
      // 调用原始方法以保持正常功能
      this.originalConsoleError.apply(console, args);
      
      // 捕获错误信息
      let errorMessage = '';
      try {
        errorMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
      } catch (e) {
        errorMessage = args.map(arg => String(arg)).join(' ');
      }
      
      // 特别处理CORS错误
      if (errorMessage.includes('Access to XMLHttpRequest') && 
          errorMessage.includes('has been blocked by CORS policy')) {
        this.errors.push({
          type: 'CORS_ERROR',
          message: errorMessage,
          timestamp: new Date().getTime()
        });
      } else {
        this.errors.push({
          type: 'CONSOLE_ERROR',
          message: errorMessage,
          timestamp: new Date().getTime()
        });
      }
    };
    
    // 捕获全局错误
    this.originalWindowError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (this.originalWindowError) {
        this.originalWindowError(message, source, lineno, colno, error);
      }
      
      this.errors.push({
        type: 'WINDOW_ERROR',
        message: message,
        source: source,
        lineno: lineno,
        colno: colno,
        stack: error ? error.stack : null,
        timestamp: new Date().getTime()
      });
    };
    
    // 捕获未处理的Promise拒绝
    this.originalWindowUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = (event) => {
      if (this.originalWindowUnhandledRejection) {
        this.originalWindowUnhandledRejection(event);
      }
      
      const reason = event.reason;
      this.errors.push({
        type: 'UNHANDLED_REJECTION',
        message: reason ? (reason.message || String(reason)) : 'Promise rejected',
        stack: reason && reason.stack ? reason.stack : null,
        timestamp: new Date().getTime()
      });
    };
    
    // 创建一个特殊的XMLHttpRequest监听器来捕获网络错误
    const self = this;
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
      const xhr = this;
      const url = args[1];
      
      xhr.addEventListener('error', function() {
        const errorObj = {
          type: 'XHR_ERROR',
          message: `Network error occurred when accessing: ${url}`,
          timestamp: new Date().getTime()
        };
        if (!self.errors.some(e => e.message === errorObj.message)) {
          self.errors.push(errorObj);
        }
      });
      
      // 捕获CORS错误
      const originalSend = xhr.send;
      xhr.send = function(...sendArgs) {
        xhr.addEventListener('loadend', function() {
          if (xhr.status === 0 && xhr.readyState === 4) {
            const corsErrorObj = {
              type: 'CORS_ERROR',
              message: `CORS error when accessing: ${url}`,
              timestamp: new Date().getTime()
            };
            if (!self.errors.some(e => e.message === corsErrorObj.message)) {
              self.errors.push(corsErrorObj);
            }
          }
        });
        return originalSend.apply(xhr, sendArgs);
      };
      
      return self.originalXHROpen.apply(xhr, args);
    };
  }

  /**
   * 停止捕获控制台错误
   */
  stopCapturing() {
    if (!this.isListening) return;
    
    // 恢复原始方法
    if (this.originalConsoleError) {
      console.error = this.originalConsoleError;
    }
    
    if (this.originalWindowError) {
      window.onerror = this.originalWindowError;
    }
    
    if (this.originalWindowUnhandledRejection) {
      window.onunhandledrejection = this.originalWindowUnhandledRejection;
    }
    
    // 恢复XMLHttpRequest
    if (this.originalXHROpen) {
      XMLHttpRequest.prototype.open = this.originalXHROpen;
    }
    
    this.isListening = false;
  }

  /**
   * 获取捕获的错误
   * @returns {Array} 捕获的错误数组
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * 清除捕获的错误
   */
  clearErrors() {
    this.errors = [];
  }
}

// 创建单例实例
const consoleErrorCatcher = new ConsoleErrorCatcher();

export default consoleErrorCatcher;