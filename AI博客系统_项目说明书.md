# AI博客系统项目说明书

## 📋 项目概述

### 项目名称
AI博客系统 (AI Blog System)

### 项目描述
基于Next.js + Flask技术栈开发的现代化博客系统，专注于Markdown编辑和渲染，提供专业级的写作体验和高质量的内容展示。

### 技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Flask + SQLAlchemy + PostgreSQL
- **编辑器**: Monaco Editor (VS Code同款)
- **渲染**: Remark + Rehype 生态
- **部署**: Docker + Nginx

## 🏗️ 项目结构

```
ai-blog/
├── README.md                           # 项目说明文档
├── docker-compose.yml                  # Docker编排文件
├── .gitignore                          # Git忽略文件
├── .env.example                        # 环境变量示例
│
├── web/                                # Next.js 前端
│   ├── package.json                    # 前端依赖配置
│   ├── next.config.js                  # Next.js配置
│   ├── tailwind.config.js              # Tailwind CSS配置
│   ├── tsconfig.json                   # TypeScript配置
│   ├── .env.local                      # 前端环境变量
│   │
│   ├── app/                            # App Router (Next.js 14)
│   │   ├── layout.tsx                  # 根布局
│   │   ├── page.tsx                    # 首页
│   │   ├── globals.css                 # 全局样式
│   │   │
│   │   ├── editor/                     # 编辑器相关页面
│   │   │   ├── page.tsx                # 编辑器首页
│   │   │   ├── [id]/page.tsx           # 编辑特定文章
│   │   │   └── new/page.tsx            # 创建新文章
│   │   │
│   │   ├── posts/                      # 文章展示页面
│   │   │   ├── page.tsx                # 文章列表
│   │   │   ├── [slug]/page.tsx         # 文章详情
│   │   │   └── category/[name]/page.tsx # 分类页面
│   │   │
│   │   ├── api/                        # API路由
│   │   │   ├── posts/route.ts          # 文章API
│   │   │   ├── upload/route.ts         # 文件上传API
│   │   │   └── auth/route.ts           # 认证API
│   │   │
│   │   └── admin/                      # 管理后台
│   │       ├── page.tsx                # 管理首页
│   │       ├── posts/page.tsx          # 文章管理
│   │       └── settings/page.tsx       # 系统设置
│   │
│   ├── components/                     # 组件库
│   │   ├── ui/                         # 基础UI组件
│   │   │   ├── button.tsx              # 按钮组件
│   │   │   ├── input.tsx               # 输入框组件
│   │   │   ├── modal.tsx               # 模态框组件
│   │   │   ├── toast.tsx               # 提示组件
│   │   │   └── index.ts                # 组件导出
│   │   │
│   │   ├── editor/                     # 编辑器组件
│   │   │   ├── MarkdownEditor.tsx      # 主编辑器
│   │   │   ├── EditorToolbar.tsx       # 编辑器工具栏
│   │   │   ├── EditorPreview.tsx       # 预览组件
│   │   │   ├── EditorSidebar.tsx       # 侧边栏
│   │   │   ├── FileTree.tsx            # 文件树
│   │   │   └── EditorSettings.tsx      # 编辑器设置
│   │   │
│   │   ├── markdown/                   # Markdown渲染组件
│   │   │   ├── MarkdownRenderer.tsx    # 主渲染器
│   │   │   ├── CodeBlock.tsx           # 代码块组件
│   │   │   ├── Table.tsx               # 表格组件
│   │   │   ├── Image.tsx               # 图片组件
│   │   │   ├── MathFormula.tsx         # 数学公式组件
│   │   │   └── TableOfContents.tsx     # 目录组件
│   │   │
│   │   ├── layout/                     # 布局组件
│   │   │   ├── Header.tsx              # 头部组件
│   │   │   ├── Footer.tsx              # 底部组件
│   │   │   ├── Sidebar.tsx             # 侧边栏组件
│   │   │   └── Navigation.tsx          # 导航组件
│   │   │
│   │   └── common/                     # 通用组件
│   │       ├── Loading.tsx             # 加载组件
│   │       ├── ErrorBoundary.tsx       # 错误边界
│   │       └── ThemeProvider.tsx       # 主题提供者
│   │
│   ├── lib/                            # 工具库
│   │   ├── utils.ts                    # 通用工具函数
│   │   ├── api.ts                      # API客户端
│   │   ├── auth.ts                     # 认证工具
│   │   ├── markdown.ts                 # Markdown处理
│   │   ├── storage.ts                  # 本地存储
│   │   └── constants.ts                # 常量定义
│   │
│   ├── hooks/                          # 自定义Hooks
│   │   ├── useEditor.ts                # 编辑器Hook
│   │   ├── useMarkdown.ts              # Markdown Hook
│   │   ├── useAuth.ts                  # 认证Hook
│   │   └── useLocalStorage.ts          # 本地存储Hook
│   │
│   ├── types/                          # TypeScript类型定义
│   │   ├── post.ts                     # 文章类型
│   │   ├── user.ts                     # 用户类型
│   │   ├── editor.ts                   # 编辑器类型
│   │   └── api.ts                      # API类型
│   │
│   ├── styles/                         # 样式文件
│   │   ├── globals.css                 # 全局样式
│   │   ├── markdown.css                # Markdown样式
│   │   ├── editor.css                  # 编辑器样式
│   │   └── themes/                     # 主题样式
│   │       ├── light.css               # 亮色主题
│   │       └── dark.css                # 暗色主题
│   │
│   └── public/                         # 静态资源
│       ├── images/                     # 图片资源
│       ├── icons/                      # 图标资源
│       └── fonts/                      # 字体资源
│
├── api/                                # Flask 后端
│   ├── app/                            # 应用主目录
│   │   ├── __init__.py                 # 应用初始化
│   │   ├── config.py                   # 配置文件
│   │   ├── extensions.py               # 扩展初始化
│   │   │
│   │   ├── api/                        # API路由
│   │   │   ├── __init__.py
│   │   │   ├── posts.py                # 文章API
│   │   │   ├── auth.py                 # 认证API
│   │   │   ├── upload.py               # 文件上传API
│   │   │   └── admin.py                # 管理API
│   │   │
│   │   ├── models/                     # 数据模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py                 # 用户模型
│   │   │   ├── post.py                 # 文章模型
│   │   │   ├── category.py             # 分类模型
│   │   │   └── comment.py              # 评论模型
│   │   │
│   │   ├── services/                   # 业务逻辑
│   │   │   ├── __init__.py
│   │   │   ├── markdown_service.py     # Markdown处理服务
│   │   │   ├── file_service.py         # 文件处理服务
│   │   │   ├── auth_service.py         # 认证服务
│   │   │   └── email_service.py        # 邮件服务
│   │   │
│   │   ├── utils/                      # 工具函数
│   │   │   ├── __init__.py
│   │   │   ├── decorators.py           # 装饰器
│   │   │   ├── validators.py           # 验证器
│   │   │   ├── helpers.py              # 辅助函数
│   │   │   └── markdown_utils.py       # Markdown工具
│   │   │
│   │   └── middleware/                 # 中间件
│   │       ├── __init__.py
│   │       ├── auth.py                 # 认证中间件
│   │       ├── cors.py                 # CORS中间件
│   │       └── rate_limit.py           # 限流中间件
│   │
│   ├── migrations/                     # 数据库迁移
│   ├── tests/                          # 测试文件
│   │   ├── __init__.py
│   │   ├── test_api.py                 # API测试
│   │   ├── test_models.py              # 模型测试
│   │   └── test_services.py            # 服务测试
│   │
│   ├── requirements.txt                 # Python依赖
│   ├── .env                            # 环境变量
│   ├── run.py                          # 应用启动文件
│   └── wsgi.py                         # WSGI配置
│
├── database/                           # 数据库相关
│   ├── init.sql                        # 数据库初始化脚本
│   ├── migrations/                     # 数据库迁移文件
│   └── seeds/                          # 种子数据
│
├── docs/                               # 项目文档
│   ├── README.md                       # 项目说明
│   ├── API.md                          # API文档
│   ├── DEPLOYMENT.md                   # 部署文档
│   └── CONTRIBUTING.md                 # 贡献指南
│
└── scripts/                            # 脚本文件
    ├── setup.sh                        # 环境设置脚本
    ├── deploy.sh                       # 部署脚本
    └── backup.sh                       # 备份脚本
```

