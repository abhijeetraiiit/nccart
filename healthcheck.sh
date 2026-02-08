#!/bin/bash

# NCCart - Check System Health
# This script verifies that all services are running correctly

set -e

echo "🏥 NCCart Health Check"
echo "====================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# Check Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓ $(node -v)${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ $(npm -v)${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check PostgreSQL
echo -n "PostgreSQL: "
if command -v psql &> /dev/null; then
    if pg_isready -q; then
        echo -e "${GREEN}✓ Running${NC}"
    else
        echo -e "${YELLOW}⚠ Installed but not running${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Client not found${NC}"
fi

echo ""
echo "📁 Project Files"
echo "---------------"

# Check backend
echo -n "Backend: "
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check frontend
echo -n "Frontend: "
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${RED}✗ Missing${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check node_modules
echo -n "Dependencies: "
if [ -d "node_modules" ] && [ -d "backend/node_modules" ] && [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${YELLOW}⚠ Run: npm install${NC}"
fi

echo ""
echo "⚙️  Configuration"
echo "----------------"

# Check backend .env
echo -n "Backend .env: "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${YELLOW}⚠ Missing (copy from .env.example)${NC}"
fi

# Check frontend .env.local
echo -n "Frontend .env.local: "
if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓ Present${NC}"
else
    echo -e "${YELLOW}⚠ Missing (copy from .env.example)${NC}"
fi

echo ""
echo "🌐 Services"
echo "----------"

# Check backend running
echo -n "Backend API: "
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running on port 5000${NC}"
else
    echo -e "${YELLOW}⚠ Not running (start with: npm run dev:backend)${NC}"
fi

# Check frontend running
echo -n "Frontend: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠ Not running (start with: npm run dev:frontend)${NC}"
fi

echo ""
echo "📊 Summary"
echo "---------"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "To start development:"
    echo "  npm run dev"
else
    echo -e "${RED}✗ Found $ERRORS critical issues${NC}"
    echo ""
    echo "Please fix the issues above before starting development."
    exit 1
fi
