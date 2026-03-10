import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 模型健康监控器 - 检测模型可用性，自动切换
 */
export class ModelHealthMonitor {
  constructor(config = {}, scanner = null, context = null) {
    this.config = config;
    this.scanner = scanner;
    this.context = context;
    
    // 监控状态
    this.monitoring = false;
    this.intervalId = null;
    this.checkInterval = config.checkInterval || 300; // 默认5分钟
    this.failureThreshold = config.failureThreshold || 3; // 连续失败次数阈值
    
    // 状态记录
    this.currentStatus = {
      primaryModel: null,
      backupModel: null,
      isPrimaryHealthy: true,
      consecutiveFailures: 0,
      lastSwitchTime: null,
      lastCheckTime: null,
      switchCount: 0
    };
    
    // 通知配置
    this.notificationConfig = {
      enableNotifications: true,
      notifyOnSwitch: true,
      notifyOnRecovery: true,
      notifyOnFailure: false
    };
  }

  /**
   * 开始监控
   */
  async startMonitoring() {
    if (this.monitoring) {
      console.log('⚠️ 监控已在运行中');
      return;
    }

    console.log('🚀 开始模型健康监控...');
    
    // 获取当前模型信息
    await this._updateModelInfo();
    
    // 设置定时检查
    this.monitoring = true;
    this.intervalId = setInterval(() => {
      this._performHealthCheck();
    }, this.checkInterval * 1000);
    
    // 立即执行一次检查
    await this._performHealthCheck();
    
    console.log(`✅ 监控已启动，检查间隔: ${this.checkInterval}秒`);
  }

