/**
 * AWS Lambda handler for Claude Code Web Agent
 * 
 * This module adapts the Hono application to work with AWS Lambda and API Gateway.
 */

import { handle } from 'hono/aws-lambda';
import { createApp } from './app.js';
import { NodeRuntime } from './runtime/node.js';

// Create runtime and app instance
const runtime = new NodeRuntime();

// Configure for Lambda environment
const app = createApp(runtime, {
  debugMode: process.env.NODE_ENV !== 'production',
  staticPath: './dist/static', // Static files are bundled in dist/static in Lambda package
  claudePath: 'claude', // Assume claude is available in Lambda environment or provided as layer
});

// Export the Lambda handler
export const handler = handle(app);