## 🎯 核心功能模块

### 1. Markdown编辑器模块
- **Monaco Editor集成**
  - 语法高亮和智能提示
  - 分屏实时预览
  - 快捷键支持
  - 自动保存功能

- **编辑器功能**
  - 文件树管理
  - 大纲导航
  - 搜索替换
  - 撤销重做
  - 主题切换

### 2. Markdown渲染模块
- **渲染引擎**
  - Remark + Rehype 处理链
  - 代码高亮 (Prism.js/Shiki)
  - 数学公式 (KaTeX)
  - 表格美化

- **渲染特性**
  - 响应式图片
  - 目录生成
  - 链接预览
  - 语法高亮主题

### 3. 文章管理模块
- **CRUD操作**
  - 创建/编辑/删除文章
  - 文章列表和搜索
  - 分类和标签管理
  - 文章状态管理

- **内容处理**
  - Markdown解析和渲染
  - 元数据提取
  - 图片处理
  - 版本控制

### 4. 用户认证模块
- **认证方式**
  - JWT Token认证
  - 第三方登录 (GitHub, Google)
  - 密码重置
  - 会话管理

- **权限控制**
  - 角色管理
  - 访问控制
  - API权限验证

### 5. 文件管理模块
- **文件上传**
  - 图片拖拽上传
  - 文件类型验证
  - 大小限制
  - 安全扫描

