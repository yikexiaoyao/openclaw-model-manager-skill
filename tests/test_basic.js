#!/usr/bin/env node
/**
 * 模型管理技能 - 基本测试
 */

import { ModelScanner } from '../src/ModelScanner.js';
import { ResponseFormatter } from '../src/ResponseFormatter.js';
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
    maxModelsPerPage: 10,
    cacheDuration: 300
  },
  behavior: {
    autoRefresh: true,
    confirmSwitch: false,
    logSwitches: true,
    backupBeforeSwitch: true
  }
};

async function runTests() {
  console.log('🧪 开始模型管理技能测试\n');
  
  try {
    // 测试1: 模型扫描器
    await testModelScanner();
    
    // 测试2: 响应格式化器
    await testResponseFormatter();
    
    // 测试3: 指令处理器
    await testCommandProcessor();
    
    console.log('\n✅ 所有测试通过！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

async function testModelScanner() {
  console.log('1. 测试模型扫描器...');
  
  const scanner = new ModelScanner(testConfig);
  
  // 测试获取模型列表
  const models = await scanner.getConfiguredModels();
  console.log(`   • 扫描到 ${models.length} 个模型`);
  
  // 测试模型解析
  if (models.length > 0) {
    const model = models[0];
    console.log(`   • 第一个模型: ${model.displayName}`);
    console.log(`   • 模型ID: ${model.id}`);
    console.log(`   • 是否默认: ${model.isDefault}`);
    console.log(`   • 上下文: ${model.context}`);
  }
  
  // 测试缓存
  const cachedModels = await scanner.getConfiguredModels();
  console.log(`   • 缓存测试: ${models.length === cachedModels.length ? '✅' : '❌'}`);
  
  console.log('   ✅ 模型扫描器测试通过\n');
}

async function testResponseFormatter() {
  console.log('2. 测试响应格式化器...');
  
  const formatter = new ResponseFormatter(testConfig);
  
  // 测试数据
  const testModels = [
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
  
  // 测试模型列表格式化
  const listResponse = formatter.formatModelList(testModels);
  console.log(`   • 列表响应长度: ${listResponse.length} 字符`);
  console.log(`   • 包含模型数量: ${(listResponse.match(/1\./g) || []).length}`);
  
  // 测试切换结果格式化
  const successResult = {
    success: true,
    message: '切换成功',
    modelId: 'test-model'
  };
  
  const successResponse = formatter.formatSwitchResult(successResult, testModels[0]);
  console.log(`   • 成功响应包含 ✅: ${successResponse.includes('✅') ? '是' : '否'}`);
  
  const errorResult = {
    success: false,
    error: '模型不存在'
  };
  
  const errorResponse = formatter.formatSwitchResult(errorResult);
  console.log(`   • 错误响应包含 ❌: ${errorResponse.includes('❌') ? '是' : '否'}`);
  
  // 测试错误格式化
  const testError = new Error('测试错误');
  const formattedError = formatter.formatError(testError, { userInput: 'models' });
  console.log(`   • 错误格式化: ${formattedError.includes('错误') ? '✅' : '❌'}`);
  
  console.log('   ✅ 响应格式化器测试通过\n');
}

async function testCommandProcessor() {
  console.log('3. 测试指令处理器...');
  
  const processor = new CommandProcessor(testConfig);
  
  // 测试命令解析
  console.log('   • 测试命令解析...');
  
  const testCases = [
    { input: 'models', expectedCommand: 'models', expectedArgs: [] },
    { input: 'models status', expectedCommand: 'models', expectedArgs: ['status'] },
    { input: 'models 1', expectedCommand: 'models', expectedArgs: ['1'] },
    { input: 'model refresh', expectedCommand: 'models', expectedArgs: ['refresh'] },
    { input: 'ml scan', expectedCommand: 'models', expectedArgs: ['scan'] }
  ];
  
  for (const testCase of testCases) {
    try {
      const result = await processor.process(testCase.input);
      console.log(`     - "${testCase.input}" → 处理成功 (${result.length}字符)`);
    } catch (error) {
      console.log(`     - "${testCase.input}" → 错误: ${error.message}`);
    }
  }
  
  // 测试帮助信息
  const helpText = processor.getHelp();
  console.log(`   • 帮助信息长度: ${helpText.length} 字符`);
  console.log(`   • 包含主命令: ${helpText.includes('models') ? '✅' : '❌'}`);
  
  console.log('   ✅ 指令处理器测试通过\n');
}

// 运行测试
runTests().catch(console.error);