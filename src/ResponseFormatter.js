import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 响应格式化器 - 生成用户友好的响应消息
 */
export class ResponseFormatter {
  constructor(config = {}) {
    this.config = config.display || {};
    this.templates = this.config.templates || {};
    this.primaryCommand = config.commands?.primary || 'models';
  }

  /**
   * 格式化模型列表
   */
  formatModelList(models, options = {}) {
    const template = this._loadTemplate('model_list.md');
    const data = this._prepareModelListData(models, options);
    return this._renderTemplate(template, data);
  }

  /**
   * 格式化切换结果
   */
  formatSwitchResult(result, modelInfo = null) {
    const template = this._loadTemplate('switch_result.md');
    const data = this._prepareSwitchResultData(result, modelInfo);
    return this._renderTemplate(template, data);
  }

  /**
   * 格式化错误消息
   */
  formatError(error, context = {}) {
    const template = this._loadTemplate('error_message.md');
    const data = this._prepareErrorData(error, context);
    return this._renderTemplate(template, data);
  }

  /**
   * 准备模型列表数据
   */
  _prepareModelListData(models, options) {
    const maxModels = this.config.maxModelsPerPage || 0;  // 0表示无限制
    const showModels = maxModels > 0 ? models.slice(0, maxModels) : models;
    const hasMore = maxModels > 0 && models.length > maxModels;
    
    // 准备每个模型的数据
    const formattedModels = showModels.map(model => ({
      index: model.index,
      emoji: this.config.showEmojis ? model.emoji : '',
      displayName: model.displayName,
      status: model.isDefault ? '✅ 主用' : '⚡ 备用',
      context: model.context,
      showContext: this.config.showContext !== false,
      authStatus: model.authStatus,
      showAuthStatus: this.config.showAuthStatus !== false,
      command: `${this.primaryCommand} ${model.index}`
    }));

    // 系统选项
    const systemOptions = {
      index: models.length + 1,
      index2: models.length + 2,
      command: `${this.primaryCommand} status`,
      command2: `${this.primaryCommand} refresh`
    };

    return {
      models: formattedModels,
      total: models.length,
      hasMore: hasMore,
      remaining: models.length - maxModels,
      maxModels: maxModels,
      systemOptions: systemOptions,
      primaryCommand: this.primaryCommand,
      separator: '='.repeat(40),
      timestamp: new Date().toLocaleString('zh-CN'),
      showContext: this.config.showContext !== false,
      showAuthStatus: this.config.showAuthStatus !== false
    };
  }

  /**
   * 准备切换结果数据
   */
  _prepareSwitchResultData(result, modelInfo) {
    const success = result.success;
    
    if (success) {
      return {
        success: true,
        separator: '='.repeat(30),
        emoji: modelInfo?.emoji || '✅',
        modelName: modelInfo?.displayName || result.modelId,
        description: modelInfo?.description || '模型切换完成',
        index: modelInfo?.index || '?',
        primaryCommand: this.primaryCommand,
        timestamp: new Date().toLocaleString('zh-CN'),
        hasBackup: !!result.backupFile,
        backupFile: result.backupFile
      };
    } else {
      const suggestions = this._getErrorSuggestions(result.error);
      
      return {
        success: false,
        separator: '='.repeat(30),
        errorMessage: result.error,
        suggestions: suggestions,
        primaryCommand: this.primaryCommand
      };
    }
  }

  /**
   * 准备错误数据
   */
  _prepareErrorData(error, context) {
    const errorType = this._getErrorType(error);
    const suggestedCommands = this._getSuggestedCommands(context);
    const correctionSuggestions = this._getCorrectionSuggestions(context);
    
    return {
      errorType: errorType,
      separator: '='.repeat(30),
      errorMessage: error.message || String(error),
      suggestedCommands: suggestedCommands.length > 0,
      commands: suggestedCommands,
      correctionSuggestions: correctionSuggestions.length > 0,
      suggestions: correctionSuggestions,
      primaryCommand: this.primaryCommand
    };
  }

  /**
   * 获取错误类型
   */
  _getErrorType(error) {
    if (error.message?.includes('无效') || error.message?.includes('invalid')) {
      return '参数错误';
    } else if (error.message?.includes('找不到') || error.message?.includes('not found')) {
      return '资源未找到';
    } else if (error.message?.includes('权限') || error.message?.includes('permission')) {
      return '权限不足';
    } else if (error.message?.includes('连接') || error.message?.includes('connection')) {
      return '连接错误';
    } else {
      return '系统错误';
    }
  }

