import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

// 同步读取配置
const readFileSync = fs.readFileSync;
const writeFileSync = fs.writeFileSync;

/**
 * 模型扫描器 - 扫描OpenClaw配置的模型
 */
export class ModelScanner {
  constructor(config = {}) {
    this.config = config;
    this.cache = null;
    this.cacheTimestamp = null;
    this.cacheDuration = config.cacheDuration || 300; // 默认5分钟
  }

  /**
   * 获取已配置的模型列表
   */
  async getConfiguredModels(forceRefresh = false) {
    // 检查缓存
    if (!forceRefresh && this._isCacheValid()) {
      return this.cache;
    }

    try {
      // 执行 openclaw models list 命令
      const { stdout, stderr } = await execAsync('openclaw models list');
      
      if (stderr && !stderr.includes('warning')) {
        throw new Error(`命令执行错误: ${stderr}`);
      }

      // 解析输出
      const models = this._parseModelsOutput(stdout);
      
      // 更新缓存
      this.cache = models;
      this.cacheTimestamp = Date.now();
      
      return models;
    } catch (error) {
      console.error('扫描模型失败:', error);
      throw new Error(`无法获取模型列表: ${error.message}`);
    }
  }

  /**
   * 获取详细状态
   */
  async getDetailedStatus() {
    try {
      const { stdout } = await execAsync('openclaw models status');
      return stdout;
    } catch (error) {
      throw new Error(`无法获取系统状态: ${error.message}`);
    }
  }

  /**
   * 切换到指定模型
   */
  async switchToModel(modelId, backup = true) {
    try {
      // 创建备份
      if (backup) {
        await this._createBackup();
      }

      // 直接修改配置文件
      const configPath = '/root/.openclaw/openclaw.json';
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      // 验证模型是否存在
      if (!config.agents?.defaults?.models?.[modelId]) {
        throw new Error(`模型不存在: ${modelId}`);
      }
      
      // 修改主用模型
      config.agents.defaults.model.primary = modelId;
      
      // 写入配置
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // 清除缓存
      this.cache = null;
      
      return {
        success: true,
        message: `已切换到 ${modelId}`,
        modelId,
        needsRestart: true,
        restartCommand: 'openclaw gateway restart'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        modelId
      };
    }
  }

  /**
   * 按序号切换模型
   */
  async switchByIndex(index, models = null) {
    if (!models) {
      models = await this.getConfiguredModels();
    }

    if (index < 1 || index > models.length) {
      throw new Error(`序号 ${index} 无效。可用序号: 1-${models.length}`);
    }

    const targetModel = models[index - 1];
    return await this.switchToModel(targetModel.id);
  }

  /**
   * 刷新缓存
   */
  async refreshCache() {
    this.cache = null;
    this.cacheTimestamp = null;
    return await this.getConfiguredModels(true);
  }

  /**
   * 解析模型列表输出
   */
  _parseModelsOutput(output) {
    const lines = output.trim().split('\n');
    const models = [];
    
    // 跳过表头
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('Model')) continue;

