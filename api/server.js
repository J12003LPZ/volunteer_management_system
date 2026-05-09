// Entry point for Vercel serverless function.
// _server.cjs is built by esbuild during `vercel build`.
const { createApp } = require('./server-bundle.cjs');
module.exports = createApp();
