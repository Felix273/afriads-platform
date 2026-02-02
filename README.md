# 🚀 AfriAds Platform

> A comprehensive advertising network platform connecting advertisers with publishers across Africa

[![GitHub](https://img.shields.io/badge/GitHub-Felix273-blue)](https://github.com/Felix273/afriads-platform)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

AfriAds Platform is a full-stack advertising solution that enables:
- **Advertisers** to create and manage ad campaigns with flexible bidding options
- **Publishers** to monetize their websites through various ad formats
- **Admins** to oversee platform operations and approve campaigns

## ✨ Features

### For Advertisers
- ✅ Campaign creation and management
- ✅ Multiple bidding strategies (CPM, CPC, CPA)
- ✅ Budget control (daily and total)
- ✅ Multiple ad formats (Display, Video, Native, Push, Interstitial)
- ✅ Real-time analytics and reporting
- ✅ Ad creative management

### For Publishers
- ✅ Website management
- ✅ Ad placement configuration
- ✅ Earnings tracking
- ✅ Performance analytics
- 🚧 Payout management (in development)

### Platform Features
- ✅ Secure authentication (JWT)
- ✅ Role-based access control
- ✅ Redis caching
- ✅ Rate limiting
- ✅ File upload support
- 🚧 Real-time bidding (in development)
- 🚧 Fraud detection (in development)

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js v5
- **Database:** PostgreSQL 14+
- **Cache:** Redis
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcryptjs
- **File Uploads:** Multer
- **Rate Limiting:** express-rate-limit

### Frontend
- **Framework:** React 19.2
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Date Handling:** date-fns
- **PDF Generation:** jsPDF

### DevOps
- **Version Control:** Git/GitHub
- **Package Manager:** npm
- 🚧 **Containerization:** Docker (planned)
- 🚧 **CI/CD:** GitHub Actions (planned)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis Server
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Felix273/afriads-platform.git
   cd afriads-platform
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file (see Environment Variables section)
   cp .env.example .env
   
   # Set up database
   psql -U postgres -d your_database -f database_schema.sql
   ```

3. **Set up the Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   ```

4. **Start Redis Server**
   ```bash
   redis-server
   ```

5. **Run the Application**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
afriads-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── uploads/         # File uploads directory
│   │   └── server.js        # Entry point
│   ├── database_schema.sql  # Database schema
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=afriads_db
DB_USER=postgres
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_PATH=./src/uploads

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "user_type": "advertiser",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "ABC Corp"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Campaign Endpoints

#### Create Campaign
```http
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer Sale 2024",
  "daily_budget": 100.00,
  "total_budget": 3000.00,
  "bid_type": "cpm",
  "bid_amount": 2.50,
  "start_date": "2024-06-01",
  "end_date": "2024-08-31"
}
```

#### Get All Campaigns
```http
GET /api/campaigns
Authorization: Bearer <token>
```

#### Get Campaign by ID
```http
GET /api/campaigns/:id
Authorization: Bearer <token>
```

For complete API documentation, see [API_DOCS.md](./API_DOCS.md) (coming soon)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Roadmap

- [x] User authentication and authorization
- [x] Campaign management
- [x] Ad creative management
- [x] Basic analytics dashboard
- [ ] Complete impression and click tracking
- [ ] Fraud detection system
- [ ] Payment gateway integration
- [ ] Advanced targeting options
- [ ] Admin panel
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Felix** - [GitHub](https://github.com/Felix273)

## 🙏 Acknowledgments

- Create React App for the frontend boilerplate
- Express.js community for excellent documentation
- All contributors and testers

## 📞 Support

For questions or support, please:
- Open an issue on GitHub
- Contact: [Your Email/Contact Info]

---

**Status:** 🚧 Active Development  
**Version:** 1.0.0  
**Last Updated:** February 2026
