# SingaReport网页应用详细技术提案

## 1. 系统架构概览

### 1.1 整体架构
SingaReport采用现代化的微服务架构，通过API网关连接各个独立服务，具体包括：

```
                  ┌───────────────┐
                  │   用户设备    │
                  │(移动/网页端)  │
                  └───────┬───────┘
                          │
                          ▼
┌────────────────────────────────────────────────┐
│               华为云CDN/WAF防护               │
└────────────────────────┬───────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────┐
│            API网关 (APIG服务)                 │
└┬──────────┬──────────┬──────────┬──────────────┘
 │          │          │          │
 ▼          ▼          ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐
│用户服│ │报告服│ │通知服│ │AI分析服务    │
│务    │ │务    │ │务    │ │              │
└──┬───┘ └──┬───┘ └──┬───┘ └──────┬───────┘
   │        │        │            │
   └────────┼────────┼────────────┘
            │        │
            ▼        ▼
┌───────────────┐ ┌───────────────┐
│ 关系型数据库  │ │ 消息队列系统  │
└───────────────┘ └───────────────┘
        │                 │
        │                 ▼
        │         ┌───────────────┐
        │         │ 对象存储服务  │
        │         └───────────────┘
        ▼
┌───────────────┐
│ 地理空间数据库│
└───────────────┘
```

### 1.2 部署架构
- **环境分离**：开发环境、测试环境、预生产环境、生产环境
- **容器编排**：使用华为云CCE（Cloud Container Engine）Kubernetes集群
- **自动扩缩容**：基于资源使用率和请求量的自动扩缩容配置

## 2. 前端技术规格

### 2.1 Web前端架构

#### 2.1.1 技术栈
- **框架**：Next.js 14（React框架，支持SSR和SSG）
- **类型系统**：TypeScript 5.3+
- **样式解决方案**：
  - Tailwind CSS 3.4+（功能性CSS框架）
  - CSS Modules（组件封装样式）
  - shadcn/ui（基于Radix UI的组件系统）
- **状态管理**：
  - React Query（服务器状态）
  - Zustand（客户端状态）
  - Context API（主题、认证等全局状态）
- **表单处理**：React Hook Form + Zod验证
- **代码质量**：
  - ESLint自定义规则集
  - Prettier代码格式化
  - Husky + lint-staged提交检查

#### 2.1.2 性能优化
- 实现代码分割和懒加载
- 图像优化使用Next.js Image组件
- 预取关键路由数据
- 使用Suspense和React.lazy实现更流畅的用户体验
- 实现服务工作器用于缓存和离线支持

