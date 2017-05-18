// PM2 process configuration
module.exports = {
    apps: [
        {
            name: 'statistics-database',
            script: './statistics-database/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: true
        },
        {
            name: 'finding-alberta',
            script: './finding-alberta/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: true
        },
        {
            name: 'bitter-and-sweet',
            script: './bitter-and-sweet/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: true
        },
        {
            name: 'somatic-archiving',
            script: './somatic-archiving/server.js',
            exec_mode: 'cluster',
            instances: 0,
            watch: true
        },
    ]
}