- **文件处理**
  - 图片压缩
  - 格式转换
  - CDN集成
  - 文件清理

## 🛠️ 技术实现

### 前端技术栈
```typescript
// 核心框架
- Next.js 14 (App Router)
- TypeScript
- React 18

// 编辑器
- Monaco Editor
- @monaco-editor/react

// Markdown处理
- remark
- rehype
- rehype-react
- rehype-highlight
- rehype-katex

// UI框架
- Tailwind CSS
- @tailwindcss/typography
- Headless UI

// 状态管理
- React Query
- Zustand

// 工具库
- clsx
- date-fns
- lodash-es
```

### 后端技术栈
```python
# 核心框架
- Flask
- SQLAlchemy
- Flask-Migrate

# Markdown处理
- python-markdown
- bleach
- markdown-extensions

# 认证和安全
- Flask-JWT-Extended
- Flask-CORS
- Flask-Limiter

# 文件处理
- Pillow
- python-magic

# 数据库
- PostgreSQL
- Redis
```

## 🚀 开发计划

### 阶段一：基础架构 (1-2周)
- [ ] 项目结构搭建
- [ ] 基础配置和依赖安装
- [ ] 数据库设计和模型创建
- [ ] 基础API接口开发

### 阶段二：编辑器开发 (2-3周)
- [ ] Monaco Editor集成
- [ ] 编辑器功能实现
- [ ] 实时预览功能
- [ ] 文件管理功能

### 阶段三：渲染系统 (1-2周)
- [ ] Markdown渲染引擎
- [ ] 代码高亮实现
- [ ] 数学公式支持
- [ ] 样式优化

### 阶段四：用户系统 (1-2周)
- [ ] 用户认证系统
- [ ] 权限管理
- [ ] 用户界面开发

### 阶段五：优化部署 (1周)
- [ ] 性能优化
- [ ] 测试完善
- [ ] 部署配置
- [ ] 文档编写

## 📊 项目特色

1. **专业级编辑器**：基于Monaco Editor，提供VS Code级别的编辑体验
2. **高质量渲染**：支持代码高亮、数学公式、表格等高级功能
3. **实时预览**：分屏编辑，所见即所得
4. **响应式设计**：适配各种设备屏幕
5. **主题支持**：亮色/暗色主题切换
6. **性能优化**：虚拟滚动、懒加载、缓存策略

## 🔧 环境要求

### 开发环境
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Redis 6+

### 生产环境
- Docker 20+
- Nginx 1.20+
- SSL证书

## 📝 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd ai-blog
```

### 2. 安装依赖
```bash
# 前端依赖
cd web
npm install

# 后端依赖
cd ../api
pip install -r requirements.txt
```

### 3. 环境配置
```bash
# 复制环境变量文件
cp .env.example .env
cp web/.env.local.example web/.env.local
```

### 4. 数据库初始化
```bash
# 创建数据库
createdb ai_blog

# 运行迁移
cd api
flask db upgrade
```

### 5. 启动服务
```bash
# 启动后端
cd api
python run.py

# 启动前端
cd web
npm run dev
```

## 📚 文档结构

- `README.md` - 项目说明
- `API.md` - API接口文档
- `DEPLOYMENT.md` - 部署指南
- `CONTRIBUTING.md` - 贡献指南

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

- 项目维护者：[Your Name]
- 邮箱：[your-email@example.com]
- 项目地址：[GitHub Repository URL]

---

**最后更新时间**: 2024年12月
**版本**: v1.0.0
