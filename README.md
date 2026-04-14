# AI Payroll Assistant

## Overview

The AI Payroll Assistant is a Flask-based web application that guides small businesses through payroll setup and configuration processes. The application features an interactive chat interface with a conversational AI assistant that helps users configure payroll schedules, earning codes, tax obligations, and employee management. The system is designed for businesses with 1-50 employees operating in 1-2 states maximum, providing a simplified yet comprehensive payroll management solution.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single-page application** using vanilla JavaScript with modular component architecture
- **Chat-based interface** as the primary user interaction method with floating progress indicators
- **Progressive disclosure** pattern through multi-step workflows (welcome flow, tax configuration, earnings setup)
- **Responsive design** with panel-based layout supporting toggle between full-screen chat and split-panel views
- **State management** through dedicated JavaScript modules (ProgressManager, FloatingRenderer, ButtonStrategy)
- **Animation system** using GSAP and canvas-confetti for user engagement and celebration effects

### Backend Architecture
- **Flask web framework** with SQLAlchemy ORM for database operations
- **RESTful API design** with dedicated endpoints for database status and workflow management
- **Environment-based configuration** for database connections and session management
- **Modular Python structure** separating models, database configuration, and application logic

### Data Storage Solutions
- **SQLAlchemy ORM** with declarative base model architecture
- **Relational database schema** supporting:
  - PayrollSchedule: Frequency, pay dates, and period management
  - EarningCode: Rate types, overtime configurations, and code management
  - Employee: Workforce management and tracking
  - PayrollRun: Historical payroll processing records
  - ChatHistory: Conversation persistence and user interaction tracking
- **Database connection pooling** with automatic reconnection and health monitoring

### Authentication and Authorization
- **Session-based authentication** using Flask's built-in session management
- **Environment variable configuration** for session secrets and security settings
- **Database-level access control** through application layer validation

### Workflow Management
- **Multi-step guided workflows** including:
  - Welcome flow with role assessment and company profiling
  - Company info confirmation with celebration and conversation collapse
  - Bank account setup following company confirmation
  - Tax configuration with document analysis and compliance checking
  - Earnings code setup with overtime calculation support
  - Pay schedule configuration with calendar simulation
- **Progress tracking system** with floating indicators and section completion detection
- **State persistence** across workflow steps with recovery capabilities
- **Conversation collapse** feature to minimize previous threads when transitioning between major sections

### User Experience Features
- **Conversational AI interface** with context-aware responses and guided questioning
- **Document upload and analysis** for tax configuration automation
- **Interactive forms** with conditional logic and validation
- **Real-time progress visualization** through floating renderers and progress managers
- **Celebration animations** for workflow completion milestones

## External Dependencies

### Frontend Libraries
- **Google Fonts**: Inter font family and Material Icons for consistent typography and iconography
- **Particles.js**: Background particle effects for visual enhancement
- **GSAP (GreenSock)**: Advanced animation library for smooth transitions and effects
- **Canvas Confetti**: Celebration animations for workflow completion
- **Chart.js**: Data visualization for payroll analytics and reporting

### Backend Dependencies
- **Flask**: Core web framework for application structure
- **SQLAlchemy**: Database ORM for data modeling and query management
- **Flask-SQLAlchemy**: Flask integration for SQLAlchemy with application context management

### Database Integration
- **PostgreSQL**: Primary database engine (configurable via DATABASE_URL environment variable)
- **Connection pooling**: Automatic pool management with health checks and reconnection logic
- **Migration support**: Through SQLAlchemy's declarative base for schema evolution

### Business Logic Integrations
- **Tax compliance**: Built-in tax rate calculations and NAICS code validation
- **Payroll calculations**: Support for multiple pay frequencies, overtime rules, and earnings code combinations
- **Document processing**: Tax document analysis and extraction capabilities for automated configuration

### Development and Deployment
- **Environment variable configuration**: For database URLs, session secrets, and feature flags
- **Static file serving**: Direct serving of CSS, JavaScript, and asset files
- **Error handling**: Comprehensive error catching with user-friendly messaging
- **Logging**: Built-in debugging and progress tracking for workflow monitoring