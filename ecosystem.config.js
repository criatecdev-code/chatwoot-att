module.exports = {
  apps: [
    {
      name: 'chatwoot-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start:prod',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'chatwoot-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'chatwoot-whatsapp',
      cwd: './whatsapp-service',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
