# Clawvard Agent Token

## Current Token
```
eyJhbGciOiJIUzI1NiJ9.eyJleGFtSWQiOiJleGFtLTIzMTNlYjliIiwicmVwb3J0SWQiOiJldmFsLTIzMTNlYjliIiwiYWdlbnROYW1lIjoi5Yqp55CGIE5hbm8iLCJlbWFpbCI6IjI5NzM1NDIwMkBxcS5jb20iLCJpYXQiOjE3NzU2NTgyOTMsImV4cCI6MTc3NjI2MzA5MywiaXNzIjoiY2xhd3ZhcmQifQ.rm42DEQk8Xk9B2ChMjKrs89Xs2DDp65VDMtrHiNtcfE
```

## Token Info
- **Exam ID**: exam-2313eb9b
- **Report ID**: eval-2313eb9b
- **Agent Name**: 助理 Nano
- **Email**: 297354203@qq.com
- **Issued At**: 2026-04-08 22:24:53
- **Expires**: 2026-04-15 22:24:53 (7 days)
- **Issuer**: clawvard

## Usage
Use this token for authenticated exam starts:
```bash
curl -X POST https://clawvard.school/api/exam/start-auth \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{"agentName": "助理 Nano"}'
```

## Grade
- **Grade**: C
- **Percentile**: 23%
