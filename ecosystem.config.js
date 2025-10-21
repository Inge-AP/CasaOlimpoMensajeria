module.exports = {
  apps: [{
    name: 'MensajeriaCo',
    script: 'build/app.js',
    instances: 1,
    log_file: 'logs/output.log',
    env: {
      PUPPETEER_EXECUTABLE_PATH: '/usr/bin/chromium-browser',
      PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
      NODE_ENV: 'production',
      AUTO_CLEANUP: 'true'
    },
    max_memory_restart: '1G',
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    merge_logs: true,
    kill_timeout: 20000,
    restart_delay: 10000,
    max_restarts: 50,
    min_uptime: '20s',
    node_args: '--max-old-space-size=1024',
    exec_mode: 'fork',
    autorestart: true,
    exp_backoff_restart_delay: 100,
    watch_delay: 1000
  }]
}
