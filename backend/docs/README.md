# API Documentation & Developer Resources

This directory contains comprehensive documentation and developer tools for the Survey Application API.

## 📚 Documentation Files

### [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
Comprehensive developer guide including:
- Quick start instructions
- Detailed API reference
- Authentication and security
- Code examples in multiple languages
- Deployment guidelines
- Troubleshooting guide

### [postman-collection.json](./postman-collection.json)
Complete Postman collection featuring:
- All API endpoints with examples
- Dynamic test data generation
- Comprehensive test assertions
- Environment variable management
- Pre-request and post-request scripts

### [postman-environment.json](./postman-environment.json)
Postman environment configuration with:
- Development server settings
- Dynamic variable definitions
- Auto-populated test data
- Request tracking variables

## 🚀 Getting Started

### 1. Interactive Documentation
Start the development server and visit:
```
http://localhost:5000/api-docs
```

### 2. Postman Setup
1. Import `postman-collection.json` into Postman
2. Import `postman-environment.json` as environment
3. Select the "Survey API - Development" environment
4. Start testing endpoints!

### 3. API Client Generation
Generate TypeScript/JavaScript clients:
```bash
npm run generate-client
```

### 4. OpenAPI Specification
Download the machine-readable spec:
```bash
curl http://localhost:5000/api-docs.json > openapi-spec.json
```

## 📋 Quick Reference

### Base URLs
- **Development**: `http://localhost:5000`
- **Documentation**: `http://localhost:5000/api-docs`
- **OpenAPI Spec**: `http://localhost:5000/api-docs.json`

### Main Endpoints
- `POST /api/survey` - Submit survey response
- `GET /api/results` - Get aggregated results

### Authentication
Currently no authentication required. All endpoints are publicly accessible with rate limiting.

### Rate Limits
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Headers**: `X-RateLimit-*` in responses

## 🛠️ Developer Tools

### Available Scripts
```bash
# Start development server with docs
npm run dev

# Generate API clients
npm run generate-client

# Show documentation URL
npm run docs

# Run API tests
npm test
```

### Tools Integration
- **Swagger UI**: Interactive documentation
- **Postman**: Collection and environment files
- **OpenAPI Generator**: Automatic client generation
- **TypeScript**: Strong typing support

## 📊 Testing & Validation

### Postman Tests
The collection includes automated tests for:
- ✅ Response status codes
- ✅ Response structure validation
- ✅ Data type verification
- ✅ Security header presence
- ✅ Performance benchmarks
- ✅ CORS configuration
- ✅ Rate limiting behavior

### Test Coverage
- **Survey Submission**: Valid/invalid data scenarios
- **Results Retrieval**: Data presence/absence scenarios
- **Error Handling**: Validation and server errors
- **Security**: Headers, CORS, rate limits

## 🔗 External Resources

### Learning Resources
- [OpenAPI Specification](https://swagger.io/specification/)
- [Postman Documentation](https://learning.postman.com/docs/)
- [REST API Best Practices](https://restfulapi.net/rest-api-best-practices/)

### Related Tools
- [Insomnia](https://insomnia.rest/) - Alternative API client
- [HTTPie](https://httpie.io/) - Command-line HTTP client
- [Paw](https://paw.cloud/) - Mac API testing tool

## 📝 Contributing

### Documentation Updates
When making API changes:
1. Update OpenAPI annotations in route files
2. Regenerate API clients: `npm run generate-client`
3. Update code examples in documentation
4. Test Postman collection with new changes
5. Verify Swagger UI displays correctly

### Adding Examples
To add new request examples:
1. Add to Postman collection with tests
2. Include in OpenAPI specification
3. Update developer documentation
4. Test with different scenarios

---

**Need Help?**
- 📖 Read the [full documentation](./API_DOCUMENTATION.md)
- 🌐 Try the [interactive docs](http://localhost:5000/api-docs)
- 📬 Contact: developer-support@survey-app.com