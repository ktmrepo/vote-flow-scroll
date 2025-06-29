# WPCS Poll - Interactive Polling Platform

A modern, interactive polling application built with React, TypeScript, and Supabase. Features a TikTok-style interface for browsing and voting on polls with comprehensive admin management and user features.

## 🌟 Key Features

### 🎯 Core Polling Features
- **Interactive Poll Cards**: TikTok-style swipeable interface for engaging poll browsing
- **Real-time Voting**: Instant vote recording with visual feedback and live updates
- **Smart Navigation**: Automatic progression to next polls with user preference prioritization
- **Vote History**: Track user voting patterns and comprehensive statistics
- **Categories & Tags**: Organized poll categorization system with filtering
- **Search & Filtering**: Advanced filtering by category, popularity, and voting status
- **Trending Polls**: Dynamically calculated trending polls based on engagement
- **Bookmarking**: Save and organize favorite polls for later viewing

### 👤 User Management
- **Secure Authentication**: Email/password authentication via Supabase Auth
- **User Profiles**: Customizable profiles with bio, location, website, and avatar
- **User Dashboard**: Centralized hub for user activities, statistics, and poll management
- **Vote History**: Complete voting history with detailed statistics and insights
- **Personal Analytics**: Track voting patterns, poll creation, and engagement metrics
- **Profile Customization**: Rich profile editing with social links and personal information

### 🔧 Admin Features
- **Comprehensive Admin Dashboard**: Full-featured admin panel with analytics and management tools
- **Poll Approval System**: Review and approve user-submitted polls before publication
- **Advanced Analytics**: 
  - Vote counts and engagement metrics
  - Popular categories and trending analysis
  - User engagement statistics
  - Real-time dashboard with key performance indicators
- **Bulk Operations**: 
  - Import polls from CSV/JSON files
  - Bulk user management and data import
  - Automated vote generation for testing
- **User Management**: Manage user roles, permissions, and account status
- **Content Moderation**: Review, approve, reject, and manage all user-generated content

### 🎨 User Interface & Experience
- **Responsive Design**: Mobile-first design with desktop optimization and touch-friendly controls
- **Modern Navigation**: Clean menubar with categorized navigation and breadcrumbs
- **Visual Feedback**: Smooth animations, transitions, and micro-interactions
- **Accessibility**: Screen reader friendly with proper ARIA labels and keyboard navigation
- **Progressive Web App**: Optimized for mobile devices with app-like experience
- **Dark/Light Theme**: Automatic theme detection with manual override options

### 📊 Analytics & Insights
- **Real-time Statistics**: Live vote counts, user engagement, and poll performance
- **Category Analytics**: Performance metrics by poll category and topic
- **User Engagement**: Track voting patterns, popular content, and user retention
- **Admin Analytics**: Comprehensive dashboard with charts, graphs, and key metrics
- **Export Capabilities**: Download analytics data and poll results

### 🛡️ Security & Performance
- **Row Level Security**: Supabase RLS policies for comprehensive data protection
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Real-time Updates**: Live vote count updates and instant synchronization
- **Optimized Queries**: Efficient database operations with caching strategies
- **Data Validation**: Client and server-side validation for all user inputs
- **Secure File Uploads**: Safe handling of user-uploaded content and media

### 🚀 Advanced Features
- **Smart Poll Navigation**: 
  - Prioritizes unvoted polls for logged-in users
  - Switches to random polls when category is exhausted
  - Automatic scroll-to-top on navigation
- **Auto-advance System**: Automatic progression to next poll after voting with cancel option
- **Social Sharing**: Share polls on social media platforms with custom URLs
- **SEO Optimization**: Clean URLs, meta tags, and search engine optimization
- **Bulk Upload System**: 
  - CSV import for polls, users, and votes
  - Template generation and validation
  - Progress tracking and error reporting

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks, functional components, and concurrent features
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first styling framework with custom design system
- **Shadcn/UI**: High-quality, accessible component library
- **React Router**: Client-side routing with dynamic URL generation
- **Tanstack Query**: Advanced data fetching, caching, and synchronization

### Backend & Database
- **Supabase**: Comprehensive Backend-as-a-Service providing:
  - PostgreSQL database with advanced features
  - Authentication system with social providers
  - Real-time subscriptions and live updates
  - Row Level Security (RLS) for data protection
  - Edge functions for serverless computing
  - File storage and CDN

### Key Components Architecture
- **PollCard**: Interactive poll display with voting interface
- **UserDashboard**: Comprehensive user management interface
- **AdminPanel**: Full-featured administrative controls
- **Navbar**: Responsive navigation with category filtering
- **ScrollIndicator**: Visual navigation aid for poll browsing
- **BulkUpload**: Advanced CSV import system with validation

## 🗄️ Database Schema

### Core Tables
1. **profiles**: Extended user information with roles and preferences
2. **polls**: Poll data with JSONB options, categories, and metadata
3. **votes**: Individual vote records with user associations and timestamps
4. **bookmarks**: User-saved polls for later viewing
5. **bulk_uploads**: Tracking system for bulk import operations

### Security Implementation
- **Comprehensive RLS policies** preventing unauthorized data access
- **Admin-only access** for sensitive operations and management
- **User data isolation** ensuring privacy and security
- **Audit trails** for all critical operations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wpcs-poll
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase project URL and anon key
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Run the provided SQL migrations in your Supabase dashboard
   - Set up Row Level Security policies
   - Create initial admin user

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### For Users
1. Visit the application homepage
2. Browse polls without authentication (read-only mode)
3. Sign up to vote, submit polls, and access personal features
4. Access user dashboard for history, statistics, and profile management

### For Admins
1. Create account with admin email
2. Have admin role assigned in database
3. Access admin panel via `/admin` or click on username when logged in
4. Manage polls, users, analytics, and system settings

## 📱 Mobile Experience

- **Touch-optimized interface** with swipe gestures
- **Responsive design** adapting to all screen sizes
- **Mobile navigation** with collapsible menus
- **Progressive Web App** features for app-like experience
- **Optimized performance** for mobile networks

## 🔮 Future Enhancements

### Planned Features
- **Push Notifications**: Real-time poll updates and engagement alerts
- **Social Features**: Comments, discussions, and user interactions
- **Advanced Analytics**: Machine learning insights and predictive analytics
- **Mobile App**: Native iOS and Android applications
- **API Access**: Public API for third-party integrations and developers
- **Gamification**: User levels, badges, and achievement systems
- **Live Polls**: Real-time collaborative polling sessions
- **Poll Templates**: Pre-built poll templates for common use cases

### Technical Improvements
- **Performance Optimization**: Virtual scrolling and advanced caching
- **Offline Support**: Service worker implementation for offline functionality
- **Advanced Search**: Full-text search with filters and suggestions
- **Internationalization**: Multi-language support and localization
- **Advanced Security**: Two-factor authentication and enhanced security measures

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Feature requests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com) for backend services
- UI components from [Shadcn/UI](https://ui.shadcn.com)
- Icons from [Lucide React](https://lucide.dev)
- Styling with [Tailwind CSS](https://tailwindcss.com)

---

**WPCS Poll** - Empowering voices through interactive polling 🗳️