#!/bin/bash
# S3 Backup Script for OpenClaw
# Usage: ./backup-s3.sh [bucket-name]

set -e

BUCKET_NAME=${1:-openclaw-backup}
BACKUP_DIR=~/.openclaw
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== OpenClaw S3 Backup ==="
echo "Timestamp: $TIMESTAMP"
echo "Bucket: $BUCKET_NAME"
echo ""

# 1. Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi
echo "✅ AWS credentials OK"

# 2. Check bucket exists
if ! aws s3 ls s3://$BUCKET_NAME &>/dev/null; then
    echo "🪣 Creating bucket: $BUCKET_NAME"
    aws s3 mb s3://$BUCKET_NAME
fi
echo "✅ Bucket OK"

# 3. Backup files
echo "📦 Backing up..."
aws s3 cp $BACKUP_DIR/openclaw.json s3://$BUCKET_NAME/backup_$TIMESTAMP/openclaw.json
aws s3 cp $BACKUP_DIR/workspace/MEMORY.md s3://$BUCKET_NAME/backup_$TIMESTAMP/MEMORY.md

echo ""
echo "✅ Backup complete!"
echo "Files:"
aws s3 ls s3://$BUCKET_NAME/backup_$TIMESTAMP/
