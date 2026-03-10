import { ModelScanner } from './ModelScanner.js';
import { ResponseFormatter } from './ResponseFormatter.js';

/**
 * 指令处理器 - 处理用户输入的命令
 */
export class CommandProcessor {
  constructor(config = {}) {
    this.config = config;
    this.scanner = new ModelScanner(config);
    this.formatter = new ResponseFormatter(config);
    
    // 命令映射
    this.commands = this._buildCommandMap();
  }

  /**
   * 处理用户输入
   */
  async process(input, context = {}) {
    try {
      // 解析输入
      const { command, args } = this._parseInput(input);
      
      // 记录上下文
      context.userInput = input;
      context.command = command;
      context.args = args;

      // 执行命令
      return await this._executeCommand(command, args, context);
    } catch (error) {
      // 处理错误
      return this.formatter.formatError(error, context);
    }
  }

  /**
   * 解析输入
   */
  _parseInput(input) {
    if (!input || typeof input !== 'string') {
      throw new Error('输入不能为空');
    }

    const trimmed = input.trim();
    const parts = trimmed.split(/\s+/);
    
    if (parts.length === 0) {
      throw new Error('请输入有效命令');
    }

    // 获取主命令
    const rawCommand = parts[0].toLowerCase();
    const command = this._normalizeCommand(rawCommand);
    
    if (!command) {
      throw new Error(`未知命令: ${rawCommand}`);
    }

    // 获取参数
    const args = parts.slice(1);

    return { command, args };
  }

  /**
   * 标准化命令
   */
  _normalizeCommand(rawCommand) {
    // 检查主命令
    if (this.commands.primary.includes(rawCommand)) {
      return 'models';
    }

    // 检查别名
    for (const [mainCmd, aliases] of Object.entries(this.commands.aliases)) {
      if (aliases.includes(rawCommand)) {
        return mainCmd;
      }
    }

    return null;
  }

  /**
   * 执行命令
   */
  async _executeCommand(command, args, context) {
    switch (command) {
      case 'models':
        return await this._handleModelsCommand(args, context);
      default:
        throw new Error(`未实现的命令: ${command}`);
    }
  }

  /**
   * 处理models命令
   */
  async _handleModelsCommand(args, context) {
    if (args.length === 0) {
      // models - 显示列表
      return await this._showModelList(context);
    }

    const subcommand = args[0].toLowerCase();
    
    if (subcommand === 'status') {
      // models status - 显示详细状态
      return await this._showDetailedStatus(context);
    } else if (subcommand === 'refresh') {
      // models refresh - 刷新缓存
      return await this._refreshCache(context);
    } else if (subcommand === 'scan') {
      // models scan - 扫描所有模型
      return await this._scanAllModels(context);
    } else if (subcommand === 'help') {
      // models help - 显示帮助
      return this.getHelp('models');
    } else if (!isNaN(subcommand)) {
      // models <序号> - 切换模型
      const index = parseInt(subcommand);
      return await this._switchModelByIndex(index, context);
    } else {
      // 未知子命令，显示帮助
      return `❓ 未知子命令: ${subcommand}\n\n` +
             this._getCommandSpecificHelp(subcommand, 'models');
    }
  }

  /**
   * 显示模型列表
   */
  async _showModelList(context) {
    const models = await this.scanner.getConfiguredModels();
    
    // 准备选项
    const options = {
      forceDetailed: context.forceDetailed || false
    };

    return this.formatter.formatModelList(models, options);
  }

  /**
   * 显示详细状态
   */
  async _showDetailedStatus(context) {
    try {
      const status = await this.scanner.getDetailedStatus();
      return `📊 详细系统状态\n${'='.repeat(40)}\n${status}\n\n💡 发送 "${this.config.commands?.primary || 'models'}" 返回模型列表`;
    } catch (error) {
      throw new Error(`无法获取系统状态: ${error.message}`);
    }
  }

  /**
   * 刷新缓存
   */
  async _refreshCache(context) {
    const models = await this.scanner.refreshCache();
    
    return `🔄 缓存已刷新\n${'='.repeat(30)}\n• 更新了 ${models.length} 个模型\n• 缓存时间: ${new Date().toLocaleString('zh-CN')}\n\n💡 发送 "${this.config.commands?.primary || 'models'}" 查看最新列表`;
  }

  /**
   * 扫描所有模型
   */
  async _scanAllModels(context) {
    // 这里可以扩展为扫描所有可用模型（不仅仅是已配置的）
    const models = await this.scanner.getConfiguredModels(true);
    
    return `🔍 模型扫描完成\n${'='.repeat(30)}\n• 发现 ${models.length} 个已配置模型\n• 扫描时间: ${new Date().toLocaleString('zh-CN')}\n\n💡 发送 "${this.config.commands?.primary || 'models'}" 查看列表`;
  }

