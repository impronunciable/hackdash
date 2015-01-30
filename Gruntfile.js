
module.exports = function(grunt) {

  grunt.initConfig({

    express: {
      test: {
        options: {
          script: './server.js',
          node_env: 'test',
          port: require('./config.test').port
        }
      }
    },

    mochacov: {
      options: {
        files: 'test/**/*.js',
        ui: 'bdd',
        colors: true
      },
      unit: {
        options: {
          reporter: 'spec'
        }
      },
    },

    watch: {
      test: {
        files: ["models/**/*", "routes/api/**/*", "test/api/**/*"],
        tasks: ['test'],
        options: {
          atBegin: true
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-mocha-cov');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask("test", ['express:test', 'mochacov:unit']);
  grunt.registerTask("default", 'test');

};
