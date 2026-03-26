# Contributing to Golf Charity Platform

First off, thank you for considering contributing to Golf Charity Platform! It's people like you that make this platform a great tool for charitable golf enthusiasts.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git
- A code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/golf-charity-platform.git
   cd golf-charity-subscription-platform
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Setup Environment**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   # Edit the .env files with your configuration
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please:

1. Check if the issue already exists
2. Use the latest version to verify
3. Collect relevant information

**Bug Report Template:**
```markdown
**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What you expected to happen

**Screenshots:**
If applicable, add screenshots

**Environment:**
- OS: [e.g., macOS, Windows]
- Browser: [e.g., Chrome, Safari]
- Version: [e.g., 22]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- Clear use case
- Detailed description
- Possible implementation approach
- Mockups or examples if applicable

### Code Contributions

Areas where we need help:

- 🎨 UI/UX improvements
- 🧪 Test coverage
- 📚 Documentation
- 🐛 Bug fixes
- ✨ New features
- 🔒 Security improvements
- ⚡ Performance optimizations

## 🔄 Development Workflow

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Tests

### Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, documented code
   - Follow style guidelines
   - Add tests for new features

3. **Test Your Changes**
   ```bash
   # Run backend tests
   cd backend && npm test

   # Run frontend tests
   cd ../frontend && npm test
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**

## 🎨 Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for new code
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### React Components

```typescript
// Good example
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Avoid inline styles
- Use CSS custom properties for theming
- Follow mobile-first approach

### Backend Code

```typescript
// Good example with proper error handling
export async function getUserById(id: string): Promise<User> {
  try {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
}
```

## 📝 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(subscription): add yearly plan option

Add the ability for users to subscribe to yearly plans
with 2 months free discount.

Closes #123
```

```
fix(auth): resolve JWT expiration issue

Update JWT middleware to properly handle expired tokens
and return 401 status code.

Fixes #456
```

## 🔀 Pull Request Process

1. **Before Submitting**
   - Update documentation if needed
   - Add tests for new features
   - Ensure all tests pass
   - Update CHANGELOG.md

2. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Checklist
   - [ ] My code follows style guidelines
   - [ ] I have performed self-review
   - [ ] I have commented my code
   - [ ] My changes generate no new warnings
   - [ ] I have added tests
   - [ ] New and existing tests pass

   ## Screenshots (if applicable)
   ```

3. **Review Process**
   - Maintainers will review within 3-5 days
   - Address review feedback promptly
   - Squash commits if requested
   - Keep PRs focused and small

4. **After Merge**
   - Delete your branch
   - Update your local main branch
   - Create a new branch for next feature

## 🆘 Need Help?

- **GitHub Discussions**: For questions and ideas
- **Discord/Slack**: For real-time chat (link TBD)
- **Email**: support@golfcharity.com

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

Thank you for contributing to Golf Charity Platform! 🎉