  /**
   * 停止监控
   */
  stopMonitoring() {
    if (!this.monitoring) {
      return;
    }
    
    console.log('🛑 停止模型健康监控...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.monitoring = false;
    console.log('✅ 监控已停止');
  }

  /**
   * 执行健康检查
   */
  async _performHealthCheck() {
    try {
      console.log(`🔍 执行模型健康检查 (${new Date().toLocaleString('zh-CN')})`);
      
      // 更新模型信息
      await this._updateModelInfo();
      
      // 检查主用模型健康状态
      const isHealthy = await this._checkPrimaryModelHealth();
      
      // 更新状态
      this.currentStatus.lastCheckTime = new Date();
      
      if (isHealthy) {
        // 主用模型健康
        this.currentStatus.consecutiveFailures = 0;
        
        // 检查是否需要恢复
        if (!this.currentStatus.isPrimaryHealthy) {
          await this._handleRecovery();
        }
        
        this.currentStatus.isPrimaryHealthy = true;
        console.log('✅ 主用模型健康');
      } else {
        // 主用模型不健康
        this.currentStatus.consecutiveFailures++;
        console.log(`❌ 主用模型检查失败 (连续: ${this.currentStatus.consecutiveFailures}/${this.failureThreshold})`);
        
        // 检查是否达到切换阈值
        if (this.currentStatus.consecutiveFailures >= this.failureThreshold) {
          await this._handlePrimaryFailure();
        }
      }
      
    } catch (error) {
      console.error('健康检查执行失败:', error);
    }
  }

  /**
   * 检查主用模型健康状态
   */
  async _checkPrimaryModelHealth() {
    if (!this.currentStatus.primaryModel) {
      console.warn('⚠️ 未找到主用模型');
      return false;
    }

    try {
      // 方法1: 使用openclaw chat测试（简单测试）
      const testCommand = `openclaw chat --model ${this.currentStatus.primaryModel.id} --prompt "test" --max-tokens 1 --timeout 10`;
      
      const { stdout, stderr } = await execAsync(testCommand, { timeout: 15000 });
      
      // 检查响应
      if (stderr && stderr.includes('error') && !stderr.includes('warning')) {
        console.log(`❌ 模型测试失败: ${stderr.substring(0, 100)}`);
        return false;
      }
      
      // 如果有响应，认为模型健康
      return true;
      
    } catch (error) {
      console.log(`❌ 模型测试异常: ${error.message}`);
      return false;
    }
  }

  /**
   * 处理主用模型故障
   */
  async _handlePrimaryFailure() {
    if (!this.currentStatus.isPrimaryHealthy) {
      console.log('⚠️ 主用模型已处于故障状态，无需重复切换');
      return;
    }

    console.log('🚨 检测到主用模型故障，准备切换到备用模型...');
    
    // 检查是否有备用模型
    if (!this.currentStatus.backupModel) {
      console.error('❌ 没有可用的备用模型');
      await this._sendNotification('🚨 主用模型故障，但无备用模型可用！');
      return;
    }

    try {
      // 切换到备用模型
      console.log(`🔄 切换到备用模型: ${this.currentStatus.backupModel.displayName}`);
      
      const switchResult = await this.scanner.switchToModel(this.currentStatus.backupModel.id);
      
      if (switchResult.success) {
        // 更新状态
        this.currentStatus.isPrimaryHealthy = false;
        this.currentStatus.lastSwitchTime = new Date();
        this.currentStatus.switchCount++;
        
        console.log(`✅ 已切换到备用模型: ${this.currentStatus.backupModel.displayName}`);
        
        // 发送通知
        await this._sendSwitchNotification();
        
      } else {
        console.error(`❌ 切换到备用模型失败: ${switchResult.error}`);
        await this._sendNotification(`❌ 切换到备用模型失败: ${switchResult.error}`);
      }
      
    } catch (error) {
      console.error('切换备用模型时出错:', error);
      await this._sendNotification(`❌ 切换备用模型时出错: ${error.message}`);
    }
  }

  /**
   * 处理主用模型恢复
   */
  async _handleRecovery() {
    console.log('🔄 主用模型已恢复，准备切换回主用模型...');
    
    // 检查是否需要自动恢复
    const autoRecover = this.config.autoRecover !== false;
    
    if (autoRecover) {
      try {
        console.log(`🔄 自动切换回主用模型: ${this.currentStatus.primaryModel.displayName}`);
        
        const switchResult = await this.scanner.switchToModel(this.currentStatus.primaryModel.id);
        
        if (switchResult.success) {
          // 更新状态
          this.currentStatus.isPrimaryHealthy = true;
          this.currentStatus.lastSwitchTime = new Date();
          
          console.log(`✅ 已切换回主用模型: ${this.currentStatus.primaryModel.displayName}`);
          
          // 发送恢复通知
          await this._sendRecoveryNotification();
          
        } else {
          console.error(`❌ 切换回主用模型失败: ${switchResult.error}`);
          await this._sendNotification(`❌ 切换回主用模型失败: ${switchResult.error}`);
        }
        
      } catch (error) {
        console.error('切换回主用模型时出错:', error);
        await this._sendNotification(`❌ 切换回主用模型时出错: ${error.message}`);
      }
    } else {
      console.log('ℹ️ 主用模型已恢复，但未启用自动恢复功能');
      await this._sendRecoveryNotification(false); // 只通知，不切换
    }
  }

  /**
   * 发送切换通知
   */
  async _sendSwitchNotification() {
    if (!this.notificationConfig.notifyOnSwitch || !this.context) {
      return;
    }

    const primaryName = this.currentStatus.primaryModel?.displayName || '主用模型';
    const backupName = this.currentStatus.backupModel?.displayName || '备用模型';
    const timestamp = new Date().toLocaleString('zh-CN');
    
    const message = `🚨 模型自动切换通知\n` +
                   `====================\n` +
                   `⚠️ 检测到主用模型故障\n` +
                   `• 故障模型: ${primaryName}\n` +
                   `• 切换到: ${backupName}\n` +
                   `• 切换时间: ${timestamp}\n` +
                   `• 连续失败: ${this.currentStatus.consecutiveFailures}次\n\n` +
                   `💡 系统已自动切换到备用模型，对话将继续进行。\n` +
                   `📊 发送 "models status" 查看当前模型状态`;
    
    try {
      await this.context.reply(message);
      console.log('📨 已发送切换通知');
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }

  /**
   * 发送恢复通知
   */
  async _sendRecoveryNotification(autoRecovered = true) {
    if (!this.notificationConfig.notifyOnRecovery || !this.context) {
      return;
    }

    const primaryName = this.currentStatus.primaryModel?.displayName || '主用模型';
    const timestamp = new Date().toLocaleString('zh-CN');
    
    let message;
    
    if (autoRecovered) {
      message = `✅ 模型恢复通知\n` +
                `====================\n` +
                `🎉 主用模型已恢复\n` +
                `• 恢复模型: ${primaryName}\n` +
                `• 恢复时间: ${timestamp}\n` +
                `• 状态: 已自动切换回主用模型\n\n` +
                `💡 系统检测到主用模型恢复正常，已自动切换回来。`;
    } else {
      message = `ℹ️ 模型恢复通知\n` +
                `====================\n` +
                `🔧 主用模型已恢复\n` +
                `• 恢复模型: ${primaryName}\n` +
                `• 检测时间: ${timestamp}\n` +
                `• 状态: 仍在使用备用模型\n\n` +
                `💡 主用模型已恢复正常，但需要手动切换。\n` +
                `📱 发送 "models 1" 切换回主用模型`;
    }
    
    try {
      await this.context.reply(message);
      console.log('📨 已发送恢复通知');
    } catch (error) {
      console.error('发送恢复通知失败:', error);
    }
  }

  /**
   * 发送通用通知
   */
  async _sendNotification(text) {
    if (!this.notificationConfig.enableNotifications || !this.context) {
      return;
    }

    try {
      await this.context.reply(text);
      console.log('📨 已发送通知:', text.substring(0, 50) + '...');
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }

  /**
   * 更新模型信息
   */
  async _updateModelInfo() {
    try {
      // 获取所有模型
      const models = await this.scanner.getConfiguredModels();
      
      if (models.length === 0) {
        console.warn('⚠️ 未找到任何配置的模型');
        return;
      }
      
      // 查找主用模型（标记为default的）
      const primaryModel = models.find(m => m.isDefault) || models[0];
      
      // 查找备用模型（第一个非主用模型）
      const backupModel = models.find(m => !m.isDefault && m.id !== primaryModel.id) || 
                         (models.length > 1 ? models[1] : null);
      
      this.currentStatus.primaryModel = primaryModel;
      this.currentStatus.backupModel = backupModel;
      
      console.log(`📊 模型信息更新: 主用=${primaryModel?.displayName}, 备用=${backupModel?.displayName || '无'}`);
      
    } catch (error) {
      console.error('更新模型信息失败:', error);
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      ...this.currentStatus,
      monitoring: this.monitoring,
      checkInterval: this.checkInterval,
      nextCheckIn: this._getNextCheckTime()
    };
  }

  /**
   * 获取下次检查时间
   */
  _getNextCheckTime() {
    if (!this.monitoring || !this.currentStatus.lastCheckTime) {
      return null;
    }
    
    const nextCheck = new Date(this.currentStatus.lastCheckTime);
    nextCheck.setSeconds(nextCheck.getSeconds() + this.checkInterval);
    return nextCheck;
  }

  /**
   * 手动触发健康检查
   */
  async manualCheck() {
    console.log('🔍 手动触发健康检查...');
    await this._performHealthCheck();
    return this.getStatus();
  }

  /**
   * 手动切换回主用模型
   */
  async switchBackToPrimary() {
    if (!this.currentStatus.primaryModel) {
      throw new Error('未找到主用模型信息');
    }

    console.log(`🔄 手动切换回主用模型: ${this.currentStatus.primaryModel.displayName}`);
    
    const switchResult = await this.scanner.switchToModel(this.currentStatus.primaryModel.id);
    
    if (switchResult.success) {
      this.currentStatus.isPrimaryHealthy = true;
      this.currentStatus.consecutiveFailures = 0;
      this.currentStatus.lastSwitchTime = new Date();
      
      console.log(`✅ 已手动切换回主用模型`);
      
      // 发送通知
      if (this.notificationConfig.enableNotifications && this.context) {
        const message = `✅ 手动切换完成\n` +
                       `====================\n` +
                       `• 切换到: ${this.currentStatus.primaryModel.displayName}\n` +
                       `• 切换时间: ${new Date().toLocaleString('zh-CN')}\n` +
                       `• 状态: 主用模型已恢复使用`;
        
        await this.context.reply(message);
      }
    }
    
    return switchResult;
  }
}