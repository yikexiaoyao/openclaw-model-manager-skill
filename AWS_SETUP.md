# AWS 配置指南

## 1. 配置凭证
```bash
aws configure
```

输入以下信息：
- **AWS Access Key ID**: [你的 Access Key]
- **AWS Secret Access Key**: [你的 Secret Key]
- **Default region name**: us-east-1
- **Default output format**: json

## 2. 验证配置
```bash
aws sts get-caller-identity
```

预期输出：
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-name"
}
```

## 3. 创建 S3 Bucket
```bash
aws s3 mb s3://openclaw-backup-$(date +%Y%m%d)
```

## 4. 测试备份脚本
```bash
chmod +x ~/.openclaw/workspace/backup-s3.sh
~/.openclaw/workspace/backup-s3.sh openclaw-backup-20260408
```

## 5. 配置定时任务
```bash
crontab -e
```

添加：
```
0 2 * * * ~/.openclaw/workspace/backup-s3.sh openclaw-backup-20260408
```

## 6. 验证定时任务
```bash
crontab -l
```

---

## 凭证存储位置
~/.aws/credentials

## 配置文件位置
~/.aws/config