#### 2.1.3 功能模块划分
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 认证相关路由
│   ├── (dashboard)/        # 用户仪表板路由
│   ├── (public)/           # 公共页面路由
│   └── api/                # API路由处理器
├── components/             # UI组件
│   ├── common/             # 通用组件
│   ├── forms/              # 表单组件
│   ├── layouts/            # 布局组件
│   ├── maps/               # 地图相关组件
│   ├── reports/            # 报告相关组件
│   └── ui/                 # 基础UI组件
├── lib/                    # 工具库
│   ├── api/                # API客户端
│   ├── auth/               # 认证工具
│   ├── hooks/              # 自定义Hooks
│   ├── utils/              # 通用工具函数
│   └── validators/         # 表单验证工具
├── providers/              # 全局提供商
├── services/               # 服务层
├── store/                  # 状态存储
└── types/                  # 全局类型定义
```

### 2.2 关键页面设计与功能

#### 2.2.1 主页
- 直观的问题报告入口
- 实时热点问题地图
- 服务导航卡片
- 成功案例展示
- 简化的登录/注册流程

#### 2.2.2 报告创建界面
- **多步骤报告流程**:
  1. 位置选择（地图/搜索/当前位置）
  2. 问题类型选择（带视觉辅助）
  3. 详情补充（照片上传、描述）
  4. 提交确认
- **AI辅助功能**:
  - 实时照片分析
  - 自动问题分类建议
  - 智能表单填充
- **离线支持**:
  - 本地存储草稿报告
  - 恢复提交能力

#### 2.2.3 追踪仪表板
- 个人报告列表与状态
- 报告详情视图
- 处理时间线可视化
- 解决方案更新
- 社区验证与投票功能

#### 2.2.4 智能助手界面
- 多模式交互（文本/语音）
- 上下文感知对话流
- 服务推荐与引导
- 多语言支持切换
- 历史会话管理

### 2.3 响应式设计规范
- 移动优先设计理念
- 断点设计:
  - 移动端: 0-639px
  - 平板竖屏: 640px-767px
  - 平板横屏: 768px-1023px
  - 桌面: 1024px-1279px
  - 大屏: 1280px+
- 自适应布局策略（Grid/Flexbox）
- 触摸友好的交互设计（更大点击区域）

### 2.4 可访问性标准
- 符合WCAG 2.1 AA级别
- 支持屏幕阅读器
- 键盘导航支持
- 高对比度模式
- 专注显示指示器

### 2.5 国际化与本地化
- 支持新加坡四种官方语言:
  - 英语
  - 华语
  - 马来语
  - 泰米尔语
- 完整的RTL支持
- 使用i18next管理翻译资源
- 区域特定格式（日期、数字、地址）

## 3. 后端技术规格

### 3.1 API服务架构

#### 3.1.1 技术栈
- **主要框架**：FastAPI (Python 3.11+)
- **API规范**：OpenAPI 3.1
- **认证**：JWT + OAuth2 + SingPass集成
- **部署**：Containerized (Docker)
- **服务协调**：Kubernetes (华为云CCE)
- **API网关**：华为云APIG(API Gateway)

#### 3.1.2 微服务划分
1. **用户服务**：
   - 用户注册、登录、个人资料
   - 身份验证与授权
   - SingPass集成
   - 角色与权限管理

2. **报告服务**：
   - 问题报告创建与管理
   - 报告分类与优先级
   - 报告状态追踪
   - 报告搜索与过滤

3. **地理位置服务**：
   - 位置编码与解码
   - 区域边界管理
   - 热点地图数据生成
   - 位置相关查询

4. **通知服务**：
   - 推送通知
   - 电子邮件通知
   - SMS文本通知
   - 通知偏好设置

5. **AI分析服务**：
   - 图像分析接口
   - 文本分类接口
   - 会话管理
   - 推荐引擎

6. **管理后台服务**：
   - 报告管理
   - 用户管理
   - 系统配置
   - 数据分析

### 3.2 详细API规范示例

#### 3.2.1 报告API
```yaml
openapi: 3.1.0
paths:
  /api/reports:
    post:
      summary: 创建新报告
      operationId: createReport
      tags: [Reports]
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                location:
                  type: object
                  properties:
                    latitude: {type: number}
                    longitude: {type: number}
                    address: {type: string}
                category_id: {type: string}
                subcategory_id: {type: string}
                description: {type: string}
                images:
                  type: array
                  items: {type: string, format: binary}
                anonymous: {type: boolean}
      responses:
        '201':
          description: 报告创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Report'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    get:
      summary: 获取报告列表
      operationId: listReports
      tags: [Reports]
      parameters:
        - name: status
          in: query
          schema: {type: string, enum: [pending, in_progress, resolved, all]}
        - name: category
          in: query
          schema: {type: string}
        - name: near
          in: query
          description: 格式为"latitude,longitude,radius_km"
          schema: {type: string}
        - name: page
          in: query
          schema: {type: integer, default: 1}
        - name: limit
          in: query
          schema: {type: integer, default: 20, maximum: 100}
      responses:
        '200':
          description: 成功获取报告列表
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/ReportSummary'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
```

#### 3.2.2 AI分析API
```yaml
openapi: 3.1.0
paths:
  /api/ai/analyze-image:
    post:
      summary: 分析上传的图像
      operationId: analyzeImage
      tags: [AI]
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                image:
                  type: string
                  format: binary
                context:
                  type: string
                  enum: [road_condition, infrastructure, public_facilities]
      responses:
        '200':
          description: 图像分析成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  category:
                    type: string
                  subcategory:
                    type: string
                  severity:
                    type: string
                    enum: [low, medium, high, critical]
                  confidence:
                    type: number
                    format: float
                  detected_objects:
                    type: array
                    items:
                      type: object
                      properties:
                        label: {type: string}
                        confidence: {type: number}
                        bbox: {type: array, items: {type: number}}
