# Changelog

All notable changes to the Healthcare Management System project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- Backend API with JWT authentication
- Frontend with Angular 21
- Role-based access control
- User registration and login
- Dashboard with role-specific content
- Comprehensive documentation

### Changed
- Converted separate repos to monorepo structure

### Fixed

### Removed

### Security
- Secrets management with .env files
- JWT token-based authentication
- Password hashing with bcryptjs

---

## Version Guidelines

### Major Version (X.0.0)
- Breaking changes
- New large features
- Significant refactoring

### Minor Version (0.X.0)
- New features (non-breaking)
- New endpoints
- New components

### Patch Version (0.0.X)
- Bug fixes
- Performance improvements
- Documentation updates

---

## Changelog Format

### For Each Release
```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature description
- Another new feature

### Changed
- Breaking change description
- Updated behavior

### Fixed
- Bug fix description
- Another bug fix

### Removed
- Deprecated feature removed

### Security
- Security vulnerability fixed
- Security improvement
```

---

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release from tag

---

## Version Numbers

Current Version: **0.1.0** (Development)

Next Planned Releases:
- **0.2.0** - Patient management system
- **0.3.0** - Appointment scheduling
- **1.0.0** - First stable release

---

## Authors

- Healthcare Development Team

---

## License

MIT License - See LICENSE file for details
