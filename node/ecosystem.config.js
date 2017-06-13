// PM2 process configuration
module.exports = {
    apps: [
        {
            name: 'DB',
            script: './statistics-database/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: ['./statistics-database/server.js']
        },
        {
            name: 'FA',
            script: './finding-alberta/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: ['./finding-alberta/server.js']
        },
        {
            name: 'BS',
            script: './bitter-and-sweet/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: ['./bitter-and-sweet/server.js']
        }
    ]
}