```

### 3.3 AI服务接入规范

#### 3.3.1 Janus-Pro集成
- **服务封装**：将Janus-Pro模型封装为独立微服务
- **模型部署**：
  - 使用华为ModelArts平台进行模型托管
  - 部署量化版模型（INT8）用于生产环境
  - 使用HuggingFace Transformers优化服务器推理
- **请求流程**：
  1. 图像预处理（调整大小、规范化）
  2. 批处理请求（动态批处理以提高吞吐量）
  3. 推理请求发送
  4. 结果后处理与格式化
- **性能目标**：
  - 平均响应时间：<1.5秒
  - P95响应时间：<3秒
  - 每秒请求处理量：>20

#### 3.3.2 AI故障转移与降级策略
- **服务监控**：健康检查与自动恢复
- **灾备方案**：多区域部署模型副本
- **降级策略**：
  - 使用较小模型（Janus-Pro-1B）作为备用
  - 实施本地图像分类备用功能
  - 故障时切换到人工分类队列

### 3.4 认证与安全

#### 3.4.1 用户认证流程
- **标准登录**：用户名/邮箱+密码（PBKDF2加密）
- **SingPass集成**：
  - OpenID Connect集成
  - 属性映射与同步
- **多因素认证**：
  - TOTP应用支持（例如Google Authenticator）
  - SMS一次性密码
  - 电子邮件验证码

#### 3.4.2 安全措施
- **API安全**：
  - 请求限流（基于IP和用户）
  - JWT签名与验证（使用RS256）
  - CORS策略配置
- **数据安全**：
  - 全程传输加密（TLS 1.3）
  - 敏感数据字段加密（AES-256）
  - 个人身份信息匿名化
- **漏洞防护**：
  - SQL注入防护
  - XSS防护
  - CSRF防护
  - 输入验证与清理

## 4. 数据库设计

### 4.1 数据库技术选型

#### 4.1.1 主数据库
- **数据库类型**：PostgreSQL 15+
- **扩展**：
  - PostGIS（地理空间数据）
  - pgVector（向量搜索）
  - TimescaleDB（时序数据）
- **部署方式**：华为云RDS（关系型数据库服务）
- **高可用配置**：主-从复制，自动故障转移

#### 4.1.2 辅助数据库
- **非结构化数据**：MongoDB
- **缓存层**：Redis Cluster
- **搜索引擎**：Elasticsearch
- **时序数据**：InfluxDB（监控指标）

### 4.2 数据模型

#### 4.2.1 核心实体关系图

```
┌───────────┐       ┌───────────┐       ┌───────────┐
│   Users   │       │  Reports  │       │ Categories│
├───────────┤       ├───────────┤       ├───────────┤
│ id        │       │ id        │       │ id        │
│ username  │◄──────┤ user_id   │       │ name      │
│ email     │       │ category_id├──────►│ parent_id │
│ password  │       │ subcategory_id    │ icon      │
│ created_at│       │ status    │       │ color     │
└───────────┘       │ description       └───────────┘
                    │ location  │
                    │ anonymous │       ┌───────────┐
                    │ upvotes   │       │  Media    │
                    │ created_at│       ├───────────┤
                    │ updated_at│       │ id        │
                    └───────────┘       │ report_id ├─┐
                           ▲            │ type      │ │
                           │            │ url       │ │
                           │            │ thumbnail │ │
┌───────────┐              │            │ created_at│ │
│  Comments │              │            └───────────┘ │
├───────────┤              │                  ▲       │
│ id        │              │                  │       │
│ report_id ├──────────────┘                  │       │
│ user_id   │                                 │       │
│ content   │              ┌───────────┐      │       │
│ created_at│              │ AI_Analysis     │       │
└───────────┘              ├───────────┤      │       │
                           │ id        │      │       │
                           │ media_id  ├──────┘       │
                           │ report_id ├──────────────┘
                           │ category  │
                           │ severity  │
                           │ confidence│
                           │ metadata  │
                           │ created_at│
                           └───────────┘
```

#### 4.2.2 详细表设计（部分示例）

**Users表**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    singpass_id VARCHAR(100) UNIQUE,
    avatar_url VARCHAR(255),
    language_preference VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    last_login TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_singpass_id ON users(singpass_id);
```