  /**
   * 按序号切换模型
   */
  async _switchModelByIndex(index, context) {
    // 获取模型列表
    const models = await this.scanner.getConfiguredModels();
    
    // 检查序号有效性
    if (index < 1 || index > models.length) {
      throw new Error(`序号 ${index} 无效。可用序号: 1-${models.length}`);
    }

    const targetModel = models[index - 1];
    
    // 检查是否需要确认
    if (this.config.behavior?.confirmSwitch) {
      // 这里可以添加确认逻辑
      // 暂时直接切换
    }

    // 执行切换
    const result = await this.scanner.switchByIndex(index, models);
    
    // 准备模型信息
    const modelInfo = {
      index: index,
      displayName: targetModel.displayName,
      emoji: targetModel.emoji,
      description: this._getModelDescription(targetModel)
    };

    return this.formatter.formatSwitchResult(result, modelInfo);
  }

  /**
   * 获取模型描述
   */
  _getModelDescription(model) {
    const descriptions = {
      'DeepSeek V3.2': '性能顶尖，中文专精，128k上下文',
      '通义千问80B': '完全免费，256k超大上下文，中文优化优秀',
      'Llama 3.3 70B': '免费，英文优秀，70B参数规模',
      'Step 3.5 Flash': '免费，快速响应，通用任务'
    };

    return descriptions[model.displayName] || `${model.context}上下文，${model.isDefault ? '主用' : '备用'}模型`;
  }

  /**
   * 构建命令映射
   */
  _buildCommandMap() {
    const config = this.config.commands || {};
    
    return {
      primary: [config.primary || 'models', ...(config.aliases || [])],
      aliases: {
        'models': config.aliases || [],
        'status': config.subcommands?.status || [],
        'refresh': config.subcommands?.refresh || [],
        'scan': config.subcommands?.scan || []
      }
    };
  }

  /**
   * 获取帮助信息
   */
  getHelp(command = null) {
    const primary = this.config.commands?.primary || 'models';
    const aliases = this.config.commands?.aliases || [];
    const subcommands = this.config.commands?.subcommands || {};
    
    if (command === 'models' || !command) {
      return this._getModelsHelp(primary, aliases, subcommands);
    } else if (command === 'monitor') {
      return this._getMonitorHelp();
    } else if (command === 'help') {
      return this._getGeneralHelp(primary, aliases);
    } else {
      return this._getCommandSpecificHelp(command, primary);
    }
  }
  
  /**
   * 获取models命令帮助
   */
  _getModelsHelp(primary, aliases, subcommands) {
    const aliasText = aliases.length > 0 ? ` (别名: ${aliases.join(', ')})` : '';
    
    return `🤖 models命令 - 模型管理\n${'='.repeat(40)}\n\n` +
           `命令: ${primary}${aliasText}\n\n` +
           `📋 基本用法:\n` +
           `• ${primary} - 显示所有已配置模型列表\n` +
           `• ${primary} <序号> - 切换到指定序号的模型\n\n` +
           `🔧 子命令:\n` +
           `• ${primary} status - 查看详细系统状态${subcommands.status ? ` (${subcommands.status.join(', ')})` : ''}\n` +
           `• ${primary} refresh - 刷新模型缓存${subcommands.refresh ? ` (${subcommands.refresh.join(', ')})` : ''}\n` +
           `• ${primary} scan - 扫描所有可用模型${subcommands.scan ? ` (${subcommands.scan.join(', ')})` : ''}\n\n` +
           `🎯 示例:\n` +
           `• "${primary}" - 显示模型列表，选择序号切换\n` +
           `• "${primary} 1" - 切换到第一个模型\n` +
           `• "${primary} status" - 查看OpenClaw模型配置状态\n` +
           `• "${primary} refresh" - 强制刷新模型缓存\n\n` +
           `💡 特性:\n` +
           `• 自动扫描OpenClaw配置的所有模型\n` +
           `• 动态序号，模型增减自动调整\n` +
           `• 5分钟缓存提高性能\n` +
           `• 切换前自动备份配置\n` +
           `• 详细的错误提示和建议\n`;
  }
  
