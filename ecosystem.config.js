module.exports = {
  apps: [{
    name: 'MensajeriaCo',
    script: 'build/app.js',
    log_file: 'logs/output.log',
    env: {
      PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chromium-browser',
      PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
      NODE_ENV: 'production'
    },
    node_args: '--no-sandbox'
  }]
}
