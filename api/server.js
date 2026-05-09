// Entry point for Vercel serverless function.
// _server.cjs is built by esbuild during `vercel build`.
const { createApp } = require('./_server.cjs');
module.exports = createApp();
