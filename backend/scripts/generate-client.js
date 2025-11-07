#!/usr/bin/env node

/**
 * API Client Generator
 * ===================
 * Generates TypeScript/JavaScript API clients from OpenAPI specification
 * 
 * Usage:
 *   npm run generate-client
 *   node scripts/generate-client.js
 *   ./scripts/generate-client.js --help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  openApiUrl: 'http://localhost:5000/api-docs.json',
  outputDir: './generated-clients',
  generators: [
    {
      name: 'typescript-fetch',
      language: 'TypeScript',
      description: 'TypeScript client using fetch API',
      outputPath: 'typescript-fetch-client'
    },
    {
      name: 'javascript',
      language: 'JavaScript',
      description: 'JavaScript client with axios',
      outputPath: 'javascript-client'
    },
    {
      name: 'typescript-axios',
      language: 'TypeScript',
      description: 'TypeScript client using axios',
      outputPath: 'typescript-axios-client'
    }
  ]
};

class ApiClientGenerator {
  constructor() {
    this.checkPrerequisites();
  }

  /**
   * Check if required tools are available
   */
  checkPrerequisites() {
    try {
      execSync('openapi-generator-cli version', { stdio: 'pipe' });
    } catch (error) {
      console.log('📦 Installing OpenAPI Generator CLI...');
      try {
        execSync('npm install -g @openapitools/openapi-generator-cli', { stdio: 'inherit' });
        console.log('✅ OpenAPI Generator CLI installed successfully');
      } catch (installError) {
        console.error('❌ Failed to install OpenAPI Generator CLI');
        console.error('Please install it manually: npm install -g @openapitools/openapi-generator-cli');
        process.exit(1);
      }
    }
  }

  /**
   * Download OpenAPI specification from running server
   */
  async downloadSpec() {
    console.log('📥 Downloading OpenAPI specification...');
    
    try {
      const response = await fetch(CONFIG.openApiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const spec = await response.json();
      
      // Ensure output directory exists
      if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
      }
      
      const specPath = path.join(CONFIG.outputDir, 'openapi-spec.json');
      fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
      
      console.log(`✅ OpenAPI spec saved to ${specPath}`);
      return specPath;
    } catch (error) {
      console.error('❌ Failed to download OpenAPI specification');
      console.error('Make sure the API server is running at', CONFIG.openApiUrl);
      console.error('Error:', error.message);
      process.exit(1);
    }
  }

  /**
   * Generate client for a specific generator
   */
  generateClient(specPath, generator) {
    console.log(`🔨 Generating ${generator.language} client (${generator.name})...`);
    
    const outputPath = path.join(CONFIG.outputDir, generator.outputPath);
    
    // Remove existing output directory
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { recursive: true });
    }
    
    const command = [
      'openapi-generator-cli generate',
      `-i "${specPath}"`,
      `-g ${generator.name}`,
      `-o "${outputPath}"`,
      '--additional-properties=',
      'npmName=survey-api-client,',
      'npmVersion=1.0.0,',
      'supportsES6=true,',
      'withInterfaces=true'
    ].join(' ');
    
    try {
      execSync(command, { stdio: 'pipe' });
      
      // Create README for the generated client
      this.createClientReadme(outputPath, generator);
      
      console.log(`✅ ${generator.language} client generated at ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error(`❌ Failed to generate ${generator.language} client`);
      console.error('Error:', error.message);
      return null;
    }
  }

  /**
   * Create README for generated client
   */
  createClientReadme(outputPath, generator) {
    const readmeContent = `# Survey API Client - ${generator.language}

Generated ${generator.language} client for the Survey Application API.

## Description
${generator.description}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

### Basic Example

\`\`\`${generator.language.toLowerCase()}
${this.getUsageExample(generator)}
\`\`\`

## API Documentation

- **Interactive Docs**: http://localhost:5000/api-docs
- **OpenAPI Spec**: http://localhost:5000/api-docs.json
- **Developer Guide**: ../docs/API_DOCUMENTATION.md

## Generated Files

- \`api/\` - API client classes and interfaces
- \`model/\` - TypeScript/JavaScript models
- \`docs/\` - API documentation

## Notes

This client was automatically generated from the OpenAPI specification.
For the most up-to-date client, regenerate from the latest API spec.

---

Generated on: ${new Date().toISOString()}
Generator: ${generator.name}
`;

    fs.writeFileSync(path.join(outputPath, 'README.md'), readmeContent);
  }

  /**
   * Get usage example for specific generator
   */
  getUsageExample(generator) {
    switch (generator.name) {
      case 'typescript-fetch':
        return `import { Configuration, DefaultApi } from './api';

const config = new Configuration({
  basePath: 'http://localhost:5000',
});

const api = new DefaultApi(config);

// Submit survey
const surveyData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  contactNumber: '+1234567890',
  dateOfBirth: '1990-05-15',
  foods: ['pizza'],
  ratingMovies: '4',
  ratingRadio: '3',
  ratingEatOut: '5',
  ratingTV: '2'
};

try {
  const response = await api.submitSurvey(surveyData);
  console.log('Survey ID:', response.id);
} catch (error) {
  console.error('Error:', error);
}

// Get results
try {
  const results = await api.getResults();
  console.log('Results:', results);
} catch (error) {
  console.error('Error:', error);
}`;

      case 'typescript-axios':
        return `import { DefaultApi, Configuration } from './api';

const config = new Configuration({
  basePath: 'http://localhost:5000',
});

const api = new DefaultApi(config);

// Submit survey
const surveyData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  contactNumber: '+1234567890',
  dateOfBirth: '1990-05-15',
  foods: ['pizza'],
  ratingMovies: '4',
  ratingRadio: '3',
  ratingEatOut: '5',
  ratingTV: '2'
};

api.submitSurvey(surveyData)
  .then(response => {
    console.log('Survey ID:', response.data.id);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// Get results
api.getResults()
  .then(response => {
    console.log('Results:', response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });`;

      case 'javascript':
        return `const SurveyApi = require('./src/api/DefaultApi');
const ApiClient = require('./src/ApiClient');

const client = ApiClient.instance;
client.basePath = 'http://localhost:5000';

const api = new SurveyApi();

// Submit survey
const surveyData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  contactNumber: '+1234567890',
  dateOfBirth: '1990-05-15',
  foods: ['pizza'],
  ratingMovies: '4',
  ratingRadio: '3',
  ratingEatOut: '5',
  ratingTV: '2'
};

api.submitSurvey(surveyData, (error, data, response) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Survey ID:', data.id);
  }
});

// Get results
api.getResults((error, data, response) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Results:', data);
  }
});`;

      default:
        return '// Usage example not available for this generator';
    }
  }

  /**
   * Generate all API clients
   */
  async generateAllClients() {
    console.log('🚀 Starting API client generation...');
    console.log('📋 Generators:', CONFIG.generators.map(g => g.name).join(', '));
    
    // Download OpenAPI spec
    const specPath = await this.downloadSpec();
    
    // Generate clients
    const results = [];
    for (const generator of CONFIG.generators) {
      const outputPath = this.generateClient(specPath, generator);
      results.push({
        generator: generator.name,
        success: !!outputPath,
        path: outputPath
      });
    }
    
    // Summary
    console.log('\n📊 Generation Summary:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${result.generator}`);
      if (result.success) {
        console.log(`     📁 ${result.path}`);
      }
    });
    
    console.log('\n🎉 API client generation complete!');
    console.log(`📂 All clients saved to: ${CONFIG.outputDir}`);
    
    // Create master README
    this.createMasterReadme(results);
  }

  /**
   * Create master README for all generated clients
   */
  createMasterReadme(results) {
    const readmeContent = `# Generated API Clients

This directory contains automatically generated API clients for the Survey Application API.

## Available Clients

${results.map(result => {
  if (!result.success) return `- ❌ **${result.generator}** - Generation failed`;
  
  const generator = CONFIG.generators.find(g => g.name === result.generator);
  return `- ✅ **${generator.language}** (\`${generator.name}\`) - ${generator.description}
  - 📁 Path: \`${path.basename(result.path)}/\`
  - 📖 README: \`${path.basename(result.path)}/README.md\``;
}).join('\n')}

