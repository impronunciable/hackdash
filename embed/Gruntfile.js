
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! \n* <%= pkg.title || pkg.name %> - v<%= pkg.version %>' +
            '\n* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> ' +
            '\n* <%= pkg.homepage ? pkg.homepage : "" %> ' +
            '\n*/ \n\n',

    paths: {
      filename: "hackdash-embed-v<%= pkg.version %>",
      src: "src/",
      dist: "dist/",
      test: "test/",
      specs: "test/specs/"
    },
    
    clean: {
      before: {
        src: [
          "<%= paths.dist %>*",
          "!<%= paths.dist %>.gitignore"
        ],
      }
    },

    browserify: {
      all: {
        options:{
          extension: [ '.js', '.hbs' ],
          transform: [ 'hbsfy' ],
        },
        src: ['<%= paths.src %>index.js'],
        dest: '<%= paths.dist %><%= paths.filename %>.js'
      },
      tests: {
        src: [ '<%= paths.test %>suite.js' ],
        dest: '<%= paths.test %>browserified_tests.js',
        options: {
          extension: [ '.js', '.hbs' ],
          transform: [ 'hbsfy' ],
          external: [ './<%= paths.filename %>.js' ],
          debug: true // Embed source map for tests
        }
      },
      watchify: {
        files: {
          '<%= paths.test %>browserified_tests.js': ['<%= paths.test %>suite.js'],
          '<%= paths.dist %><%= paths.filename %>.js': ['<%= paths.src %>index.js']
        },
        options: {
          extension: [ '.js', '.hbs' ],
          transform: [ 'hbsfy' ],
          debug: true,
          watch: true
        }
      }
    },

    watch: {
      browserified: {
        files: [
          '<%= paths.dist %><%= paths.filename %>.js',
          '<%= paths.test %>browserified_tests.js'
        ],
        tasks: ['jshint', 'mocha_phantomjs']
      }
    },

    concat: {
      all: {
        options: {
          stripBanners: {
            line: true
          },
          banner: '<%= banner %>',
          process: function(src, filepath){
            return "(function() {\n  " + src + "\n})();";
          }
        },
        files: {
          '<%= paths.dist %><%= paths.filename %>.js': [ '<%= paths.dist %><%= paths.filename %>.js' ]
        }
      }
    },
/*
    // NEEDS NodeJS 0.10
    
    uglify: {
      all: {
        options: {
          stripBanners: {
            line: true
          },
          banner: '<%= banner %>',
        },
        files: {
          '<%= paths.dist %><%= paths.filename %>.min.js': [ '<%= paths.dist %><%= paths.filename %>.js' ]
        }
      }
    },
*/
    jshint: {
      all: {
        files: {
          src: ["<%= paths.src %>**/*.js", "<%= paths.specs %>**/*.js"]
        },
        options: {
          jshintrc: '.jshintrc'
        }
      }
    },

    mocha_phantomjs: {
      all: {
        options: {
          'reporter': 'spec',
          urls: [ "http://localhost:8000/test/index.html" ]
        }
      }
    },

    // Static Server for Client Tests ------

    connect: {
      server: {
        options: {
          port: 8000,
          base: '.',
        }
      }
    },

    // Hackdash SERVER to test Endpoints ---

    express: {
      test: {
        options: {
          script: '../server.js',
          node_env: 'test',
          port: 3000
        }
      }
    }

  });

  grunt.loadNpmTasks("grunt-browserify");
  
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  //grunt.loadNpmTasks("grunt-contrib-uglify");
  
  grunt.loadNpmTasks("grunt-mocha-phantomjs");
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask("build", [
    "clean:before",
    "jshint",
    "browserify:all",
    "concat"
  ]);

  grunt.registerTask("test", [
    "build",
    "browserify:tests",
    "express:test",
    "connect",
    "mocha_phantomjs"
  ]);

  grunt.registerTask("default", "test");
  grunt.registerTask("w", ["test", "browserify:watchify", "watch:browserified"]);
  grunt.registerTask("dist", ["test", "uglify"]);

};