      const model = this._parseModelLine(line, i);
      if (model) {
        models.push(model);
      }
    }

    // 从配置文件读取 fallback 信息
    this._enrichWithFallbackInfo(models);
    
    return models;
  }
  
  /**
   * 从配置文件读取 fallback 信息
   */
  async _enrichWithFallbackInfo(models) {
    try {
      const configPath = '/root/.openclaw/openclaw.json';
      const configData = await fs.promises.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      const fallbacks = config.agents?.defaults?.model?.fallbacks || [];
      
      models.forEach(m => {
        m.isFallback = fallbacks.includes(m.id);
      });
    } catch (error) {
      console.warn('读取 fallback 配置失败:', error.message);
    }
  }
  
  /**
   * 从配置文件解析模型
   */
  _parseConfigModels(config) {
    const models = [];
    const providers = config.models?.providers || {};
    const defaults = config.agents?.defaults || {};
    const primaryModel = defaults.model?.primary || '';
    const fallbackModels = defaults.model?.fallbacks || [];
    
    let index = 1;
    
    // 遍历所有提供商
    for (const [providerName, provider] of Object.entries(providers)) {
      const providerModels = provider.models || [];
      
      for (const model of providerModels) {
        const modelId = `${providerName}/${model.id}`;
        const isPrimary = modelId === primaryModel;
        const isFallback = fallbackModels.includes(modelId);
        
        models.push({
          index: index++,
          id: modelId,
          displayName: model.name || this._getDisplayName(modelId),
          provider: providerName,
          isDefault: isPrimary,
          isFallback: isFallback,
          isConfigured: true,
          context: this._formatContext(model.contextWindow),
          maxTokens: model.maxTokens,
          authStatus: provider.apiKey ? '✅' : '⚠️',
          emoji: this._getEmojiForModel(modelId),
          cost: model.cost
        });
      }
    }
    
    // 按主用、fallback、其他排序
    models.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      if (a.isFallback && !b.isFallback) return -1;
      if (!a.isFallback && b.isFallback) return 1;
      return 0;
    });
    
    // 重新编号
    models.forEach((m, i) => m.index = i + 1);
    
    return models;
  }
  
  /**
   * 格式化上下文窗口显示
   */
  _formatContext(contextWindow) {
    if (!contextWindow) return 'unknown';
    if (contextWindow >= 1000000) return `${(contextWindow / 1000000).toFixed(0)}M`;
    if (contextWindow >= 1000) return `${(contextWindow / 1000).toFixed(0)}k`;
    return contextWindow.toString();
  }

  /**
   * 解析单行模型信息
   */
  _parseModelLine(line, index) {
    // 示例行: "bailian/qwen3.5-plus                       text+image 977k     no    yes   default,configured"
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('Model')) return null;
    
    // 使用正则表达式匹配各列
    // 格式: Model Input Ctx Local Auth Tags
    const match = trimmedLine.match(/^([^\s]+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/);
    
    if (!match) {
      // 尝试简单分割
      const parts = trimmedLine.split(/\s+/).filter(p => p);
      if (parts.length < 6) return null;
      
      return this._createModelObject(index, parts[0], parts[1], parts[2], parts[4], parts.slice(5).join(' '));
    }
    
    const [, modelId, input, context, local, auth, tags] = match;
    
    return this._createModelObject(index, modelId, input, context, auth, tags.trim());
  }
  
  /**
   * 创建模型对象
   */
  _createModelObject(index, modelId, input, context, auth, tags) {
    const isDefault = tags.includes('default');
    const isConfigured = tags.includes('configured');
    
    return {
      index: index,
      id: modelId,
      displayName: this._getDisplayName(modelId),
      input: input,
      isDefault: isDefault,
      isConfigured: isConfigured,
      isFallback: false, // 需要从配置文件读取
      context: context,
      authStatus: auth === 'yes' ? '✅' : auth === 'no' ? '⚠️' : '❌',
      tags: tags.split(',').filter(t => t),
      emoji: this._getEmojiForModel(modelId)
    };
  }

  /**
   * 获取模型显示名称
   */
  _getDisplayName(modelId) {
    const nameMap = {
      'deepseek-chat': 'DeepSeek V3.2',
      'qwen/qwen3-next-80b-a3b-instruct:free': '通义千问80B',
      'meta-llama/llama-3.3-70b-instruct:free': 'Llama 3.3 70B',
      'stepfun/step-3.5-flash:free': 'Step 3.5 Flash'
    };

    for (const [key, name] of Object.entries(nameMap)) {
      if (modelId.includes(key)) {
        return name;
      }
    }

    // 提取最后一部分作为名称
    const parts = modelId.split('/');
    return parts[parts.length - 1];
  }

  /**
   * 获取模型图标
   */
  _getEmojiForModel(modelId) {
    if (modelId.includes('deepseek')) return '🚀';
    if (modelId.includes('qwen')) return '🆓';
    if (modelId.includes('free')) return '🎁';
    if (modelId.includes('llama')) return '🦙';
    if (modelId.includes('gpt')) return '⚡';
    return '🤖';
  }

  /**
   * 检查缓存是否有效
   */
  _isCacheValid() {
    if (!this.cache || !this.cacheTimestamp) return false;
    
    const age = Date.now() - this.cacheTimestamp;
    return age < (this.cacheDuration * 1000);
  }

  /**
   * 创建配置备份
   */
  async _createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = './backups';
    const backupFile = `${backupDir}/config_backup_${timestamp}.json`;
    
    try {
      await execAsync(`mkdir -p ${backupDir}`);
      await execAsync(`cp ~/.openclaw/openclaw.json ${backupFile}`);
      return backupFile;
    } catch (error) {
      console.warn('创建备份失败:', error);
      return null;
    }
  }
}