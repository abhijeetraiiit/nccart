# Quick Start Guide

Get NCCart up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running
- 10 minutes of your time

## Step-by-Step Setup

### 1. Clone and Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/abhijeetraiiit/nccart.git
cd nccart

# Run automated setup
chmod +x setup.sh
./setup.sh
```

This will:
- Install all dependencies
- Create environment files
- Setup database (if you confirm)

### 2. Configure Environment (1 minute)

Edit `backend/.env`:
```env
# REQUIRED: Update these
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/nccart"
JWT_SECRET="your-super-secret-key-min-32-characters-long"

# Optional: Keep defaults for development
PORT=5000
NODE_ENV=development
```

### 3. Start Development (30 seconds)

```bash
npm run dev
```

That's it! 🎉

### 4. Test It Out (1 minute)

Open your browser:

**Frontend:** http://localhost:3000
- You'll see the NCCart landing page

**Backend:** http://localhost:5000/health
- You should see: `{"status":"ok","message":"NCCart API is running"}`

**Prisma Studio:** Open in new terminal
```bash
cd backend && npm run db:studio
```
- Browse your database at http://localhost:5555

---

## Quick Test - Register a User

### Using cURL

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "CUSTOMER",
    "firstName": "Test",
    "lastName": "User"
  }'
```

You should get a response with a JWT token!

### Using the API

1. Register: `POST http://localhost:5000/api/auth/register`
2. Login: `POST http://localhost:5000/api/auth/login`
3. Get Profile: `GET http://localhost:5000/api/users/profile` (with auth token)

---

## What's Next?

### For Developers

1. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development guide
2. Check [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system
3. See [API.md](./API.md) for API documentation

### Common Tasks

**View Database:**
```bash
cd backend && npm run db:studio
```

**Run Migrations:**
```bash
cd backend && npm run db:migrate
```

**Run Tests:**
```bash
npm test
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Or use different port in backend/.env
PORT=5001
```

### Database Connection Error

1. Make sure PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Check DATABASE_URL in `backend/.env`

3. Create database if not exists:
   ```bash
   createdb nccart
   ```

### Module Not Found

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Using Docker (Alternative)

If you have Docker installed:

```bash
# Start everything
docker-compose up

# Access:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## Project Structure

```
nccart/
├── backend/          # Express API
│   ├── src/         # Source code
│   └── prisma/      # Database schema
├── frontend/        # Next.js app
│   └── app/         # Pages
├── docs/            # Documentation
└── docker-compose.yml
```

---

## Next Steps

1. ✅ Setup complete
2. 📖 Read documentation
3. 💻 Start coding
4. 🧪 Write tests
5. 🚀 Deploy to production

---

## Need Help?

- 📚 Check [DEVELOPMENT.md](./DEVELOPMENT.md)
- 🐛 Open an issue on GitHub
- 💬 Check existing issues for solutions

---

**Happy coding! 🚀**
