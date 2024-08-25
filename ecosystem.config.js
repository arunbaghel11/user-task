module.exports = {
    apps: [
      {
        name: 'NodeAPI',
        script: './cluster.js',
        instances: 2,
        exec_mode: 'cluster',
        watch: true,
      },
    ],
  };
  