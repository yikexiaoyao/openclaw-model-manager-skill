#!/usr/bin/env python3
"""
RAG 本地检索技能 - 主程序
使用 BGE-M3 + ChromaDB 进行语义检索
"""

import sys
import json
import requests

RAG_SERVICE_URL = "http://127.0.0.1:8001"

def add_document(collection, document, doc_id, metadata=None):
    """添加单个文档"""
    url = f"{RAG_SERVICE_URL}/add"
    payload = {
        "collection": collection,
        "document": document,
        "doc_id": doc_id,
        "metadata": metadata or {"source": "rag-skill"}
    }
    
    try:
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def add_batch(collection, documents, ids, metadatas=None):
    """批量添加文档"""
    url = f"{RAG_SERVICE_URL}/add_batch"
    payload = {
        "collection": collection,
        "documents": documents,
        "ids": ids,
        "metadatas": metadatas
    }
    
    try:
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def query(collection, query_text, n_results=5):
    """检索文档"""
    url = f"{RAG_SERVICE_URL}/query"
    payload = {
        "collection": collection,
        "query": query_text,
        "n_results": n_results
    }
    
    try:
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def heartbeat():
    """健康检查"""
    url = f"{RAG_SERVICE_URL}/heartbeat"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def list_collections():
    """列出所有集合"""
    url = f"{RAG_SERVICE_URL}/collections"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def main():
    """命令行接口"""
    if len(sys.argv) < 2:
        print("用法：python3 main.py <命令> [参数]")
        print()
        print("命令:")
        print("  add <集合> <文档> <ID>  - 添加文档")
        print("  query <集合> <查询>     - 检索文档")
        print("  heartbeat              - 健康检查")
        print("  list                   - 列出集合")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "add":
        if len(sys.argv) < 5:
            print("用法：python3 main.py add <集合> <文档> <ID>")
            sys.exit(1)
        result = add_document(sys.argv[2], sys.argv[3], sys.argv[4])
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif cmd == "query":
        if len(sys.argv) < 4:
            print("用法：python3 main.py query <集合> <查询>")
            sys.exit(1)
        result = query(sys.argv[2], sys.argv[3])
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif cmd == "heartbeat":
        result = heartbeat()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif cmd == "list":
        result = list_collections()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    else:
        print(f"未知命令：{cmd}")
        sys.exit(1)

if __name__ == "__main__":
    main()
