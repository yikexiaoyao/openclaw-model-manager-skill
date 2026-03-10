import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

      // 执行切换命令
      const { stdout, stderr } = await execAsync(`openclaw models set ${modelId}`);
      
      if (stderr && !stderr.includes('Updated')) {
        throw new Error(`切换失败: ${stderr}`);
      }

      // 清除缓存
      this.cache = null;
      
      return {
        success: true,
        message: stdout.trim(),
        modelId
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
      if (!line) continue;

      const model = this._parseModelLine(line, i);
      if (model) {
        models.push(model);
      }
    }

    return models;
  }

  /**
   * 解析单行模型信息
   */
  _parseModelLine(line, index) {
    // 示例行: "custom-api-deepseek-com/deepseek-chat      text       125k     no    yes   default,configured"
    const parts = line.split(/\s+/).filter(p => p);
    
    if (parts.length < 6) return null;

    const modelId = parts[0];
    const context = parts[2];
    const auth = parts[4];
    const tags = parts.slice(5).join(' ');

    return {
      index: index,
      id: modelId,
      displayName: this._getDisplayName(modelId),
      isDefault: tags.includes('default'),
      isConfigured: tags.includes('configured'),
      context: context,
      authStatus: auth === 'yes' ? '✅' : auth === 'no' ? '⚠️' : '❌',
      tags: tags.split(','),
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