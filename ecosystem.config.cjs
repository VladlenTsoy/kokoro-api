module.exports = {
    apps: [
        {
            name: "kokoro-api",
            script: "dist/main.js",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            max_memory_restart: "512M",
            env: {
                NODE_ENV: "production",
                PORT: process.env.PORT || 3000
            }
        }
    ]
}
