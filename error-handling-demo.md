# 错误处理示范

## 场景：AWS CLI 未安装

### 错误识别
```bash
$ aws s3 cp config.json s3://bucket/
zsh: command not found: aws
```

### 错误分析
1. **问题**：AWS CLI 未安装
2. **影响**：无法执行 S3 操作
3. **解决方案**：安装 AWS CLI

### 修复步骤
```bash
# 方案 1：使用 Homebrew (macOS)
brew install awscli

# 方案 2：使用 pip
pip install awscli

# 方案 3：直接下载
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "awscli.pkg"
```

### 验证安装
```bash
aws --version
# 输出：aws-cli/2.x.x Python/x.x.x ...
```

### 备选方案
如果 AWS CLI 安装失败：
- 使用 AWS Console 网页上传
- 使用 boto3 Python 库
- 使用其他 S3 工具 (如 s5cmd)

```
