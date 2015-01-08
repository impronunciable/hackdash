
module.exports = function(grunt) {

  grunt.initConfig({
  
    express: {
      test: {
        options: {
          script: './server.js',
          //node_env: 'test',
          port: 3000
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
    }

  });
  
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-mocha-cov');

  grunt.registerTask("test", ['express:test', 'mochacov:unit']);
  grunt.registerTask("default", 'test');

};
