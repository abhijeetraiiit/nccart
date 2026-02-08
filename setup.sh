#!/bin/bash

# NCCart Development Setup Script
# This script sets up the development environment for NCCart

set -e  # Exit on error

echo "🚀 NCCart Development Environment Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher (current: $(node -v))${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found${NC}"
    echo "You'll need PostgreSQL 14+ installed and running"
    echo "Install from: https://www.postgresql.org/download/"
else
    echo -e "${GREEN}✅ PostgreSQL client found${NC}"
fi

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git $(git --version)${NC}"

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root workspace dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Setup environment files
echo "🔧 Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration${NC}"
else
    echo -e "${GREEN}✅ backend/.env already exists${NC}"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local from .env.example..."
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✅ frontend/.env.local created${NC}"
else
    echo -e "${GREEN}✅ frontend/.env.local already exists${NC}"
fi

echo ""

# Database setup
echo "🗄️  Database setup..."
echo ""
echo "Please ensure PostgreSQL is running and you have created a database."
echo "Example:"
echo "  createdb nccart"
echo ""
read -p "Have you created the database? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Generating Prisma client..."
    cd backend
    npx prisma generate
    
    echo "Running database migrations..."
    npx prisma migrate dev --name init
    
    echo -e "${GREEN}✅ Database setup complete${NC}"
    cd ..
else
    echo -e "${YELLOW}⚠️  Skipping database setup. Run manually later:${NC}"
    echo "  cd backend"
    echo "  npx prisma generate"
    echo "  npx prisma migrate dev"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "  npm run dev          # Start both backend and frontend"
echo "  npm run dev:backend  # Start backend only (port 5000)"
echo "  npm run dev:frontend # Start frontend only (port 3000)"
echo ""
echo "📚 Additional commands:"
echo "  cd backend && npm run db:studio  # Open Prisma Studio"
echo "  cd backend && npm run db:migrate # Run migrations"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  Health:   http://localhost:5000/health"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
