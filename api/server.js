// CJS wrapper that dynamic-imports the compiled ESM server
let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = import('../server/dist/index.js').then((m) => m.createApp());
  }
  return appPromise;
}

module.exports = async (req, res) => {
  const app = await getApp();
  app(req, res);
};