**Reports表**
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    subcategory_id UUID REFERENCES categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    postal_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    is_anonymous BOOLEAN DEFAULT FALSE,
    upvotes INT DEFAULT 0,
    verification_count INT DEFAULT 0,
    assigned_to UUID REFERENCES agency_users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    expected_resolution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_category_id ON reports(category_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_reports_created_at ON reports(created_at);
```

**Media表**
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL,
    original_url TEXT NOT NULL,
    thumbnail_url TEXT,
    content_type VARCHAR(100),
    file_size INT,
    width INT,
    height INT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX idx_media_report_id ON media(report_id);
```

**AI_Analysis表**
```sql
CREATE TABLE ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id),
    model_version VARCHAR(50) NOT NULL,
    detected_category VARCHAR(100),
    detected_subcategory VARCHAR(100),
    severity VARCHAR(20),
    confidence DECIMAL(5,4),
    detected_objects JSONB,
    raw_model_output JSONB,
    processing_time INT, -- in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_analysis_report_id ON ai_analysis(report_id);
CREATE INDEX idx_ai_analysis_media_id ON ai_analysis(media_id);
```

### 4.3 数据库性能优化

#### 4.3.1 索引策略
- 针对频繁查询字段创建索引
- 创建复合索引支持多字段查询
- 地理空间索引（GiST）用于位置查询
- 部分索引用于常用过滤条件

#### 4.3.2 查询优化
- 使用预编译查询
- 实现分页优化（keyset分页）
- 针对大型结果集使用流查询
- 实现查询超时机制

#### 4.3.3 数据分区策略
- 按时间范围分区报告数据
- 按区域分区地理空间数据
- 实现自动分区管理

## 5. 存储与文件管理

### 5.1 对象存储配置
- **提供商**：华为云OBS（对象存储服务）
- **存储桶划分**：
  - `singareport-media`：用户上传图像
  - `singareport-ai-processed`：AI处理后图像
  - `singareport-exports`：报告导出文件
  - `singareport-backups`：系统备份

### 5.2 文件处理流程
1. **上传流程**：
   - 客户端直接上传到OBS（使用预签名URL）
   - 限制大小（最大10MB）与类型（图像、PDF）
   - 并行上传多个文件
   - 上传进度跟踪

2. **处理流程**：
   - 图像压缩与优化
   - 自动生成多尺寸缩略图
   - 元数据提取（EXIF、位置）
   - 敏感内容检测

3. **分发策略**：
   - CDN集成用于快速交付
   - 按需生成文件URL
   - 过期机制和访问控制

## 6. 缓存与性能优化

### 6.1 多层缓存策略
1. **客户端缓存**：
   - 资源缓存策略（Cache-Control）
   - 应用状态持久化（localStorage/IndexedDB）
   - PWA缓存策略

2. **CDN缓存**：
   - 静态资源分发
   - 图像与媒体交付
   - 局部API响应缓存

3. **应用层缓存**：
   - Redis缓存常用数据
   - 缓存热门报告与统计
   - 缓存用户会话与权限

4. **数据库缓存**：
   - 查询结果缓存
   - 预先计算聚合视图
   - 物化视图更新策略

### 6.2 性能优化技术
- **API响应压缩**（gzip/brotli）
- **HTTP/2或HTTP/3支持**
- **资源打包与最小化**
- **惰性加载与渐进式加载**
- **数据预取与预加载**

## 7. 安全架构

### 7.1 安全架构图
```
┌──────────────────┐     ┌──────────────┐     ┌───────────────┐
│  华为云WAF防护   │────►│  DDoS防护    │────►│  API网关安全  │
└──────────────────┘     └──────────────┘     └───────┬───────┘
                                                      │
             ┌─────────────────────────────────┬─────┴─────┬────────────────┐
             │                                 │           │                │
             ▼                                 ▼           ▼                ▼
┌────────────────────┐        ┌─────────────────────┐   ┌────────┐   ┌───────────────┐
│  应用级安全        │        │  用户认证与授权     │   │ HTTPS  │   │ 漏洞扫描系统  │
│  - 输入验证        │        │  - JWT处理          │   │ TLS1.3 │   │ - 静态分析    │
│  - XSS防护         │        │  - OAuth流程        │   │        │   │ - 动态分析    │
│  - CSRF防护        │        │  - 访问控制列表     │                │ - 渗透测试    │
│  - SQL注入防护     │        │  - 会话管理         │                └───────────────┘
└────────────────────┘        └─────────────────────┘
             │                            │
             └────────────────┬───────────┘
                              │
                              ▼
                  ┌──────────────────────┐
                  │  数据安全            │
                  │  - 加密存储          │
                  │  - 传输加密          │
                  │  - 数据脱敏          │
                  │  - 访问审计          │
                  └──────────────────────┘
```

### 7.2 威胁防护措施
- **OWASP Top 10防护**：针对所有常见Web应用漏洞
- **自动化漏洞扫描**：定期安全测试与修复
- **数据泄露防护**：敏感数据识别与保护
- **IP信誉检查**：阻止可疑来源请求
- **行为异常检测**：识别异常用户活动

## 8. 监控与可观测性

### 8.1 监控架构
- **应用性能监控**：使用华为云APM（应用性能管理）
- **基础设施监控**：使用华为云AOM（应用运维管理）
- **日志聚合**：采用ELK栈（Elasticsearch, Logstash, Kibana）
- **分布式追踪**：使用OpenTelemetry与Jaeger
- **告警系统**：多渠道告警策略（邮件、SMS、消息应用）

### 8.2 关键指标
- **业务指标**：
  - 报告提交量
  - 解决率与平均解决时间
  - 用户活跃度
  - AI分析准确率
- **技术指标**：
  - API响应时间
  - 错误率
  - 资源使用率
  - 并发用户数

### 8.3 日志管理策略
- **结构化日志**：JSON格式标准化
- **日志级别策略**：环境特定日志配置
- **日志保留策略**：
  - 热数据：30天（全文索引）
  - 温数据：90天（聚合索引）
  - 冷数据：1年（归档存储）
- **敏感数据处理**：自动脱敏个人信息

## 9. 灾备与高可用性

### 9.1 高可用架构
- **多可用区部署**：跨可用区服务冗余
- **负载均衡**：华为云ELB（弹性负载均衡）
- **数据库高可用**：主-从复制，自动故障转移
- **服务弹性**：自动扩缩容策略

### 9.2 灾难恢复计划
- **RTO（恢复时间目标）**：<1小时
- **RPO（恢复点目标）**：<5分钟
- **定期灾备演练**：每季度一次
- **备份策略**：
  - 数据库：连续备份+每日快照
  - 应用状态：每小时快照
  - 配置文件：版本控制系统

## 10. DevOps与持续交付

### 10.1 CI/CD流程
- **源码管理**：Git，分支策略(GitFlow)
- **CI工具链**：华为云DevCloud
- **自动化测试**：
  - 单元测试（Jest, Pytest）
  - 集成测试（Cypress, Robot Framework）
  - API测试（Postman, SuperTest）
  - 性能测试（k6, JMeter）
- **部署策略**：
  - 蓝绿部署
  - 金丝雀发布
  - 特性标志

### 10.2 环境管理
- **环境一致性**：使用Docker确保环境一致
- **配置管理**：使用ConfigMaps与Secrets
- **基础设施即代码**：使用Terraform管理云资源

## 11. 未来可扩展性计划

### 11.1 水平扩展计划
- **无状态服务**：基于负载自动扩展
- **数据层扩展**：分片策略与读写分离
- **缓存层扩展**：Redis集群动态扩容

### 11.2 功能扩展路线图
- **实时协作**：
  - WebSocket集成用于实时更新
  - 多用户协作编辑
- **增强AI能力**：
  - 更复杂场景识别
  - 预测性维护建议
- **物联网集成**：
  - 智能传感器数据接入
  - 城市设备实时监控

## 12. 总结与实施时间表

### 12.1 关键技术亮点总结
- 基于Next.js的高性能响应式前端
- 微服务架构提供的灵活性与可扩展性
- PostgreSQL + PostGIS提供的强大地理空间能力
- Janus-Pro AI模型集成的智能分析能力
- 华为云基础设施提供的企业级可靠性

### 12.2 实施里程碑
1. **阶段一**（1-3个月）：基础架构与核心功能
   - 设计数据库架构
   - 实现用户认证与权限系统
   - 开发报告创建基础功能
   - 搭建CI/CD流程

2. **阶段二**（4-6个月）：AI集成与地图功能
   - Janus-Pro模型集成与微调
   - 开发地图可视化功能
   - 实现实时通知系统
   - 完善多语言支持

3. **阶段三**（7-9个月）：高级功能与性能优化
   - 开发社区验证功能
   - 实现智能推荐系统
   - 性能优化与缓存策略
   - 系统安全强化

4. **阶段四**（10-12个月）：上线准备与发布
   - 全面测试与性能评估
   - 用户接受度测试
   - 生产环境部署
   - 监控与支持体系建立 

# 地图显示问题分析与解决方案

经过代码检查，我发现目前首页和地图页面存在以下问题，导致地图无法正常显示：

## 问题分析

### 1. 首页和地图页面没有集成实际地图组件
- **首页代码**：目前使用了模拟加载（2秒），然后显示"地图预览暂不可用"的占位符
- **地图页代码**：同样使用模拟加载，显示"Interactive Map Placeholder"的占位符

### 2. 服务器端渲染兼容性问题
- MapContainer组件虽然有`'use client'`标记和isBrowser检查，但可能存在SSR问题
- Google Maps API需要在浏览器环境中加载和执行

### 3. API调用问题
- 401 Unauthorized错误表明身份验证有问题
- 额外的HTML属性警告可能源自Next.js和React组件渲染差异

## 解决方案

### 1. 修改首页地图实现

需要将首页中的占位符替换为实际的MapContainer组件：

```jsx
{/* 实时地图预览 */}
<section className="py-12 bg-white">
  <div className="container mx-auto px-4">
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10">实时热点地图</h2>
      <div className="relative h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-md">
        {isClient ? (
          <MapContainer zoom={11}>
            {/* 这里可以添加示例标记点 */}
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center bg-gray-100 h-full w-full">
            <p className="text-gray-500">地图加载中...</p>
          </div>
        )}
        <div className="absolute bottom-4 right-4">
          <Link
            href="/map"
            className="bg-white text-primary px-4 py-2 rounded-md shadow-md hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
          >
            查看完整地图 <FiArrowRight className="ml-1" />
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 2. 修改地图页面实现

替换地图页中的占位符为实际的MapContainer组件：

```jsx
{/* 地图视图 */}
<div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
  <div className="h-[600px] relative">
    {isClient ? (
      <MapContainer zoom={12}>
        {filteredReports.map((report) => (
          <MapMarker 
            key={report.id}
            position={{
              lat: report.location.latitude,
              lng: report.location.longitude
            }}
            onClick={() => handleMarkerClick(report)}
          />
        ))}
      </MapContainer>
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-2"></div>
          <p className="text-gray-500">地图加载中...</p>
        </div>
      </div>
    )}
  </div>
</div>
```

### 3. 强化地图组件的客户端检查

修改MapContainer.tsx中的客户端检查逻辑：

```jsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  GoogleMap, 
  useJsApiLoader,
  LoadScriptProps,
  LoadScript
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// 新加坡中心坐标
const defaultCenter = {
  lat: 1.3521,
  lng: 103.8198
};

// 地图API加载所需的库
const libraries: LoadScriptProps['libraries'] = ['places'];

interface MapContainerProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onClick?: (e: google.maps.MapMouseEvent) => void;
  children?: React.ReactNode;
}

