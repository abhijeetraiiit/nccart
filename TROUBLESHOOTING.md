# Troubleshooting Guide

Common issues and their solutions for NCCart.

---

## Table of Contents
- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Server Issues](#server-issues)
- [Frontend Issues](#frontend-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### `npm install` fails

**Problem:** Dependencies fail to install

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use correct Node version:**
   ```bash
   node -v  # Should be 18+
   nvm use 18  # If using nvm
   ```

3. **Check network connectivity:**
   ```bash
   ping registry.npmjs.org
   ```

### Permission errors during install

**Problem:** EACCES or permission denied

**Solution:**
```bash
# Don't use sudo, fix permissions instead
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

---

## Database Issues

### Cannot connect to database

**Problem:** `Error: P1001: Can't reach database server`

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   # Linux/Mac
   pg_isready
   
   # If not running, start it
   # Linux
   sudo systemctl start postgresql
   
   # Mac (Homebrew)
   brew services start postgresql
   ```

2. **Verify DATABASE_URL:**
   ```bash
   # In backend/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/nccart"
   
   # Test connection
   psql -h localhost -U your_user -d nccart
   ```

3. **Check database exists:**
   ```bash
   psql -l  # List databases
   createdb nccart  # Create if missing
   ```

### Migration errors

**Problem:** `Migration failed` or `Migration is already applied`

**Solutions:**

1. **Reset database (WARNING: deletes all data):**
   ```bash
   cd backend
   npx prisma migrate reset
   ```

2. **Mark migration as applied:**
   ```bash
   npx prisma migrate resolve --applied "migration_name"
   ```

3. **Create new migration:**
   ```bash
   npx prisma migrate dev --name fix_issue
   ```

### Prisma Client not generated

**Problem:** `@prisma/client did not initialize yet`

**Solution:**
```bash
cd backend
npx prisma generate
```

---

## Server Issues

### Port already in use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**

1. **Find and kill process:**
   ```bash
   # Linux/Mac
   lsof -i :5000
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Use different port:**
   ```bash
   # In backend/.env
   PORT=5001
   ```

### Backend server won't start

**Problem:** Server crashes on start

**Solutions:**

1. **Check logs:**
   ```bash
   cd backend
   npm run dev
   # Read error messages carefully
   ```

2. **Common fixes:**
   - Verify `.env` file exists
   - Check DATABASE_URL is correct
   - Ensure all dependencies installed
   - Check for syntax errors

3. **Test database connection:**
   ```bash
   cd backend
   node -e "const {PrismaClient} = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('Connected')).catch(e => console.log('Error:', e))"
   ```

### API returns 500 errors

**Problem:** Internal server error

**Solutions:**

1. **Check backend logs:**
   ```bash
   tail -f backend/logs/error.log
   ```

2. **Enable debug mode:**
   ```bash
   # In backend/.env
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

3. **Check database connection**

4. **Verify environment variables**

---

## Frontend Issues

### `next dev` fails to start

**Problem:** Frontend won't start

**Solutions:**

1. **Clear Next.js cache:**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check port 3000:**
   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

### Page not found (404)

**Problem:** Routes return 404

**Solutions:**

1. **Check file structure:**
   ```
   frontend/app/
   ├── page.tsx      # Home page (/)
   ├── about/
   │   └── page.tsx  # About page (/about)
   ```

2. **Restart dev server:**
   ```bash
   # Stop and start again
   npm run dev
   ```

### API calls fail

**Problem:** Frontend can't reach backend

**Solutions:**

1. **Verify backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check API URL:**
   ```bash
   # In frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **CORS issues:**
   - Check backend CORS configuration
   - Verify FRONTEND_URL in backend/.env

---

## Build Issues

### TypeScript errors

**Problem:** `Type 'X' is not assignable to type 'Y'`

**Solutions:**

1. **Check TypeScript version:**
   ```bash
   npx tsc --version
   ```

2. **Regenerate types:**
   ```bash
   # Backend
   cd backend
   npx prisma generate
   
   # Frontend
   cd frontend
   rm -rf .next
   ```

3. **Fix type errors** as indicated

### Build fails

**Problem:** `npm run build` fails

**Solutions:**

1. **Clear build cache:**
   ```bash
   # Backend
   cd backend
   rm -rf dist
   
   # Frontend
   cd frontend
   rm -rf .next
   ```

2. **Check for linting errors:**
   ```bash
   npm run lint
   ```

3. **Build individually:**
   ```bash
   cd backend && npm run build
   cd frontend && npm run build
   ```

---

## Runtime Errors

### JWT token errors

**Problem:** `JsonWebTokenError: invalid token`

**Solutions:**

1. **Check JWT_SECRET:**
   ```bash
   # In backend/.env
   JWT_SECRET="your-secret-must-be-at-least-32-characters-long"
   ```

2. **Token expired:**
   - Login again to get new token
   - Adjust JWT_EXPIRES_IN in .env

3. **Clear old tokens:**
   - Clear localStorage in browser
   - Logout and login again

### Authentication fails

**Problem:** `401 Unauthorized`

**Solutions:**

1. **Verify token in request:**
   ```bash
   # Should be in header:
   Authorization: Bearer <token>
   ```

2. **Check user exists:**
   ```bash
   cd backend
   npx prisma studio
   # Check Users table
   ```

3. **User status:**
   - Verify user.status is 'ACTIVE'
   - Not 'SUSPENDED' or 'PENDING_VERIFICATION'

### Database constraint errors

**Problem:** `Unique constraint failed`

**Solutions:**

1. **Check for duplicates:**
   - Email already exists
   - Slug already used
   - Unique field conflict

2. **Use different value**

3. **Update existing record instead of creating new**

---

## Performance Issues

### Slow page loads

**Problem:** Pages take > 3 seconds to load

**Solutions:**

1. **Enable caching:**
   - Setup Redis
   - Cache database queries
   - Cache API responses

2. **Optimize images:**
   - Use Next.js Image component
   - Compress images
   - Use CDN

3. **Database optimization:**
   - Add indexes
   - Optimize queries
   - Use select to fetch only needed fields

### Slow API responses

**Problem:** API takes > 500ms

**Solutions:**

1. **Profile queries:**
   ```bash
   # In backend/.env
   DATABASE_URL="...?connection_limit=10&pool_timeout=20"
   ```

2. **Add database indexes:**
   ```prisma
   @@index([fieldName])
   ```

3. **Use pagination:**
   - Limit results per page
   - Don't fetch all data at once

### Memory leaks

**Problem:** Server memory keeps increasing

**Solutions:**

1. **Monitor memory:**
   ```bash
   node --inspect backend/dist/index.js
   # Use Chrome DevTools
   ```

2. **Close database connections:**
   ```typescript
   // Always disconnect when done
   await prisma.$disconnect()
   ```

3. **Restart server periodically** (temporary fix)

---

## Docker Issues

### Container won't start

**Problem:** Docker container exits immediately

**Solutions:**

1. **Check logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. **Rebuild images:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

3. **Check environment variables** in docker-compose.yml

### Database not accessible

**Problem:** Backend can't reach database in Docker

**Solution:**
```yaml
# In docker-compose.yml, use service name
DATABASE_URL="postgresql://user:pass@postgres:5432/nccart"
# Not localhost!
```

---

## Common Error Messages

### `MODULE_NOT_FOUND`

**Cause:** Missing dependency

**Fix:**
```bash
npm install
```

### `ECONNREFUSED`

**Cause:** Service not running

**Fix:**
- Start the service (database, backend, etc.)
- Check port numbers
- Verify firewall settings

### `ETIMEDOUT`

**Cause:** Network timeout

**Fix:**
- Check internet connection
- Increase timeout limits
- Check firewall/proxy

---

## Getting More Help

If issue persists:

1. **Search existing issues:**
   - GitHub Issues: https://github.com/abhijeetraiiit/nccart/issues

2. **Create detailed issue:**
   - Exact error message
   - Steps to reproduce
   - Environment (OS, Node version)
   - What you've tried

3. **Check documentation:**
   - [README.md](./README.md)
   - [DEVELOPMENT.md](./DEVELOPMENT.md)
   - [FAQ.md](./FAQ.md)

4. **Run health check:**
   ```bash
   ./healthcheck.sh
   ```

---

## Debug Mode

Enable verbose logging:

```bash
# Backend (.env)
NODE_ENV=development
LOG_LEVEL=debug

# Then check logs
tail -f backend/logs/combined.log
```

---

**Still stuck? Create an issue on GitHub with:**
- Error message (full stack trace)
- Steps to reproduce
- Your environment (OS, versions)
- What you've tried

---

Last Updated: February 2024
