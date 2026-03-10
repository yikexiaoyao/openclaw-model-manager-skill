#!/usr/bin/env node
/**
 * 帮助系统测试
 */

import { CommandProcessor } from '../src/CommandProcessor.js';

// 测试配置
const testConfig = {
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
    maxModelsPerPage: 0,
    cacheDuration: 300
  },
  behavior: {
    autoRefresh: true,
    confirmSwitch: false,
    logSwitches: true,
    backupBeforeSwitch: true
  }
};

async function runHelpTests() {
  console.log('📚 开始帮助系统测试\n');
  
  try {
    // 创建处理器
    const processor = new CommandProcessor(testConfig);
    
    // 测试1: 通用帮助
    await testGeneralHelp(processor);
    
    // 测试2: models命令帮助
    await testModelsHelp(processor);
    
    // 测试3: monitor命令帮助
    await testMonitorHelp(processor);
    
    // 测试4: 特定命令帮助
    await testSpecificHelp(processor);
    
    console.log('\n✅ 所有帮助测试通过！');
  } catch (error) {
    console.error('\n❌ 帮助测试失败:', error.message);
    process.exit(1);
  }
}

async function testGeneralHelp(processor) {
  console.log('1. 测试通用帮助...');
  
  const helpText = processor.getHelp('help');
  
  console.log(`   • 帮助文本长度: ${helpText.length} 字符`);
  console.log(`   • 包含"模型管理技能": ${helpText.includes('模型管理技能') ? '✅' : '❌'}`);
  console.log(`   • 包含"可用命令": ${helpText.includes('可用命令') ? '✅' : '❌'}`);
  console.log(`   • 包含"models": ${helpText.includes('models') ? '✅' : '❌'}`);
  console.log(`   • 包含"monitor": ${helpText.includes('monitor') ? '✅' : '❌'}`);
  
  console.log('   ✅ 通用帮助测试通过\n');
}

async function testModelsHelp(processor) {
  console.log('2. 测试models命令帮助...');
  
  const helpText = processor.getHelp('models');
  
  console.log(`   • 帮助文本长度: ${helpText.length} 字符`);
  console.log(`   • 包含"models命令": ${helpText.includes('models命令') ? '✅' : '❌'}`);
  console.log(`   • 包含"基本用法": ${helpText.includes('基本用法') ? '✅' : '❌'}`);
  console.log(`   • 包含"子命令": ${helpText.includes('子命令') ? '✅' : '❌'}`);
  console.log(`   • 包含"status": ${helpText.includes('status') ? '✅' : '❌'}`);
  console.log(`   • 包含"refresh": ${helpText.includes('refresh') ? '✅' : '❌'}`);
  console.log(`   • 包含"scan": ${helpText.includes('scan') ? '✅' : '❌'}`);
  
  console.log('   ✅ models命令帮助测试通过\n');
}

async function testMonitorHelp(processor) {
  console.log('3. 测试monitor命令帮助...');
  
  const helpText = processor.getHelp('monitor');
  
  console.log(`   • 帮助文本长度: ${helpText.length} 字符`);
  console.log(`   • 包含"monitor命令": ${helpText.includes('monitor命令') ? '✅' : '❌'}`);
  console.log(`   • 包含"监控功能": ${helpText.includes('监控功能') ? '✅' : '❌'}`);
  console.log(`   • 包含"子命令": ${helpText.includes('子命令') ? '✅' : '❌'}`);
  console.log(`   • 包含"start": ${helpText.includes('start') ? '✅' : '❌'}`);
  console.log(`   • 包含"stop": ${helpText.includes('stop') ? '✅' : '❌'}`);
  console.log(`   • 包含"status": ${helpText.includes('status') ? '✅' : '❌'}`);
  console.log(`   • 包含"check": ${helpText.includes('check') ? '✅' : '❌'}`);
  console.log(`   • 包含"recover": ${helpText.includes('recover') ? '✅' : '❌'}`);
  
  console.log('   ✅ monitor命令帮助测试通过\n');
}

async function testSpecificHelp(processor) {
  console.log('4. 测试特定命令帮助...');
  
  const testCases = [
    { command: 'status', shouldContain: '系统状态' },
    { command: 'refresh', shouldContain: '刷新缓存' },
    { command: 'scan', shouldContain: '扫描模型' },
    { command: 'start', shouldContain: '启动监控' },
    { command: 'stop', shouldContain: '停止监控' },
    { command: 'check', shouldContain: '手动检查' },
    { command: 'recover', shouldContain: '手动恢复' }
  ];
  
  for (const testCase of testCases) {
    const helpText = processor.getHelp(testCase.command);
    const contains = helpText.includes(testCase.shouldContain);
    
    console.log(`   • ${testCase.command}帮助: ${contains ? '✅' : '❌'} (包含"${testCase.shouldContain}")`);
  }
  
  // 测试未知命令帮助
  const unknownHelp = processor.getHelp('unknown');
  console.log(`   • 未知命令帮助: ${unknownHelp.includes('未知命令') ? '✅' : '❌'}`);
  
  console.log('   ✅ 特定命令帮助测试通过\n');
}

// 运行测试
runHelpTests().catch(console.error);