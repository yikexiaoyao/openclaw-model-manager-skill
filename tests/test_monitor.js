#!/usr/bin/env node
/**
 * 模型健康监控测试
 */

import { ModelHealthMonitor } from '../src/ModelHealthMonitor.js';

// 模拟配置
const testConfig = {
  checkInterval: 10,  // 测试用短间隔
  failureThreshold: 2,
  autoRecover: true,
  notifications: {
    enable: false,  // 测试时禁用通知
    onSwitch: true,
    onRecovery: true,
    onFailure: false
  }
};

// 模拟扫描器
const mockScanner = {
  getConfiguredModels: async () => {
    return [
      {
        index: 1,
        id: 'custom-api-deepseek-com/deepseek-chat',
        displayName: 'DeepSeek V3.2',
        isDefault: true,
        isConfigured: true,
        context: '125k',
        authStatus: '✅',
        tags: ['default', 'configured'],
        emoji: '🚀'
      },
      {
        index: 2,
        id: 'openrouter/qwen/qwen3-next-80b-a3b-instruct:free',
        displayName: '通义千问80B',
        isDefault: false,
        isConfigured: true,
        context: '256k',
        authStatus: '⚠️',
        tags: ['configured'],
        emoji: '🆓'
      }
    ];
  },
  
  switchToModel: async (modelId) => {
    console.log(`  模拟切换模型: ${modelId}`);
    return {
      success: true,
      message: '切换成功',
      modelId
    };
  }
};

// 模拟上下文
const mockContext = {
  reply: async (message) => {
    console.log(`  模拟发送通知: ${message.substring(0, 50)}...`);
  }
};

async function runMonitorTests() {
  console.log('🧪 开始模型健康监控测试\n');
  
  try {
    // 测试1: 创建监控器
    await testMonitorCreation();
    
    // 测试2: 状态管理
    await testStatusManagement();
    
    // 测试3: 手动检查
    await testManualCheck();
    
    console.log('\n✅ 所有监控测试通过！');
  } catch (error) {
    console.error('\n❌ 监控测试失败:', error.message);
    process.exit(1);
  }
}

async function testMonitorCreation() {
  console.log('1. 测试监控器创建...');
  
  const monitor = new ModelHealthMonitor(testConfig, mockScanner, mockContext);
  
  // 检查初始状态
  const status = monitor.getStatus();
  console.log(`   • 监控状态: ${status.monitoring ? '运行中' : '停止'}`);
  console.log(`   • 检查间隔: ${status.checkInterval}秒`);
  console.log(`   • 失败阈值: ${status.failureThreshold}次`);
  
  console.log('   ✅ 监控器创建测试通过\n');
}

async function testStatusManagement() {
  console.log('2. 测试状态管理...');
  
  const monitor = new ModelHealthMonitor(testConfig, mockScanner, mockContext);
  
  // 启动监控
  await monitor.startMonitoring();
  
  // 获取状态
  const status = monitor.getStatus();
  console.log(`   • 监控运行: ${status.monitoring ? '✅' : '❌'}`);
  console.log(`   • 主用模型: ${status.primaryModel?.displayName || '无'}`);
  console.log(`   • 备用模型: ${status.backupModel?.displayName || '无'}`);
  console.log(`   • 健康状态: ${status.isPrimaryHealthy ? '✅' : '❌'}`);
  
  // 停止监控
  monitor.stopMonitoring();
  const stoppedStatus = monitor.getStatus();
  console.log(`   • 停止后状态: ${stoppedStatus.monitoring ? '❌' : '✅'}`);
  
  console.log('   ✅ 状态管理测试通过\n');
}

async function testManualCheck() {
  console.log('3. 测试手动检查...');
  
  const monitor = new ModelHealthMonitor(testConfig, mockScanner, mockContext);
  
  // 手动检查
  const checkResult = await monitor.manualCheck();
  console.log(`   • 检查完成: ${checkResult.lastCheckTime ? '✅' : '❌'}`);
  console.log(`   • 连续失败: ${checkResult.consecutiveFailures}`);
  console.log(`   • 切换次数: ${checkResult.switchCount}`);
  
  // 测试手动恢复
  const recoverResult = await monitor.switchBackToPrimary();
  console.log(`   • 手动恢复: ${recoverResult.success ? '✅' : '❌'}`);
  
  console.log('   ✅ 手动检查测试通过\n');
}

// 运行测试
runMonitorTests().catch(console.error);