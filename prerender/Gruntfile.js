
module.exports = function(grunt) {

  grunt.initConfig({

    express: {
      test: {
        options: {
          script: './index.js',
          port: 4001
        }
      },
      server: {
        options: {
          script: 'test/server.js',
          port: 3001
        }
      }
    },

    mochacov: {
      options: {
        files: 'test/index.js',
        ui: 'bdd',
        colors: true
      },
      unit: {
        options: {
          reporter: 'spec'
        }
      },
    }

  });

  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-mocha-cov');

  grunt.registerTask("default", ['express:test', 'express:server', 'mochacov:unit']);

};