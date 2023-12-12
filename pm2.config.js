module.exports = {
    apps: [
        {
            name: 'psc-server', // Change this to the name of your app
            script: 'npm', // Use 'npm' as the script
            args: 'run start', // Specify the npm script you want to run

            // Add any additional options or environment variables if needed
            // env: {
            //   NODE_ENV: 'production',
            // },

            // Control how many instances of the application should be started.
            // Set to "1" if you only want one instance.
            instances: '1',

            // Set autorestart to true to automatically restart the app if it crashes.
            // Set to false if you want to manually control restarts.
            autorestart: true,

            // Watch the application's folder for changes and restart if necessary.
            watch: false,

            // Log files will be generated automatically by PM2.
            // To change the log location, uncomment the following line:
            // error_file: 'path/to/your/error.log',
            // out_file: 'path/to/your/out.log',
            // log_file: 'path/to/your/combined.log',

            // Set the max memory per instance. Adjust this according to your needs.
            // max_memory_restart: '1G',
        },
    ],
};