  /**
   * 获取错误建议
   */
  _getErrorSuggestions(errorMessage) {
    const suggestions = [];
    
    if (errorMessage.includes('序号')) {
      suggestions.push('发送 "' + this.primaryCommand + '" 查看可用模型和序号');
      suggestions.push('确保序号在有效范围内');
    } else if (errorMessage.includes('认证') || errorMessage.includes('auth')) {
      suggestions.push('检查模型API密钥配置');
      suggestions.push('发送 "' + this.primaryCommand + ' status" 查看认证状态');
    } else if (errorMessage.includes('命令') || errorMessage.includes('command')) {
      suggestions.push('检查命令格式是否正确');
      suggestions.push('发送 "help" 查看使用说明');
    } else {
      suggestions.push('发送 "' + this.primaryCommand + '" 查看可用模型');
      suggestions.push('发送 "' + this.primaryCommand + ' status" 查看系统状态');
      suggestions.push('联系管理员获取帮助');
    }
    
    return suggestions;
  }

  /**
   * 获取建议命令
   */
  _getSuggestedCommands(context) {
    const commands = [`${this.primaryCommand} - 显示模型列表`];
    
    if (context.userInput) {
      const input = context.userInput.toLowerCase();
      if (!input.includes('status')) {
        commands.push(`${this.primaryCommand} status - 查看系统状态`);
      }
      if (!input.includes('refresh')) {
        commands.push(`${this.primaryCommand} refresh - 刷新缓存`);
      }
    }
    
    return commands;
  }

  /**
   * 获取纠正建议
   */
  _getCorrectionSuggestions(context) {
    if (!context.userInput) return [];
    
    const input = context.userInput.toLowerCase();
    const suggestions = [];
    
    // 常见拼写错误纠正
    const corrections = {
      'model': 'models',
      'modle': 'models',
      'modles': 'models',
      'staus': 'status',
      'statis': 'status',
      'refesh': 'refresh',
      'refreh': 'refresh'
    };
    
    for (const [wrong, correct] of Object.entries(corrections)) {
      if (input.includes(wrong)) {
        suggestions.push(`"${wrong}" → "${correct}"`);
      }
    }
    
    return suggestions;
  }

  /**
   * 加载模板文件
   */
  _loadTemplate(templateName) {
    const templatePath = this.templates[templateName] || 
                        path.join(__dirname, '../templates', templateName);
    
    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.warn(`无法加载模板 ${templateName}:`, error);
      return this._getDefaultTemplate(templateName);
    }
  }

  /**
   * 获取默认模板
   */
  _getDefaultTemplate(templateName) {
    const defaults = {
      'model_list.md': `模型列表 ({{total}}个)\n\n{{#models}}{{index}}. {{displayName}}\n{{/models}}`,
      'switch_result.md': `{{#success}}✅ 切换成功{{/success}}{{^success}}❌ 切换失败{{/success}}`,
      'error_message.md': `错误: {{errorMessage}}`
    };
    
    return defaults[templateName] || '{{errorMessage}}';
  }

  /**
   * 渲染模板
   */
  _renderTemplate(template, data) {
    let result = template;
    
    // 简单模板渲染
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object') continue;
      
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, value || '');
    }
    
    // 处理条件块
    result = this._processConditionalBlocks(result, data);
    
    // 处理列表
    result = this._processLists(result, data);
    
    return result;
  }

  /**
   * 处理条件块
   */
  _processConditionalBlocks(template, data) {
    // 处理 {{#condition}} ... {{/condition}}
    let result = template;
    const conditionalRegex = /\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/gs;
    
    let match;
    while ((match = conditionalRegex.exec(template)) !== null) {
      const [fullMatch, condition, content] = match;
      const shouldInclude = !!data[condition];
      result = result.replace(fullMatch, shouldInclude ? content : '');
    }
    
    // 处理 {{^condition}} ... {{/condition}}
    const negativeRegex = /\{\{\^(\w+)\}\}(.*?)\{\{\/\1\}\}/gs;
    
    while ((match = negativeRegex.exec(result)) !== null) {
      const [fullMatch, condition, content] = match;
      const shouldInclude = !data[condition];
      result = result.replace(fullMatch, shouldInclude ? content : '');
    }
    
    return result;
  }

  /**
   * 处理列表
   */
  _processLists(template, data) {
    let result = template;
    
    // 处理 {{#list}} ... {{/list}}
    const listRegex = /\{\{#(\w+)\}\}(.*?)\{\{\/\1\}\}/gs;
    
    let match;
    while ((match = listRegex.exec(template)) !== null) {
      const [fullMatch, listName, itemTemplate] = match;
      const list = data[listName];
      
      if (Array.isArray(list)) {
        const items = list.map(item => {
          let itemText = itemTemplate;
          for (const [key, value] of Object.entries(item)) {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            itemText = itemText.replace(placeholder, value || '');
          }
          return itemText;
        }).join('');
        
        result = result.replace(fullMatch, items);
      }
    }
    
    return result;
  }
}