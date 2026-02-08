# Development Guide

## Quick Start

### First Time Setup

1. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. Configure your environment:
   - Edit `backend/.env`
   - Edit `frontend/.env.local`

3. Start development:
   ```bash
   npm run dev
   ```

---

## Development Workflow

### Daily Development

1. **Pull latest changes**
   ```bash
   git pull origin develop
   npm install  # Update dependencies if needed
   ```

2. **Start dev servers**
   ```bash
   npm run dev
   ```

3. **Make changes**
   - Backend code in `backend/src/`
   - Frontend code in `frontend/app/`

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push
   ```

---

## Common Development Tasks

### Backend Development

#### Adding a New API Endpoint

1. **Create route handler**
   ```typescript
   // backend/src/routes/example.routes.ts
   import { Router } from 'express';
   import * as controller from '../controllers/example.controller';
   
   const router = Router();
   router.get('/', controller.getAll);
   router.post('/', controller.create);
   
   export default router;
   ```

2. **Create controller**
   ```typescript
   // backend/src/controllers/example.controller.ts
   import { Request, Response, NextFunction } from 'express';
   
   export const getAll = async (req: Request, res: Response, next: NextFunction) => {
     try {
       // Your logic here
       res.json({ success: true, data: [] });
     } catch (error) {
       next(error);
     }
   };
   ```

3. **Register route**
   ```typescript
   // backend/src/index.ts
   import exampleRoutes from './routes/example.routes';
   app.use('/api/examples', exampleRoutes);
   ```

#### Adding a Database Model

1. **Update schema**
   ```prisma
   // backend/prisma/schema.prisma
   model Example {
     id        String   @id @default(uuid())
     name      String
     createdAt DateTime @default(now())
   }
   ```

2. **Create migration**
   ```bash
   cd backend
   npx prisma migrate dev --name add_example_model
   ```

3. **Generate client**
   ```bash
   npx prisma generate
   ```

#### Working with Database

```bash
# View database
cd backend && npx prisma studio

# Create migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

### Frontend Development

#### Creating a New Page

1. **Create page file**
   ```typescript
   // frontend/app/example/page.tsx
   export default function ExamplePage() {
     return (
       <div className="container mx-auto">
         <h1>Example Page</h1>
       </div>
     );
   }
   ```

2. **Add to navigation** (if needed)

#### Creating a Component

```typescript
// frontend/components/ExampleComponent.tsx
interface ExampleProps {
  title: string;
}

export default function ExampleComponent({ title }: ExampleProps) {
  return <div>{title}</div>;
}
```

#### Making API Calls

```typescript
// frontend/lib/api.ts
export async function fetchData() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`);
  return response.json();
}

// In component
import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/api';

export default function Component() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, []);

  return <div>{/* render data */}</div>;
}
```

---

## Debugging

### Backend Debugging

1. **Add console logs**
   ```typescript
   console.log('Debug:', variable);
   ```

2. **Use logger**
   ```typescript
   import { logger } from '../utils/logger';
   logger.info('Info message');
   logger.error('Error message', error);
   ```

3. **VS Code debugging**
   Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Backend",
         "runtimeExecutable": "npm",
         "runtimeArgs": ["run", "dev"],
         "cwd": "${workspaceFolder}/backend",
         "skipFiles": ["<node_internals>/**"]
       }
     ]
   }
   ```

### Frontend Debugging

1. **Browser DevTools**
   - Open Chrome DevTools (F12)
   - Use Console, Network, React DevTools

2. **Debug statements**
   ```typescript
   console.log('Debug:', data);
   debugger; // Pauses execution
   ```

---

## Testing

### Writing Tests

#### Backend Unit Test
```typescript
// backend/src/controllers/__tests__/auth.controller.test.ts
import { register } from '../auth.controller';

describe('AuthController', () => {
  it('should register a new user', async () => {
    // Test implementation
  });
});
```

#### Frontend Component Test
```typescript
// frontend/components/__tests__/Example.test.tsx
import { render, screen } from '@testing-library/react';
import ExampleComponent from '../ExampleComponent';

test('renders component', () => {
  render(<ExampleComponent title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage
```

---

## Environment Variables

### Backend (.env)

```env
# Required
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"

# Optional for development
NODE_ENV="development"
PORT=5000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Common Issues

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

1. Check PostgreSQL is running:
   ```bash
   pg_isready
   ```

2. Verify DATABASE_URL in `.env`

3. Test connection:
   ```bash
   psql -h localhost -U username -d nccart
   ```

### Prisma Client Not Generated

```bash
cd backend
npx prisma generate
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## Code Quality

### Linting

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint

# Auto-fix
npm run lint -- --fix
```

### Type Checking

```bash
# Backend
cd backend && npx tsc --noEmit

# Frontend
cd frontend && npx tsc --noEmit
```

---

## Git Workflow

### Feature Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add my feature"

# Push to remote
git push origin feature/my-feature

# Create PR on GitHub
```

### Keeping Branch Updated

```bash
# Update from develop
git checkout develop
git pull origin develop
git checkout feature/my-feature
git rebase develop

# If conflicts, resolve and continue
git rebase --continue
```

---

## Performance Tips

### Backend

1. **Database queries**
   - Use proper indexes
   - Avoid N+1 queries
   - Use `select` to fetch only needed fields

2. **Caching**
   - Use Redis for frequently accessed data
   - Cache expensive computations

3. **Async operations**
   - Use Promise.all for parallel operations
   - Implement proper error handling

### Frontend

1. **Code splitting**
   - Use dynamic imports
   - Lazy load components

2. **Image optimization**
   - Use Next.js Image component
   - Optimize image sizes

3. **State management**
   - Avoid unnecessary re-renders
   - Use React.memo for expensive components

---

## Useful Commands

### Development

```bash
# Start everything
npm run dev

# Start individually
npm run dev:backend
npm run dev:frontend

# Build for production
npm run build
```

### Database

```bash
cd backend

# Prisma Studio (GUI)
npm run db:studio

# Migrations
npm run db:migrate

# Generate client
npm run db:generate
```

### Docker

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

---

## Resources

- [Express.js Docs](https://expressjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## Getting Help

1. Check documentation files
2. Search existing GitHub issues
3. Create new issue with details
4. Join community discussions (coming soon)

---

Happy coding! 🚀