export default function MapContainer({ 
  center = defaultCenter, 
  zoom = 12, 
  onClick, 
  children 
}: MapContainerProps) {
  const [isBrowser, setIsBrowser] = useState(false);
  
  // 检查是否在浏览器环境
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // 如果不是浏览器环境，返回加载占位符
  if (!isBrowser) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-gray-500">地图加载中...</div>
      </div>
    );
  }
  
  return (
    <ClientSideMapRenderer 
      center={center}
      zoom={zoom}
      onClick={onClick}
      children={children}
    />
  );
}

// 确保只在客户端渲染地图组件
function ClientSideMapRenderer({ 
  center, 
  zoom, 
  onClick, 
  children 
}: MapContainerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 如果加载出错，显示错误信息
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="text-red-500">地图加载失败，请刷新页面重试</div>
      </div>
    );
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onClick={onClick}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false
      }}
    >
      {children}
    </GoogleMap>
  ) : (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
```

### 4. 解决API密钥问题

检查环境变量中的API密钥是否正确，并确保该密钥有正确的域名权限：

- 确认`.env`文件中的`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`有效
- 在Google Cloud Console中检查API密钥的限制，确保允许localhost和您的部署域名

### 5. 修复认证错误

处理401 Unauthorized错误，这可能与用户认证有关：

```jsx:Huawei-demo/SingaReport_提案文件/SingaReport_网页应用技术提案.md
// 在AuthContext中添加错误处理和重试逻辑
const verifyAuth = async () => {
  try {
    const response = await fetch('/api/auth/verify');
    if (response.status === 401) {
      // 处理未认证情况，但不影响地图加载
      setUser(null);
      setIsLoading(false);
      return;
    }
    const data = await response.json();
    setUser(data.user);
  } catch (error) {
    console.error('Authentication verification error:', error);
    // 即使认证失败，也不影响地图功能
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};
```

## 实施步骤

1. 首先修改MapContainer组件，加强客户端检查逻辑
2. 更新首页和地图页面，使用实际的地图组件替换占位符
3. 添加isClient状态检查到所有地图相关组件
4. 确认API密钥设置正确
5. 最后解决认证相关问题

这些修改应该能解决地图无法显示的问题，让我们开始实施。需要我帮助修改具体文件吗？ 