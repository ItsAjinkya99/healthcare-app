# Contributing to Healthcare Management System

This document outlines guidelines for contributing to the MEAN Stack Healthcare Management System.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Style](#code-style)
4. [Commit Messages](#commit-messages)
5. [Pull Requests](#pull-requests)
6. [Testing](#testing)
7. [Documentation](#documentation)

---

## Getting Started

### Prerequisites
- Node.js v18+
- Angular CLI v21+
- MongoDB (local or Atlas)
- Git

### Setup
```bash
# Clone repository
git clone <repository-url>
cd healthcare-app

# Backend setup
cd backend
npm install
# Configure .env file

# Frontend setup
cd ../frontend
npm install
```

---

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/feature-name
# or
git checkout -b fix/bug-name
# or
git checkout -b docs/documentation-name
```

### 2. Make Changes
- Write clean, readable code
- Follow code style guidelines
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes
```bash
# Backend
cd backend
npm run test-login       # Test authentication
npm run check-users      # Verify database

# Frontend
cd ../frontend
npm run test             # Run unit tests
npm start                # Manual testing
```

### 4. Commit Changes
```bash
git add .
git commit -m "type(scope): description"
```

### 5. Push to Remote
```bash
git push origin feature/feature-name
```

### 6. Create Pull Request
- Describe changes clearly
- Link related issues
- Request reviewers

### 7. Merge After Review
```bash
git checkout main
git pull origin main
git merge feature/feature-name
git push origin main
```

### 8. Delete Feature Branch
```bash
git branch -d feature/feature-name
git push origin --delete feature/feature-name
```

---

## Code Style

### JavaScript/TypeScript
- Use `const`/`let`, avoid `var`
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Use arrow functions

```typescript
// Good
const handleLogin = (email: string): Observable<AuthResponse> => {
  return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email });
};

// Bad
var handleLogin = function(email) {
  var response = this.http.post(this.apiUrl + "/auth/login", {email})
  return response
}
```

### Component Organization
```typescript
// Order matters
export class MyComponent implements OnInit, OnDestroy {
  // 1. Properties
  property: Type;
  
  // 2. Constructor
  constructor(private service: Service) {}
  
  // 3. Lifecycle hooks
  ngOnInit() {}
  ngOnDestroy() {}
  
  // 4. Public methods
  publicMethod() {}
  
  // 5. Private methods
  private privateMethod() {}
}
```

### Angular Best Practices
- Use standalone components
- Provide services with 'root' injection token
- Use async pipe in templates
- Unsubscribe from observables (or use takeUntil)
- Type everything (no `any` unless absolutely necessary)

### CSS/SCSS
- Use SCSS instead of CSS
- Follow BEM naming convention
- Mobile-first responsive design
- Variables for colors/spacing

```scss
.component-name {
  &__element {
    property: value;
    
    &--modifier {
      property: value;
    }
  }
}
```

---

## Commit Messages

Use conventional commit format:

### Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, semicolons, etc)
- `refactor` - Code refactoring
- `test` - Test additions/changes
- `chore` - Dependency updates, build changes

### Scope
- `auth` - Authentication
- `frontend` - Frontend changes
- `backend` - Backend changes
- `api` - API endpoints
- `config` - Configuration

### Examples
```
feat(auth): implement JWT token refresh mechanism

fix(backend): resolve password comparison issue in login

docs(api): update authentication endpoints documentation

style(frontend): format dashboard component

refactor(auth-service): simplify token extraction logic

test(auth): add unit tests for password validation

chore: update dependencies
```

### Commit Body (Optional)
Include details for complex changes:
```
feat(patients): add patient search functionality

Implement full-text search on patient database
Uses MongoDB text index for performance
Supports filtering by name, email, phone number

Closes #123
```

---

## Pull Requests

### PR Checklist
- [ ] Branch created from `main`
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or clearly documented)
- [ ] .env files not included
- [ ] No console.log in production code

### PR Title Format
```
type(scope): description

Example: feat(auth): add two-factor authentication
```

### PR Description Template
```markdown
## Description
Brief description of what this PR does

## Related Issue
Closes #123

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update

## How to Test
Steps to test the changes:
1. Step 1
2. Step 2

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added
- [ ] Documentation updated
```

---

## Testing

### Backend Testing
```bash
cd backend

# Test login endpoint
npm run test-login

# Check users in database
npm run check-users

# Manual API testing
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

### Frontend Testing
```bash
cd frontend

# Run unit tests
npm run test

# Manual component testing
npm start

# Check guard functionality
# Login/logout
# Access restricted routes
# Role-based visibility
```

### Testing Checklist
- [ ] Feature works as intended
- [ ] No console errors
- [ ] No console warnings
- [ ] Responsive design tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility checked
- [ ] Performance acceptable

---

## Documentation

### When to Document
- New features
- API changes
- Complex logic
- Configuration changes
- Breaking changes

### Documentation Files
- **Code comments** - Explain why, not what
- **README.md** - Project overview
- **API_DOCS.md** - Backend endpoints
- **Component files** - Usage examples
- **GUIDES** - Feature-specific guides

### Good Comments
```typescript
// Calculate discount based on loyalty tier
// Higher tiers get exponential discounts
const discount = Math.pow(loyaltyTier, 1.5) * baseDiscount;
```

### Bad Comments
```typescript
// Add 10 to x
const result = x + 10;  // Obviously doing addition, not why!

// Loop through array
for (let i = 0; i < array.length; i++) {  // Obvious!
  // ...
}
```

---

## Code Review Checklist

### For Reviewers
- [ ] Code follows guidelines
- [ ] Logic is sound
- [ ] No obvious bugs
- [ ] Tests are adequate
- [ ] Documentation is clear
- [ ] No hardcoded values
- [ ] Error handling present
- [ ] Performance acceptable
- [ ] Security considerations checked

### For Authors
- [ ] Self-review before requesting review
- [ ] All tests passing
- [ ] No merge conflicts
- [ ] Commits are atomic and meaningful
- [ ] Documentation updated

---

## Performance Guidelines

### Backend
- Use pagination for large datasets
- Index frequently queried fields
- Cache when appropriate
- Monitor response times

### Frontend
- Use OnPush change detection
- Lazy load routes
- Optimize bundle size
- Use trackBy in *ngFor

---

## Security Checklist

### Backend
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection protection
- [ ] CORS properly configured
- [ ] Secrets in environment variables
- [ ] HTTPS enforced (production)

### Frontend
- [ ] No sensitive data in localStorage
- [ ] XSS protection (Angular handles)
- [ ] CSRF tokens (if applicable)
- [ ] Secure headers set

---

## Release Checklist

Before releasing to production:

### Backend
- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Environment variables set
- [ ] Logs configured
- [ ] Error monitoring setup

### Frontend
- [ ] Production build successful
- [ ] Bundle size acceptable
- [ ] Lighthouse score > 90
- [ ] All features working
- [ ] No console errors

---

## Getting Help

### Questions?
- Check documentation files
- Review existing code for examples
- Create GitHub issue with `[question]` tag

### Found a Bug?
- Create issue with `[bug]` tag
- Include steps to reproduce
- Attach screenshots if applicable

### Feature Requests?
- Create issue with `[enhancement]` tag
- Describe use case
- Provide implementation suggestions

---

## Code of Conduct

- Be respectful to all contributors
- Provide constructive feedback
- Help others learn
- Report harassment or inappropriate behavior
- Focus on the code, not the person

---

## Useful Commands

```bash
# View changes
git diff

# Stage specific file
git add path/to/file

# Undo changes
git checkout path/to/file

# View log
git log --oneline --graph

# Check status
git status

# Rebase branch
git rebase main

# Force push (use carefully!)
git push origin branch-name --force-with-lease
```

---

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [JavaScript Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)

---

## Thank You!

Your contributions make this project better. We appreciate your effort and dedication!

Happy coding! 🚀