## Usage

Each client directory contains:
- Generated API classes and interfaces
- TypeScript definitions (where applicable)
- Documentation and usage examples
- Package configuration files

## Regeneration

To regenerate clients with the latest API specification:

\`\`\`bash
npm run generate-client
\`\`\`

Make sure the API server is running at \`http://localhost:5000\` before regenerating.

## Requirements

- **Node.js** 18+ for all clients
- **TypeScript** 4+ for TypeScript clients
- **API Server** running for spec download

---

Generated on: ${new Date().toISOString()}
Total clients: ${results.filter(r => r.success).length}/${results.length}
`;

    fs.writeFileSync(path.join(CONFIG.outputDir, 'README.md'), readmeContent);
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
API Client Generator

Usage:
  node generate-client.js [options]

Options:
  --help, -h     Show this help message

Description:
  Generates TypeScript and JavaScript API clients from the OpenAPI specification.
  Requires the API server to be running at http://localhost:5000

Generated clients:
  - TypeScript (fetch API)
  - TypeScript (axios)
  - JavaScript (axios)

Output directory: ${CONFIG.outputDir}
`);
    return;
  }
  
  const generator = new ApiClientGenerator();
  await generator.generateAllClients();
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Generation failed:', error.message);
    process.exit(1);
  });
}

module.exports = { ApiClientGenerator, CONFIG };