#!/bin/bash
# 模型管理技能安装脚本

set -e

echo "🚀 开始安装模型管理技能..."
echo "================================"

# 检查OpenClaw是否安装
if ! command -v openclaw &> /dev/null; then
    echo "❌ 未找到OpenClaw，请先安装OpenClaw"
    exit 1
fi

# 获取技能目录
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="model-manager-skill"

echo "📦 技能目录: $SKILL_DIR"
echo "🔧 技能名称: $SKILL_NAME"

# 检查是否已安装
if openclaw skills list | grep -q "$SKILL_NAME"; then
    echo "⚠️  技能已安装，先卸载旧版本..."
    openclaw skills remove "$SKILL_NAME" || true
fi

# 安装技能
echo "📥 安装技能..."
if openclaw skills install --path "$SKILL_DIR"; then
    echo "✅ 技能安装成功！"
else
    echo "❌ 技能安装失败"
    echo "💡 尝试手动安装: openclaw skills install --path $SKILL_DIR"
    exit 1
fi

# 验证安装
echo "🔍 验证安装..."
if openclaw skills list | grep -q "$SKILL_NAME"; then
    echo "✅ 验证成功 - 技能已注册"
else
    echo "⚠️  技能未在列表中显示，但可能已安装"
fi

# 创建快捷测试
echo "🧪 创建测试命令..."
cat > /tmp/test_model_manager.sh << 'EOF'
#!/bin/bash
echo "🤖 模型管理技能测试"
echo "========================"
echo "1. 发送 'models' 查看模型列表"
echo "2. 发送 'models status' 查看系统状态"
echo "3. 发送 'models 1' 切换到第一个模型"
echo "4. 发送 'help' 查看帮助信息"
echo ""
echo "💡 在Telegram中发送上述命令测试技能"
EOF

chmod +x /tmp/test_model_manager.sh

echo "📋 安装完成！"
echo "================================"
echo "🎯 使用方法:"
echo "• 发送 'models' - 查看模型列表"
echo "• 发送 'models <序号>' - 切换模型"
echo "• 发送 'models status' - 查看系统状态"
echo "• 发送 'models refresh' - 刷新缓存"
echo ""
echo "🔄 重启OpenClaw使技能生效:"
echo "  openclaw gateway restart"
echo ""
echo "📖 详细文档: $SKILL_DIR/SKILL.md"
echo "🧪 运行测试: node $SKILL_DIR/tests/test_basic.js"
echo ""
echo "✅ 安装完成！开始使用模型管理技能吧！"