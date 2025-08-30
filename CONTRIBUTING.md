# Contributing to Chennai Emergency Ambulance Routing System

Thank you for your interest in contributing to the Chennai Emergency Ambulance Routing System! This project is designed to help emergency services in Chennai provide better and faster medical assistance.

## 🤝 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Check existing issues** - Search for similar issues that might already exist
2. **Use the issue template** - Provide all requested information
3. **Be specific** - Include steps to reproduce, expected vs actual behavior
4. **Include environment details** - OS, Node.js version, browser (if applicable)

### Suggesting Features

We welcome feature suggestions! When suggesting features:

1. **Describe the problem** - What issue does this feature solve?
2. **Propose a solution** - How should this feature work?
3. **Consider impact** - How does this affect emergency operations?
4. **Provide examples** - Use cases and scenarios

### Code Contributions

#### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Express.js

#### Development Setup

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/chennai-ambulance-routing.git
cd chennai-ambulance-routing
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

#### Coding Standards

- **TypeScript**: Use strict typing, avoid `any` types
- **React**: Use functional components with hooks
- **Naming**: Use descriptive names, follow camelCase for variables
- **Comments**: Add comments for complex logic
- **Error Handling**: Include proper error handling and validation

#### Testing

- **Test your changes** - Ensure the application works as expected
- **Test edge cases** - Consider emergency scenarios
- **Cross-browser testing** - Test on different browsers
- **Mobile responsiveness** - Ensure it works on mobile devices

#### Commit Guidelines

Use conventional commit messages:

```
feat: add new hospital routing algorithm
fix: resolve GPS location parsing issue
docs: update API documentation
style: improve emergency dashboard UI
refactor: optimize hospital ranking logic
test: add unit tests for traffic calculation
```

#### Pull Request Process

1. **Update documentation** - Update README.md if needed
2. **Add tests** - Include tests for new features
3. **Update CHANGELOG** - Document your changes
4. **Request review** - Ask for code review from maintainers

## 🏥 Emergency-Specific Guidelines

### Data Accuracy

- **Hospital Information**: Verify hospital details before updating
- **Location Data**: Ensure coordinates are accurate
- **Traffic Zones**: Validate traffic zone boundaries
- **Emergency Protocols**: Follow medical emergency guidelines

### Security Considerations

- **API Keys**: Never commit sensitive data
- **Authentication**: Implement proper authentication for emergency APIs
- **Data Privacy**: Follow medical data privacy regulations
- **Rate Limiting**: Implement appropriate rate limiting

### Performance

- **Response Time**: Optimize for fast emergency response
- **Real-time Updates**: Ensure WebSocket connections are stable
- **Mobile Performance**: Optimize for mobile emergency use
- **Offline Capability**: Consider offline functionality

## 📋 Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows TypeScript best practices
- [ ] React components are properly structured
- [ ] API endpoints include proper error handling
- [ ] Database queries are optimized
- [ ] UI is responsive and accessible
- [ ] Emergency protocols are followed
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No sensitive data is exposed

## 🚨 Emergency Protocol Compliance

This system is used for emergency medical dispatch. All contributions must:

1. **Maintain Accuracy** - Ensure hospital and routing data is correct
2. **Preserve Speed** - Optimize for fast emergency response
3. **Ensure Reliability** - System must be stable and dependable
4. **Follow Standards** - Adhere to emergency medical protocols
5. **Test Thoroughly** - All changes must be thoroughly tested

## 📞 Getting Help

- **GitHub Issues**: Create an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Emergency Support**: Contact emergency services for critical issues

## 🙏 Recognition

Contributors will be recognized in:
- Project README.md
- Release notes
- Contributor hall of fame

Thank you for helping improve emergency services in Chennai! 🚑
