# Huawei-Demo: SingaReport Smart City Solution

![SingaReport Logo](SingaReport_Web/public/logo.png)

## Project Overview

SingaReport is a comprehensive smart city solution designed specifically for Singapore, leveraging Huawei Cloud infrastructure and advanced AI technology. This revolutionary mobile and web platform aims to enhance interaction between Singapore citizens and the government by enabling easy reporting of urban issues, tracking resolution progress, and receiving personalized municipal service recommendations.

### Problem Statement

Singapore, as a leading smart city globally, faces the following challenges:
- Cumbersome and fragmented processes for citizens to report municipal issues
- Lack of transparent issue resolution tracking systems
- Need for more efficient identification and classification of urban infrastructure problems (especially road conditions)
- Insufficient accessibility to municipal service information

### Value Proposition

SingaReport addresses these challenges through:
- **One-stop problem reporting platform**: Integrating all municipal issue reporting channels
- **AI-driven automatic classification**: Utilizing our vision AI model optimized for Singapore's road conditions
- **Transparent tracking system**: Real-time updates on processing progress
- **Intelligent conversational assistant**: Providing personalized guidance on municipal services

## Core Components

### 1. Janus AI Module

The Janus AI module is an advanced multimodal AI system based on the Janus-Pro-7B model that offers:

- **Image Generation**: Convert text descriptions into high-quality images
- **Image Analysis & Understanding**: Extract information and insights from uploaded images
- **Multimodal Dialogue**: Process and respond to queries containing both text and images

The module has been specifically optimized for limited-memory GPUs (such as RTX 3070 Ti) through:
- 8-bit quantization
- Efficient device mapping
- Balanced CPU-GPU memory utilization

#### Singapore Road Condition Vision Recognition System

The system features a fine-tuned Janus-Pro-7B multimodal large language model specialized in identifying Singapore's unique road issues:

