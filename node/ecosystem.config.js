// PM2 process configuration
module.exports = {
    apps: [
        {
            name: 'DB',
            script: './statistics-database/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: true
        },
        {
            name: 'FA',
            script: './finding-alberta/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: true
        },
        {
            name: 'BS',
            script: './bitter-and-sweet/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: true
        }
    ]
}
