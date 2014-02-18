
//var envs = require('./enviroments.json');

module.exports = function(grunt) {

  grunt.registerMultiTask('builder', 'Builds app for CommonJS modules using WebMake.', function() {
    var done = this.async()
      , fs = require('fs') 
      , webmake = require('webmake')
      , src = this.files[0].src
      , dest = this.files[0].dest;
      //, envCfg = envs[this.args[0]];
    
    function checkErr(err, from){
      if (err) {
        grunt.log.error(err);
        grunt.fail.warn(from);
      }
    }

    webmake(src, function (err, content) {
      checkErr(err, 'Fail from WebMake');
      
      //var output = "window.base = " + JSON.stringify(envCfg) + ";";
      fs.writeFile(dest, content /*+ output*/, function(err) {
        checkErr(err, 'Fail from FileSystem');

        grunt.log.writeln("App Modules created successfully!");
        done();
      }); 
    });
  });
  
};