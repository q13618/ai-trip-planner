# Azure OpenAI 聊天机器人

这是一个使用Azure OpenAI服务的聊天机器人，具有自动配置测试和错误诊断功能。

## 功能特点

- 🔍 **自动配置测试**: 自动测试不同的API版本和部署名称组合
- 🛡️ **安全配置**: 支持环境变量和配置文件，避免硬编码敏感信息
- 💬 **交互式聊天**: 支持连续对话，输入'quit'退出
- 🚨 **错误诊断**: 详细的错误信息和故障排除建议

## 安装依赖

```bash
pip install requests
```

## 配置方法

### 方法1: 环境变量（推荐）

设置以下环境变量：

```bash
export AZURE_OPENAI_ENDPOINT="https://your-resource-name.openai.azure.com/"
export AZURE_OPENAI_API_KEY="your-api-key-here"
export AZURE_OPENAI_API_VERSION="2024-05-01-preview"
export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
```

### 方法2: 配置文件

1. 复制示例配置文件：
```bash
cp azure_openai_config.example.json azure_openai_config.json
```

2. 编辑 `azure_openai_config.json` 文件，填入你的配置信息：
```json
{
    "endpoint": "https://your-resource-name.openai.azure.com/",
    "api_key": "your-api-key-here",
    "api_version": "2024-05-01-preview",
    "deployment_name": "gpt-4o"
}
```

## 使用方法

```bash
python3 azure_openai_chatbot.py
```

程序会自动：
1. 测试配置是否正确
2. 尝试不同的部署名称和API版本组合
3. 找到可用配置后开始聊天模式

## 故障排除

如果遇到问题，请检查：

1. **API密钥是否正确**
2. **端点URL是否正确**
3. **部署名称是否正确**（在Azure门户中查看）
4. **是否有足够的配额**
5. **网络连接是否正常**

## 安全注意事项

- ⚠️ **不要将API密钥提交到Git仓库**
- ✅ 使用环境变量或配置文件存储敏感信息
- ✅ 将 `azure_openai_config.json` 添加到 `.gitignore`

## 版本历史

- **v1.0**: 初始版本，支持基本的聊天功能
- **v1.1**: 添加自动配置测试和错误诊断功能
- **v1.2**: 改进安全性，移除硬编码的API密钥 