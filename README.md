# Huawei-Demo: SingaReport 智慧城市解决方案

## 项目概述

本仓库包含三个主要组件：

1. **Janus AI 图像生成与分析**：基于Janus-Pro-7B模型的图像生成和分析系统，针对NVIDIA GPU优化。
2. **SingaReport 智慧城市解决方案**：一个完整的智慧城市解决方案提案，专为新加坡打造的基于华为云技术的市民参与平台。
3. **SingaReport_Web 前端应用**：基于Next.js和Tailwind CSS开发的现代化Web应用，实现了市民参与平台的用户界面。

## 目录结构

```
.
├── Janus/                      # Janus AI模型实现
│   ├── generation_inference.py # 图像生成推理脚本
│   ├── inference.py            # 基础推理脚本
│   ├── models/                 # 模型文件目录
│   ├── janus/                  # Janus模块代码
│   ├── requirements.txt        # 依赖项列表
│   └── README.md               # Janus项目说明
│
├── SingaReport_提案文件/        # 智慧城市解决方案提案
│   ├── SingaReport_智慧城市解决方案提案.md    # 主要解决方案文档
│   ├── SingaReport_演示摘要.txt              # 演示文稿大纲
│   ├── SingaReport_项目计划.txt              # 项目实施计划
│   └── README.md                            # 提案文件说明
│
└── SingaReport_Web/            # 前端Web应用
    ├── src/                    # 源代码目录
    │   ├── app/                # Next.js应用页面
    │   ├── components/         # 可复用组件
    │   └── lib/                # 工具函数和库
    ├── package.json            # npm依赖配置
    └── PROJECT_STATUS_REPORT.md # 项目状态报告
```

## Janus AI 模型说明

Janus模块是一个强大的多模态AI系统，基于Janus-Pro-7B模型，可以进行：
- 图像生成
- 图像分析与理解
- 多模态对话

该模块已针对有限内存的GPU（如RTX 3070 Ti）进行了优化，包含特殊的量化配置和设备映射，确保在普通硬件上也能高效运行。

## SingaReport 解决方案

SingaReport是一个智能城市反馈系统提案，专为新加坡打造，采用华为云作为核心基础设施：

- **用途**：让市民轻松报告城市问题、追踪解决进度，获取市政服务建议
- **核心技术**：基于微调的Janus-Pro视觉模型，专门识别新加坡路况问题
- **技术栈**：使用华为云ModelArts、MindSpore框架和华为云容器服务等
- **项目计划**：包含详细的12个月实施路线图

## SingaReport_Web 前端应用

SingaReport_Web是一个基于Next.js 14开发的现代化Web应用，为SingaReport项目提供用户界面：

- **技术栈**：Next.js、React、TypeScript、Tailwind CSS
- **主要功能**：
  - 用户登录和注册系统
  - 多步骤问题报告创建流程
  - 地图集成的问题可视化
  - 响应式设计，支持移动和桌面设备
- **开发状态**：已实现基本的认证和UI组件，正在进行数据库集成和报告功能开发

### 运行Web应用

```bash
# 进入Web应用目录
cd SingaReport_Web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将在 http://localhost:3000 运行。

## 安装与使用 (Janus)

### 系统要求
- Python 3.10+
- PyTorch 2.0+ 
- CUDA 12.0+（推荐）
- 最小8GB GPU内存
- 建议使用：NVIDIA RTX 3070 Ti或更高

### 安装依赖

```bash
# 安装依赖
cd Janus
pip install -r requirements.txt

# 或者直接安装主要依赖
pip install torch==2.0.1 transformers>=4.38.2 timm>=0.9.16 accelerate>=0.26.0 bitsandbytes>=0.41.0 sentencepiece attrdict einops pillow>=9.0.0 numpy>=1.24.0 diffusers tqdm
```

### 下载模型

Janus-Pro-7B模型需要单独下载。您可以从Hugging Face获取：
```bash
# 创建模型目录
mkdir -p Janus/models/Janus-Pro-7B

# 使用git-lfs下载模型
git lfs install
git clone https://huggingface.co/deepseek-ai/Janus-Pro-7B Janus/models/Janus-Pro-7B
```

### 运行图像生成

```bash
# 确保在正确的目录中
cd Janus

# 运行图像生成脚本
python generation_inference.py
```

## 常见问题解决

### GPU内存不足
如果遇到GPU内存不足的问题，可以尝试以下方法：
1. 在`generation_inference.py`中减少`parallel_size`参数值
2. 调整设备映射，将更多层放到CPU上
3. 确保启用了8位量化（BitsAndBytes配置）

### CUDA错误
如果遇到CUDA相关错误：
1. 确保已安装CUDA 12.0+
2. 检查PyTorch是否安装了CUDA支持版本
3. 可以通过`torch.cuda.is_available()`验证CUDA可用性

## 版权声明

- Janus模型基于DeepSeek开源许可
- SingaReport提案文件和Web应用为原创内容

## 联系方式

如有任何问题或需要进一步信息，请联系项目维护者。 