- **Training Data**: Dataset of road images from various regions of Singapore, under different weather conditions and times
- **Recognition Capabilities**:
  - Road damage (potholes, cracks, uneven surfaces)
  - Traffic sign issues (damaged, obstructed)
  - Drainage system blockages (particularly adapted to Singapore's rainy climate)
  - Illegal parking and obstacles
  - Construction site-related road issues

- **Technical Implementation**:
  - QLoRA (Quantized Low-Rank Adaptation) fine-tuning method for optimized model performance on edge devices
  - Huawei Cloud ModelArts automated AI training platform for model fine-tuning and deployment
  - Huawei Cloud Atlas training cluster to accelerate the training process and reduce fine-tuning time
  - Huawei MindSpore framework's mixed precision training to improve training efficiency and optimize model size

### 2. SingaReport Smart City Solution

SingaReport is an intelligent city feedback system proposal designed specifically for Singapore using Huawei Cloud as the core infrastructure:

- **Purpose**: Enable citizens to easily report urban issues, track resolution progress, and receive municipal service recommendations
- **Core Technology**: Fine-tuned Janus-Pro vision model specialized in identifying Singapore-specific urban issues
- **Technical Stack**: Utilizing Huawei Cloud ModelArts, MindSpore framework, and Huawei Cloud Container Services
- **Architecture**: Microservices architecture with dedicated user service, report service, notification service, and AI analysis service
- **Implementation Plan**: Includes a detailed 12-month implementation roadmap with milestone deliverables

#### Conversational AI Assistant

An intelligent municipal service assistant developed based on the latest LLM technology:
- Support for English, Chinese, Malay, and Tamil languages
- Personalized recommendation engine
- Context-aware conversational capabilities
- Location-aware service suggestions

### 3. SingaReport_Web Frontend Application

SingaReport_Web is a modern web application developed with Next.js 14, providing the user interface for the SingaReport project:

- **Technical Stack**: Next.js 14, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM
- **Key Features**:
  - User authentication system (registration, login, profile management)
  - Multi-step issue reporting workflow with image upload
  - Interactive map visualization of reported issues
  - Real-time issue tracking and status updates
  - Responsive design supporting mobile and desktop devices
  - Administrative dashboard for issue management
- **Development Status**: Authentication system, core UI components, and database integration implemented; map integration and notification system in progress

#### Citizen Reporting Platform

1. **Problem Reporting**:
   - Photo/video upload (supporting AI automatic analysis)
   - Location marking (GPS + manual adjustment)
   - Problem classification and description
   - Anonymous reporting option

2. **Tracking System**:
   - Real-time status updates
   - Processing time estimates
   - Transparent resolution process
   - Notification push system

3. **Community Engagement**:
   - Problem verification mechanism
   - Public dashboard showcasing hotspot problem areas
   - Community voting system

#### Intelligent Municipal Assistant

1. **Service Navigation**:
   - Personalized service recommendations
   - Step-by-step guidance
   - Document requirement checklist

2. **Information Retrieval**:
   - Location-related service inquiries
   - Intelligent answers to frequently asked questions
   - Regulation explanation and simplification

3. **Personal Assistant Functions**:
   - Service appointment management
   - Document submission reminders
   - Deadline reminders

## System Architecture

SingaReport employs a modern microservices architecture:

```
                  ┌───────────────┐
                  │   User Device │
                  │(Mobile/Web)   │
                  └───────┬───────┘
                          │
                          ▼
┌────────────────────────────────────────────────┐
│         Huawei Cloud CDN/WAF Protection        │
└────────────────────────┬───────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────┐
│            API Gateway (APIG Service)          │
└┬──────────┬──────────┬──────────┬──────────────┘
 │          │          │          │
 ▼          ▼          ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐
│User  │ │Report│ │Notifi│ │AI Analysis   │
│Svc   │ │Svc   │ │cation│ │Service       │
└──┬───┘ └──┬───┘ └──┬───┘ └──────┬───────┘
   │        │        │            │
   └────────┼────────┼────────────┘
            │        │
            ▼        ▼
┌───────────────┐ ┌───────────────┐
│ Relational DB │ │ Message Queue │
└───────────────┘ └───────────────┘
        │                 │
        │                 ▼
        │         ┌───────────────┐
        │         │ Object Storage│
        │         └───────────────┘
        ▼
┌───────────────┐
│ Geospatial DB │
└───────────────┘
```

### Technical Implementation Details

#### Frontend Technology Stack
- **Mobile Application**: React Native + TypeScript
- **Web Platform**: Next.js + Tailwind CSS
- **State Management**: Redux Toolkit
- **Map Integration**: Mapbox + Custom Layers

#### Backend Technology Stack
- **API Framework**: FastAPI + Python 3.11
- **Microservice Orchestration**: Kubernetes + Docker
- **Message Queue**: RabbitMQ
- **Databases**: PostgreSQL + PostGIS + MongoDB
- **Cache**: Redis

#### AI Technology Stack
- **Vision Model**:
  - Fine-tuned Janus-Pro-7B multimodal model (using QLoRA technology)
  - Huawei Cloud ModelArts platform for full-process AI development
  - Huawei MindSpore framework for model quantization and inference optimization
- **NLP Engine**:
  - Custom LLM adapters based on Huawei Pangu model
  - Named entity recognition optimized for Singapore's multilingual environment
- **Machine Learning Framework**:
  - Huawei MindSpore as the primary framework
  - PyTorch and HuggingFace Transformers for auxiliary development
- **MLOps**:
  - Huawei Cloud ModelArts one-stop MLOps platform
  - Huawei Cloud Data Governance Center (DGC) ensuring data quality
  - Huawei Cloud AI lifecycle management and Model as a Service (MaaS)

#### Cloud Services and Infrastructure
- **Primary Cloud Platform**: HUAWEI CLOUD
  - Singapore local data center, providing low-latency access
  - Compliant with Singapore IMDA multi-tier cloud security standards
  - Comprehensive government cloud solutions and compliance certifications
- **AI Acceleration**:
  - Huawei Cloud ModelArts providing full-process AI development platform
  - Huawei Cloud Atlas training cluster (for model training)
  - Huawei Cloud AI inference engine optimizing inference performance
- **Data Management**:
  - Huawei Cloud Object Storage Service (OBS) for large-scale image storage
  - Huawei Cloud Data Lake Insight (DLI) for unstructured data analysis
- **Container Orchestration**:
  - Huawei Cloud Container Engine (CCE) for microservice deployment
  - Huawei Cloud Application Orchestration Service (AOS) for application lifecycle management
- **Monitoring**:
  - Huawei Cloud Application Operations Management (AOM)
  - Huawei Cloud Application Performance Management (APM)

## Directory Structure

```
.
├── Janus/                      # Janus AI model implementation
│   ├── generation_inference.py # Image generation inference script
│   ├── inference.py            # Base inference script
│   ├── interactivechat.py      # Multimodal chat implementation
│   ├── models/                 # Model files directory
│   ├── janus/                  # Janus module code
│   ├── images/                 # Sample images for testing
│   ├── demo/                   # Demo application
│   └── README.md               # Janus project documentation
│
├── SingaReport_提案文件/        # Smart city solution proposal
│   ├── SingaReport_网页应用技术提案.md  # Technical proposal document
│   └── README.md                        # Proposal files documentation
│
└── SingaReport_Web/            # Frontend Web application
    ├── src/                    # Source code directory
    │   ├── app/                # Next.js application pages
    │   │   ├── (auth)/         # Authentication routes
    │   │   ├── (dashboard)/    # User dashboard routes
    │   │   ├── (public)/       # Public pages
    │   │   ├── api/            # API routes
    │   │   ├── help/           # Help pages
    │   │   ├── page.tsx        # Landing page
    │   │   └── layout.tsx      # Root layout
    │   ├── components/         # Reusable components
    │   ├── contexts/           # React contexts
    │   ├── lib/                # Utility functions and libraries
    │   ├── scripts/            # Helper scripts
    │   └── types/              # TypeScript type definitions
    ├── prisma/                 # Database schema and migrations
    ├── public/                 # Static assets
    ├── .env                    # Environment configuration
    ├── next.config.js          # Next.js configuration
    ├── package.json            # npm dependencies
    └── PROJECT_STATUS_REPORT.md # Detailed project status report
```

## Installation and Setup

### Prerequisites
- Node.js 18+ for SingaReport_Web
- Python 3.10+ for Janus AI
- PostgreSQL 14+ database
- NVIDIA GPU with minimum 8GB VRAM for full Janus AI functionality
- Docker and Docker Compose (optional for containerized deployment)

### Setting up the Web Application

1. Clone the repository:
```bash
git clone https://github.com/your-organization/Huawei-demo.git
cd Huawei-demo
```

2. Install Web application dependencies:
```bash
cd SingaReport_Web
npm install
```

3. Configure environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
# Required: DATABASE_URL, JWT_SECRET, NEXTAUTH_URL, etc.
```

4. Set up the database:
```bash
# Run the database setup script
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000.

### Setting up Janus AI

1. Install Python dependencies:
```bash
cd Janus
pip install -r requirements.txt
```

2. Download the Janus-Pro-7B model:
```bash
# Create model directory
mkdir -p models/Janus-Pro-7B

# Download model using git-lfs
git lfs install
git clone https://huggingface.co/deepseek-ai/Janus-Pro-7B models/Janus-Pro-7B
```

3. Run the image generation sample:
```bash
python generation_inference.py
```

## Usage Examples

### Citizen Reporting Workflow

1. **User Registration and Login**:
   - Citizens register with their NRIC/FIN, email, and phone number
   - Verification via SMS/email for account security

2. **Issue Reporting**:
   - Step 1: Select issue category (Infrastructure, Environment, Safety, etc.)
   - Step 2: Capture and upload images of the issue
   - Step 3: Enter location details (auto-detected or manually selected)
   - Step 4: Provide description and severity assessment
   - Step 5: Submit report and receive confirmation

3. **Tracking and Updates**:
   - Dashboard view of all submitted reports
   - Status updates as the issue progresses through resolution stages
   - Option to provide additional information if requested
   - Notification when issue is resolved

### Administrator Functions

1. **Issue Management**:
   - Review incoming reports
   - Assign to appropriate departments
   - Set priority levels
   - Update status
   - Request additional information

2. **Analytics Dashboard**:
   - Heatmap of issue concentrations
   - Statistics by issue type, location, and resolution time
   - Trend analysis of recurring issues
   - Performance metrics for resolution efficiency

## Security and Privacy Safeguards

- End-to-end encryption technology
- Image privacy protection (automatic blurring of faces and license plates)
- Strict compliance with PDPA (Singapore Personal Data Protection Act)
- Comprehensive protection mechanisms provided by Huawei Cloud Data Security Center
- Real-time security monitoring provided by Huawei Cloud Professional Security Operations Services (SOCS)
- Zero-trust architecture design principles
- Regular security audits and penetration testing

## Innovation Highlights and Differentiation

### Technical Innovation
- **Localized Vision AI**: Optimized for Singapore's specific urban environment
- **Multimodal Processing**: Integration of image, text, and geolocation data
- **Edge AI Processing**: Partial image analysis completed on the device side, protecting privacy
- **Decentralized Verification**: Community-involved problem verification mechanism

### User Experience Innovation
- **Seamless Integration into Daily Life**: Integration with existing social platforms
- **Ultra-Low Resistance Reporting**: Three-step quick problem reporting process
- **Multilingual Support**: Covering all official languages of Singapore
- **Adaptive Interface**: Adjusting feature layout based on user habits

## API Reference

SingaReport_Web provides the following API endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Update password

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get report details
- `PUT /api/reports/[id]` - Update report
- `DELETE /api/reports/[id]` - Delete report

### Media
- `POST /api/upload` - Upload media files
- `GET /api/media/[id]` - Get media file

## Deployment

### Development Environment
- Local development server with hot reloading
- Local PostgreSQL database
- MockAPI for third-party service simulation

### Production Environment (Huawei Cloud)
- Containerized application hosted on Huawei CCE
- Auto-scaling based on traffic patterns
- PostgreSQL on Huawei RDS
- Static assets served through Huawei OBS and CDN
- API Gateway for request routing and rate limiting

## License

- Janus model is licensed under DeepSeek open source license
- SingaReport proposal documents and Web application are original content 