  /**
   * 获取monitor命令帮助
   */
  _getMonitorHelp() {
    return `🔍 monitor命令 - 模型健康监控\n${'='.repeat(40)}\n\n` +
           `命令: monitor\n\n` +
           `📋 监控功能:\n` +
           `• 定期检查主用模型可用性\n` +
           `• 自动故障检测和切换\n` +
           `• 发送切换通知\n` +
           `• 自动/手动恢复\n\n` +
           `🔧 子命令:\n` +
           `• monitor start - 启动模型健康监控\n` +
           `• monitor stop - 停止监控\n` +
           `• monitor status - 查看监控状态\n` +
           `• monitor check - 手动执行健康检查\n` +
           `• monitor recover - 手动切换回主用模型\n` +
           `• monitor help - 显示此帮助\n\n` +
           `🎯 示例:\n` +
           `• "monitor start" - 启动监控（默认5分钟检查一次）\n` +
           `• "monitor status" - 查看当前监控状态\n` +
           `• "monitor check" - 立即执行一次健康检查\n` +
           `• "monitor recover" - 手动切换回主用模型\n\n` +
           `⚙️ 配置参数 (config.json):\n` +
           `• checkInterval: 检查间隔（秒，默认300）\n` +
           `• failureThreshold: 连续失败阈值（默认3）\n` +
           `• autoRecover: 是否自动恢复（默认true）\n` +
           `• notifications: 通知配置\n\n` +
           `💡 工作流程:\n` +
           `1. 主用模型连续3次检查失败 → 判定故障\n` +
           `2. 自动切换到第一个备用模型\n` +
           `3. 发送Telegram切换通知\n` +
           `4. 主用模型恢复后自动切换回来\n`;
  }
  
  /**
   * 获取通用帮助
   */
  _getGeneralHelp(primary, aliases) {
    const allCommands = [primary, ...aliases, 'monitor', 'help'];
    
    return `🤖 模型管理技能 - 完整帮助\n${'='.repeat(40)}\n\n` +
           `📚 可用命令:\n` +
           `• ${primary} - 模型管理（扫描、列表、切换）\n` +
           `• monitor - 模型健康监控（故障检测、自动切换）\n` +
           `• help - 显示帮助信息\n\n` +
           `🔍 详细帮助:\n` +
           `• "${primary} help" - 查看models命令详细帮助\n` +
           `• "monitor help" - 查看monitor命令详细帮助\n` +
           `• "help" - 显示此通用帮助\n\n` +
           `🎯 快速开始:\n` +
           `1. 发送 "${primary}" 查看模型列表\n` +
           `2. 发送 "${primary} 1" 切换到第一个模型\n` +
           `3. 发送 "monitor start" 启动健康监控\n` +
           `4. 发送 "${primary} status" 查看系统状态\n\n` +
           `💡 技能特性:\n` +
           `• 通用性: 适配任何OpenClaw配置\n` +
           `• 可配置: 所有行为通过config.json调整\n` +
           `• 可扩展: 模块化设计，易于添加新功能\n` +
           `• 安全性: 切换前自动备份，完整错误处理\n`;
  }
  
  /**
   * 获取特定命令帮助
   */
  _getCommandSpecificHelp(command, primary) {
    const helpMap = {
      'status': `📊 ${primary} status - 系统状态\n` +
                `查看OpenClaw模型配置的详细状态，包括:\n` +
                `• 当前主用模型和备用模型\n` +
                `• 模型认证状态\n` +
                `• 配置文件和路径\n` +
                `• API密钥状态\n\n` +
                `示例: "${primary} status"`,
      
      'refresh': `🔄 ${primary} refresh - 刷新缓存\n` +
                 `强制刷新模型缓存，立即重新扫描OpenClaw配置。\n` +
                 `当手动修改了OpenClaw配置后使用此命令。\n\n` +
                 `示例: "${primary} refresh"`,
      
      'scan': `🔍 ${primary} scan - 扫描模型\n` +
              `扫描所有可用的模型（不仅仅是已配置的）。\n` +
              `显示系统发现的所有模型，包括未配置的。\n\n` +
              `示例: "${primary} scan"`,
      
      'start': `🚀 monitor start - 启动监控\n` +
               `启动模型健康监控系统。\n` +
               `默认每5分钟检查一次主用模型可用性。\n\n` +
               `示例: "monitor start"`,
      
      'stop': `🛑 monitor stop - 停止监控\n` +
              `停止模型健康监控系统。\n` +
              `停止所有定期检查和自动切换功能。\n\n` +
              `示例: "monitor stop"`,
      
      'check': `🔍 monitor check - 手动检查\n` +
               `立即执行一次模型健康检查。\n` +
               `不等待定时器，立即测试主用模型可用性。\n\n` +
               `示例: "monitor check"`,
      
      'recover': `🔄 monitor recover - 手动恢复\n` +
                 `手动切换回主用模型。\n` +
                 `当系统处于备用模型时，强制切换回主用模型。\n\n` +
                 `示例: "monitor recover"`
    };
    
    if (helpMap[command]) {
      return helpMap[command];
    } else {
      return `❓ 未知命令: ${command}\n\n` +
             `💡 可用帮助:\n` +
             `• "${primary} help" - 查看models命令帮助\n` +
             `• "monitor help" - 查看monitor命令帮助\n` +
             `• "help" - 查看通用帮助`;
    }
  }
}