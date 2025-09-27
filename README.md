# AI博客系统

基于Next.js + Flask技术栈开发的现代化博客系统，专注于Markdown编辑和渲染。

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Redis 6+

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-blog
```

2. **安装前端依赖**
```bash
cd web
npm install
```

3. **安装后端依赖**
```bash
cd ../api
pip install -r requirements.txt
```

4. **环境配置**
```bash
# 复制环境变量文件
cp env.example .env
cp web/.env.local.example web/.env.local
```

5. **数据库初始化**
```bash
# 创建数据库
createdb ai_blog

# 运行迁移
cd api
flask db upgrade
```

6. **启动服务**
```bash
# 启动后端
cd api
python run.py

# 启动前端
cd web
npm run dev
```

## 🐳 Docker部署

```bash
# 使用Docker Compose启动所有服务
docker-compose up -d
```

## 📁 项目结构

```
ai-blog/
├── web/                    # Next.js 前端
├── api/                    # Flask 后端
├── database/               # 数据库相关
├── docs/                   # 项目文档
└── scripts/                # 脚本文件
```

## 🛠️ 技术栈

### 前端
- Next.js 14
- TypeScript
- Tailwind CSS
- Monaco Editor
- Remark/Rehype

### 后端
- Flask
- SQLAlchemy
- PostgreSQL
- Redis

## 📚 文档

- [项目说明书](AI博客系统_项目说明书.md)
- [API文档](docs/API.md)
- [部署指南](docs/DEPLOYMENT.md)

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
