# Golf Charity Subscription Platform

A modern, full-stack e-commerce style golf charity subscription platform where golfers can subscribe to monthly/annual plans, submit scores, enter draws, and support charitable causes while winning prizes.

[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-blue)](https://stripe.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)](https://vercel.com/)

## 🚀 Live Demo

- **Frontend**: [https://golf-charity-platform.vercel.app](https://golf-charity-platform.vercel.app)
- **API**: [https://golf-charity-api.vercel.app](https://golf-charity-api.vercel.app)

## ✨ Key Features

### 🛍️ E-Commerce Experience
- **Modern UI/UX**: Premium e-commerce design with Framer Motion animations
- **Shopping Cart**: Full cart functionality with add/remove/update items
- **Product Cards**: Animated cards with hover effects, badges, and pricing
- **Responsive Design**: Mobile-first approach with smooth animations

### 🎮 Golf Features
- **Monthly/Annual Subscriptions**: Stripe-powered payment processing
- **Score Tracking**: Submit Stableford scores (1-45), keeps latest 5
- **Monthly Draws**: Random/frequency-based winner selection
- **Winner Verification**: Upload proof of wins for approval
- **Charity Support**: 10%+ contribution to selected charities

### 👨‍💼 Admin Dashboard
- **User Management**: View and manage user accounts
- **Subscription Management**: Track active/expired subscriptions
- **Score Oversight**: Edit user scores when needed
- **Draw Simulation**: Run and publish monthly draws
- **Winner Verification**: Review and approve winner proofs

### 🔐 Security & Auth
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin and User roles
- **Protected Routes**: Route-level protection for sensitive pages
- **Error Boundaries**: Graceful error handling

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **TypeScript** throughout
- **MongoDB** with Mongoose
- **Stripe** for payments
- **JWT** for authentication
- **Nodemailer** for emails
- **Multer** for file uploads

### Infrastructure
- **Vercel** for hosting
- **MongoDB Atlas** for database
- **Stripe** for payment processing
- **GitHub Actions** for CI/CD

## 📁 Project Structure

```
golf-charity-subscription-platform/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React contexts (Cart)
│   │   ├── store/          # Redux store
│   │   └── api/            # API configuration
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── config/         # Configuration files
│   ├── scripts/           # Database scripts
│   └── package.json
├── .github/workflows/       # CI/CD workflows
├── docker-compose.yml      # Docker setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for payments)
- GitHub account (for deployment)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/golf-charity-platform.git
cd golf-charity-subscription-platform

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Environment Setup

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/golf-charity
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_MONTHLY=price_your_monthly_price_id
STRIPE_PRICE_YEARLY=price_your_yearly_price_id

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@golfcharity.com

# Admin Bootstrap
ADMIN_EMAIL=admin@golfcharity.com
ADMIN_PASSWORD=securepassword123

# Winner Proof Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

#### Frontend (.env)
```bash
cd ../frontend
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:4000
```

### 3. Database Setup

```bash
# Seed the database with test data
cd ../backend
npm run seed
```

This creates:
- 5 test charities
- 5 test users (including admin)
- Sample subscriptions and scores

**Test Accounts:**
- **Admin**: admin@golfcharity.com / password123
- **User 1**: john.doe@example.com / password123 (Active Monthly)
- **User 2**: jane.smith@example.com / password123 (Active Yearly)
- **User 3**: mike.wilson@example.com / password123 (Active Monthly)
- **User 4**: sarah.jones@example.com / password123 (Expired)

### 4. Run Development Servers

```bash
# From root directory
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

### 5. Stripe Setup (for payments)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Create products and pricing:
   - Monthly Plan: $29.99/month
   - Yearly Plan: $299.99/year
4. Add price IDs to your `.env` file
5. Install Stripe CLI for webhook testing:
   ```bash
   stripe listen --forward-to localhost:4000/api/webhooks/stripe
   ```
```

3. **Start Development Servers**
```bash
# From root directory
npm run dev
```

This starts:
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

### Environment Variables

#### Backend (.env)
```env
# Database (choose one)
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>"
SUPABASE_URL="https://<project-id>.supabase.co"
SUPABASE_ANON_KEY="<supabase-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<supabase-service-role-key>"

# Authentication
JWT_SECRET="your-long-random-secret"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
CORS_ORIGIN="http://localhost:5173"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY_ID="price_..."
STRIPE_PRICE_YEARLY_ID="price_..."
STRIPE_SUCCESS_URL="http://localhost:5173/subscription?success=1"
STRIPE_CANCEL_URL="http://localhost:5173/subscription?canceled=1"

# Pricing (in cents)
PRICE_MONTHLY_AMOUNT_CENTS=1000
PRICE_YEARLY_AMOUNT_CENTS=10000

# Email (optional)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="no-reply@example.com"

# Admin Bootstrap
ADMIN_BOOTSTRAP_EMAIL="admin@example.com"
ADMIN_BOOTSTRAP_PASSWORD="change-me-strong-password"
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:4000"
```

## 🌐 Deployment Guides

### Option 1: Vercel (Recommended for Beginners)

#### Step 1: Prepare Your Repository
```bash
# Make sure everything is committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### Step 2: Deploy Frontend to Vercel

1. **Go to [vercel.com](https://vercel.com) and sign up/login**

2. **Create New Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your frontend is now live! 🎉

#### Step 3: Deploy Backend to Vercel

1. **Create Another Vercel Project**
   - Import the same repository
   - This time, set Root Directory to `./` (root)

2. **Configure Build Settings**
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `backend/dist`

3. **Add ALL Environment Variables**
   ```
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   
   # Stripe
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_MONTHLY=price_...
   STRIPE_PRICE_YEARLY=price_...
   
   # Email (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=noreply@golfcharity.com
   
   # Admin
   ADMIN_EMAIL=admin@golfcharity.com
   ADMIN_PASSWORD=securepassword123
   ```

4. **Deploy Backend**
   - Click "Deploy"

5. **Update Frontend Environment**
   - Go back to your frontend project in Vercel
   - Update `VITE_API_URL` to your new backend URL
   - Redeploy frontend

#### Step 4: Configure Stripe Webhooks (Important!)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Developers" → "Webhooks"
3. Add endpoint:
   - **URL**: `https://your-backend.vercel.app/api/webhooks/stripe`
   - **Events**: Select all checkout and subscription events
4. Copy the webhook signing secret
5. Add to backend environment variables: `STRIPE_WEBHOOK_SECRET`

### Option 2: Docker Deployment (Recommended for Full Control)

#### Step 1: Create Dockerfile for Backend

Create `/backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]
```

#### Step 2: Create Dockerfile for Frontend

Create `/frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Step 3: Create Docker Compose

Create `/docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:4000

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

#### Step 4: Deploy with Docker
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: VPS/Cloud Server (DigitalOcean, AWS, Linode)

#### Step 1: Server Setup
```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install MongoDB (or use MongoDB Atlas)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

#### Step 2: Deploy Application
```bash
# Clone repository
cd /var/www
git clone https://github.com/yourusername/golf-charity-platform.git
cd golf-charity-subscription-platform

# Install dependencies
npm install
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build

# Setup environment
cd ../backend
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start dist/server.js --name "golf-charity-api"
pm2 save
pm2 startup

# Setup frontend (use nginx to serve)
# Copy frontend/dist to /var/www/html
```

#### Step 3: Nginx Configuration
```bash
# Install nginx
apt install nginx -y

# Create config
cat > /etc/nginx/sites-available/golf-charity << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/golf-charity /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

#### Step 4: SSL with Let's Encrypt
```bash
# Install certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

## 📊 Post-Deployment Checklist

### Essential Tasks
- [ ] Stripe webhooks configured
- [ ] Environment variables set
- [ ] Database connected
- [ ] Admin account created
- [ ] Test signup flow
- [ ] Test payment flow
- [ ] Test subscription status
- [ ] Test score submission
- [ ] Email notifications working (if enabled)

### Monitoring
- [ ] Error tracking (Sentry recommended)
- [ ] Analytics (Google Analytics/Plausible)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Database backups configured
- [ ] Log aggregation

### Security
- [ ] JWT secrets are strong and unique
- [ ] Stripe keys are production keys (not test)
- [ ] Database is secured (whitelist IPs)
- [ ] File upload limits configured
- [ ] Rate limiting enabled

## 📊 Database Schema

### Core Collections
- **users**: User profiles, charity selection, contribution percentages
- **subscriptions**: Stripe integration, plan management, status tracking
- **scores**: Golf scores with 5-score rolling logic
- **charities**: Charity directory and management
- **draws**: Monthly draw configuration and results
- **winners**: Winner verification and payout tracking

### Key Relationships
- Users → Subscriptions (1:1)
- Users → Scores (1:N, max 5)
- Users → Charities (N:1)
- Draws → Winners (1:N)

## 🎯 Business Logic

### Score Management
- Users maintain exactly 5 scores
- New scores replace the oldest automatically
- Scores validated in Stableford format (1-45)
- Chronological ordering with newest first

### Draw System
- Monthly draws with 5 random numbers (1-45)
- Three prize tiers: 3-match (25%), 4-match (35%), 5-match (40%)
- Jackpot rollover when no 5-match winners
- Algorithmic mode available (frequency-based)

### Prize Pool Calculation
```
Total Pool = (Active Subscribers × Monthly Price) - Charity Contributions
3-Match Pool = 25% of Total Pool
4-Match Pool = 35% of Total Pool  
5-Match Pool = 40% of Total Pool + Previous Rollover
```

### Charity Contributions
- Minimum 10% of subscription fee
- User can increase contribution percentage
- Direct donations also supported

## 🔧 Development

### Project Structure
```
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # API route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── validators/      # Input validation
│   └── uploads/             # File uploads
├── frontend/
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── store/          # Redux store
└── README.md
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Subscription
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/checkout` - Create checkout session

#### Scores
- `GET /api/scores` - Get user scores
- `POST /api/scores` - Add new score
- `PUT /api/scores/:id` - Update score

#### Draws
- `GET /api/draws/current` - Get current draw
- `POST /api/admin/draws/simulate` - Simulate draw
- `POST /api/admin/draws/publish` - Publish draw results

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Subscription flow (monthly and yearly)
- [ ] Score entry and 5-score rolling logic
- [ ] Draw system simulation and publishing
- [ ] Charity selection and contribution calculation
- [ ] Winner verification flow
- [ ] Admin dashboard functionality
- [ ] Email notifications
- [ ] Mobile responsiveness

### Test Credentials
After first run with admin bootstrap:
- **Admin**: admin@example.com / change-me-strong-password
- **Test User**: Register via frontend

## 🔒 Security

- JWT authentication with secure secret keys
- Stripe webhook signature verification
- File upload validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Input validation with Zod schemas

## 📈 Analytics & Reporting

### Admin Dashboard Metrics
- Total users and subscription counts
- Prize pool and contribution totals
- Draw statistics and winner analytics
- Charity impact metrics

### User Dashboard
- Subscription status and renewal dates
- Score history and participation summary
- Winnings overview and payment status
- Charity contribution tracking

## 🌍 Internationalization

Platform designed for multi-country expansion:
- Currency-agnostic pricing
- Localizable charity directories
- Multi-language ready architecture
- Timezone-aware scheduling

## 📱 Mobile App Readiness

Codebase structured for future mobile development:
- API-first architecture
- Responsive design patterns
- Authentication system ready for mobile
- Offline capability considerations

## 🤝 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Contact development team

## 📄 License

This project is proprietary and owned by Digital Heroes.

---

**Built by Digital Heroes**  
*Premium Full-Stack Development & Digital Marketing Agency*  
[https://digitalheroes.co.in](https://digitalheroes.co.in)
