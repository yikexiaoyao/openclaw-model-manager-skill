import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CommandProcessor } from './src/CommandProcessor.js';
import { ModelHealthMonitor } from './src/ModelHealthMonitor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Model Manager Skill - 主入口文件
 * 
 * 这是一个通用的模型管理技能，提供:
 * 1. 扫描显示已配置模型列表
 * 2. 按序号切换模型
 * 3. 查看系统状态
 * 4. 缓存管理
 */
export default {
  name: 'model-manager',
  version: '1.0.0',
  
  /**
   * 技能初始化
   */
  async setup(context) {
    console.log('🚀 初始化模型管理技能...');
    
    // 加载配置
    const config = await this._loadConfig();
    
    // 创建处理器
    this.processor = new CommandProcessor(config);
    
    // 创建健康监控器
    this.healthMonitor = new ModelHealthMonitor(
      config.monitoring || {},
      this.processor.scanner,
      context
    );
    
    // 注册消息处理器
    context.on('message', async (message) => {
      await this._handleMessage(message, context);
    });
    
    // 注册工具
    context.registerTool('model_scanner', {
      description: '扫描和获取模型信息',
      execute: async () => {
        return await this.processor.scanner.getConfiguredModels();
      }
    });
    
    context.registerTool('model_switcher', {
      description: '切换模型',
      execute: async (params) => {
        if (params.index) {
          return await this.processor.scanner.switchByIndex(params.index);
        } else if (params.modelId) {
          return await this.processor.scanner.switchToModel(params.modelId);
        }
        throw new Error('需要提供 index 或 modelId 参数');
      }
    });
    
    context.registerTool('model_monitor', {
      description: '模型健康监控',
      execute: async (params) => {
        const action = params.action || 'status';
        
        switch (action) {
          case 'start':
            await this.healthMonitor.startMonitoring();
            return { success: true, message: '监控已启动' };
            
          case 'stop':
            this.healthMonitor.stopMonitoring();
            return { success: true, message: '监控已停止' };
            
          case 'status':
            return this.healthMonitor.getStatus();
            
          case 'check':
            return await this.healthMonitor.manualCheck();
            
          case 'recover':
            return await this.healthMonitor.switchBackToPrimary();
            
          default:
            throw new Error(`未知监控动作: ${action}`);
        }
      }
    });
    
    // 启动监控（如果配置启用）
    if (config.monitoring?.enabled) {
      console.log('🔍 启动模型健康监控...');
      setTimeout(() => {
        this.healthMonitor.startMonitoring().catch(error => {
          console.error('启动监控失败:', error);
        });
      }, 5000); // 延迟5秒启动，让系统完全初始化
    }
    
    console.log('✅ 模型管理技能初始化完成');
  },
  
  /**
   * 处理消息
   */
  async _handleMessage(message, context) {
    try {
      const text = message.text?.trim();
      if (!text) return;
      
      // 检查是否是本技能的命令
      if (this._isModelsCommand(text)) {
        console.log(`📨 处理命令: ${text}`);
        
        // 处理命令
        const response = await this.processor.process(text, {
          userId: message.from?.id,
          username: message.from?.username,
          chatId: message.chat?.id
        });
        
        // 发送响应
        if (response) {
          await context.reply(response, {
            replyTo: message.message_id,
            parseMode: 'Markdown'
          });
        }
      }
      
      // 处理帮助请求
      if (text.toLowerCase() === 'help' || text === '帮助') {
        const helpText = this.processor.getHelp('help');
        await context.reply(helpText, {
          replyTo: message.message_id,
          parseMode: 'Markdown'
        });
      }
      
      // 处理models help命令
      else if (text.toLowerCase().startsWith('models help') || 
               text.toLowerCase().startsWith('model help') ||
               text.toLowerCase().startsWith('ml help') ||
               text.toLowerCase().startsWith('模型 help')) {
        const helpText = this.processor.getHelp('models');
        await context.reply(helpText, {
          replyTo: message.message_id,
          parseMode: 'Markdown'
        });
      }
      
      // 处理monitor help命令
      else if (text.toLowerCase().startsWith('monitor help')) {
        const helpText = this.processor.getHelp('monitor');
        await context.reply(helpText, {
          replyTo: message.message_id,
          parseMode: 'Markdown'
        });
      }
      
      // 处理特定命令帮助
      else if (text.toLowerCase().endsWith(' help')) {
        const command = text.toLowerCase().replace(' help', '').trim();
        const helpText = this.processor.getHelp(command);
        await context.reply(helpText, {
          replyTo: message.message_id,
          parseMode: 'Markdown'
        });
      }
      
      // 处理监控命令
      else if (text.toLowerCase().startsWith('monitor')) {
        await this._handleMonitorCommand(text, message, context);
      }
    } catch (error) {
      console.error('处理消息时出错:', error);
      
      // 发送错误响应
      try {
        const errorResponse = `❌ 处理命令时出错\n\n错误信息: ${error.message}\n\n💡 发送 "help" 查看使用说明`;
        await context.reply(errorResponse, {
          replyTo: message.message_id
        });
      } catch (replyError) {
        console.error('发送错误响应时出错:', replyError);
      }
    }
  },
  
  /**
   * 检查是否是models命令
   */
  _isModelsCommand(text) {
    const normalized = text.toLowerCase().trim();
    
    // 获取配置的命令和别名
    const config = this.processor?.config || {};
    const primary = config.commands?.primary || 'models';
    const aliases = config.commands?.aliases || [];
    
    // 检查所有可能的命令
    const allCommands = [primary, ...aliases];
    
    // 检查是否以任何命令开头
    for (const cmd of allCommands) {
      if (normalized.startsWith(cmd.toLowerCase())) {
        return true;
      }
    }
    
    return false;
  },
  
  /**
   * 加载配置
   */
  async _loadConfig() {
    try {
      const configPath = path.join(__dirname, 'config.json');
      const configData = await fs.promises.readFile(configPath, 'utf-8');
      return JSON.parse(configData);
    } catch (error) {
      console.warn('无法加载配置文件，使用默认配置:', error);
      return this._getDefaultConfig();
    }
  },
  
  /**
   * 获取默认配置
   */
  _getDefaultConfig() {
    return {
      skill: {
        name: 'model-manager',
        version: '1.0.0',
        description: '通用模型管理技能'
      },
      commands: {
        primary: 'models',
        aliases: ['model', 'ml', '模型'],
        subcommands: {
          status: ['状态', 'st'],
          refresh: ['刷新', 'rf'],
          scan: ['扫描', 'sc']
        }
      },
      display: {
        showEmojis: true,
        showContext: true,
        showAuthStatus: true,
        maxModelsPerPage: 10,
        cacheDuration: 300
      },
      behavior: {
        autoRefresh: true,
        confirmSwitch: false,
        logSwitches: true,
        backupBeforeSwitch: true,
        enableCache: true
      }
    };
  },
  
  /**
   * 处理监控命令
   */
  async _handleMonitorCommand(text, message, context) {
    const parts = text.toLowerCase().split(/\s+/);
    const action = parts[1] || 'status';
    
    let response;
    
    switch (action) {
      case 'start':
        await this.healthMonitor.startMonitoring();
        response = '✅ 模型健康监控已启动\n每5分钟检查一次模型可用性';
        break;
        
      case 'stop':
        this.healthMonitor.stopMonitoring();
        response = '🛑 模型健康监控已停止';
        break;
        
      case 'status':
        const status = this.healthMonitor.getStatus();
        response = this._formatMonitorStatus(status);
        break;
        
      case 'check':
        const checkResult = await this.healthMonitor.manualCheck();
        response = this._formatMonitorStatus(checkResult);
        break;
        
      case 'recover':
        const recoverResult = await this.healthMonitor.switchBackToPrimary();
        if (recoverResult.success) {
          response = '✅ 已手动切换回主用模型';
        } else {
          response = `❌ 切换失败: ${recoverResult.error}`;
        }
        break;
        
      case 'help':
        response = this.processor.getHelp('monitor');
        break;
        
      default:
        response = `❌ 未知监控命令: ${action}\n\n` +
                   this.processor.getHelp('monitor');
    }
    
    await context.reply(response, {
      replyTo: message.message_id,
      parseMode: 'Markdown'
    });
  },
  
  /**
   * 格式化监控状态
   */
  _formatMonitorStatus(status) {
    const formatTime = (date) => date ? new Date(date).toLocaleString('zh-CN') : '从未';
    const formatBoolean = (value) => value ? '✅' : '❌';
    
    return `📊 模型健康监控状态\n` +
           `====================\n` +
           `• 监控状态: ${formatBoolean(status.monitoring)}\n` +
           `• 主用模型健康: ${formatBoolean(status.isPrimaryHealthy)}\n` +
           `• 主用模型: ${status.primaryModel?.displayName || '未知'}\n` +
           `• 备用模型: ${status.backupModel?.displayName || '无'}\n` +
           `• 连续失败次数: ${status.consecutiveFailures}/${status.failureThreshold}\n` +
           `• 切换次数: ${status.switchCount}\n` +
           `• 最后切换: ${formatTime(status.lastSwitchTime)}\n` +
           `• 最后检查: ${formatTime(status.lastCheckTime)}\n` +
           `• 下次检查: ${formatTime(status.nextCheckIn)}\n` +
           `• 检查间隔: ${status.checkInterval}秒\n\n` +
           `💡 使用 "monitor help" 查看监控命令`;
  },
  
  /**
   * 获取监控帮助
   */
  _getMonitorHelp() {
    return `🔍 模型健康监控命令\n` +
           `====================\n` +
           `• monitor start - 启动监控\n` +
           `• monitor stop - 停止监控\n` +
           `• monitor status - 查看状态\n` +
           `• monitor check - 手动检查\n` +
           `• monitor recover - 手动恢复主用模型\n` +
           `• monitor help - 显示此帮助\n\n` +
           `📊 监控功能:\n` +
           `• 自动检测主用模型故障\n` +
           `• 自动切换到备用模型\n` +
           `• 发送切换通知\n` +
           `• 自动/手动恢复\n\n` +
           `⚙️ 配置: config.json 的 monitoring 部分`;
  },
  
  /**
   * 技能清理
   */
  async teardown() {
    console.log('🛑 清理模型管理技能...');
    
    // 停止监控
    if (this.healthMonitor) {
      this.healthMonitor.stopMonitoring();
    }
    
    // 清理资源
    this.processor = null;
    this.healthMonitor = null;
  }
};