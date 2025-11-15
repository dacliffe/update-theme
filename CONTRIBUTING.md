# Contributing to Shopify Theme Content Merger

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/theme-merger.git`
3. Install dependencies: `npm install`
4. Follow the setup guide in `SETUP.md`
5. Create a feature branch: `git checkout -b feature/your-feature-name`

## Project Structure

```
update-theme/
├── server/
│   ├── index.js              # Express server setup
│   ├── routes/
│   │   ├── auth.js           # OAuth authentication routes
│   │   └── theme.js          # Theme operations routes
│   ├── services/
│   │   └── themeService.js   # Theme API business logic
│   └── middleware/
│       └── validateShop.js   # Shop validation middleware
├── src/
│   ├── App.jsx               # Main React component
│   ├── main.jsx              # React entry point
│   ├── components/           # Reusable UI components
│   └── hooks/                # Custom React hooks
├── package.json
├── vite.config.js            # Vite configuration
└── README.md
```

## Code Style

- Use ES6+ features (async/await, destructuring, etc.)
- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Run prettier before committing: `npx prettier --write .`

## Making Changes

### Backend Changes (server/)

- Keep routes simple and delegate logic to services
- Handle errors gracefully with try/catch
- Add appropriate HTTP status codes
- Validate input parameters

### Frontend Changes (src/)

- Use Shopify Polaris components for consistency
- Keep components focused and reusable
- Use hooks for state management
- Handle loading and error states

### API Changes

If you modify API endpoints:

1. Update the route handlers
2. Update the service functions
3. Update the frontend API calls
4. Document changes in README.md

## Testing Your Changes

1. Test authentication flow
2. Test theme listing
3. Test theme comparison with different scenarios
4. Test merge functionality with various file types
5. Test error handling (invalid shop, network errors, etc.)

## Common Development Tasks

### Adding a New API Endpoint

1. Add route in `server/routes/`
2. Add service function in `server/services/`
3. Add frontend API call
4. Update documentation

### Adding a New UI Feature

1. Create component in `src/components/`
2. Import and use in `App.jsx`
3. Test responsiveness
4. Ensure it follows Polaris design system

### Improving Error Handling

1. Add specific error cases in try/catch blocks
2. Return meaningful error messages
3. Show user-friendly errors in UI
4. Log errors for debugging

## Commit Guidelines

Use clear, descriptive commit messages:

- `feat: add batch file selection`
- `fix: handle rate limit errors`
- `docs: update setup instructions`
- `refactor: simplify theme comparison logic`
- `style: format code with prettier`

## Submitting Pull Requests

1. Ensure your code follows the style guide
2. Test thoroughly on a development store
3. Update documentation if needed
4. Create a pull request with:
   - Clear title describing the change
   - Description of what was changed and why
   - Any breaking changes or migration notes

## Questions or Issues?

- Check existing issues first
- Create a new issue with detailed information
- Include steps to reproduce for bugs
- Provide use case for feature requests

## License

By contributing, you agree that your contributions will be licensed under the MIT License.



