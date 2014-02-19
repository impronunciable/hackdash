
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! \n* <%= pkg.title || pkg.name %> - v<%= pkg.version %>' +
            '\n* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> ' +
            '\n* <%= pkg.homepage ? pkg.homepage : "" %> ' +
            '\n*/ \n\n',

    paths: {
      app: {
        root: "app/"
      },
      vendor: {
        js: "vendor/scripts/"
      },
      dist: {
        root: "dist/",
        appName: "hackdashApp.js",
        vendorName: "vendor.js",
        export: "../public/js/"
      }
    },

    clean: {
      before: {
        src: [
          "<%= paths.app.root %>views/**/*.hbs.js", 
          "<%= paths.dist.root %>*",
          "!<%= paths.dist.root %>.gitignore"
        ],
      },
      after: {
        src: [
          "<%= paths.app.root %>views/**/*.hbs.js"
        ]
      } 
    },

    handlebars: {
      dev: {
        files: [
          {
            expand: true,
            cwd: 'app/views/',
            src: ['**/*.hbs'],
            dest: 'app/views/',
            ext: '.hbs.js',
          },
        ]
      }
    },

    builder: {
      app: {
        src: "<%= paths.app.root %>index.js",
        dest: "<%= paths.dist.root %><%= paths.dist.appName %>"
      }
    },

    concat: {
      vendor: {
        src: [
            '<%= paths.vendor.js %>underscore.min.js'
          , '<%= paths.vendor.js %>backbone.min.js'
          , '<%= paths.vendor.js %>backbone.marionette.min.js'
          , '<%= paths.vendor.js %>**/*.js'
         ],
        dest: '<%= paths.dist.root %><%= paths.dist.vendorName %>'
      },
      app: {
        options: {
          stripBanners: {
            line: true
          },
          banner: '<%= banner %>',
        },
        files: {
          '<%= paths.dist.root %><%= paths.dist.appName %>': 
            [ '<%= paths.dist.root %><%= paths.dist.appName %>' ]
        }
      }
    },

    copy: {
      dist: {
        cwd: "./", 
        files: {
          "<%= paths.dist.export %><%= paths.dist.vendorName %>": 
            "<%= paths.dist.root %><%= paths.dist.vendorName %>",

          "<%= paths.dist.export %><%= paths.dist.appName %>": 
            "<%= paths.dist.root %><%= paths.dist.appName %>"
        }
      }

    },

    watch: {
      local: {
        files: ["<%= paths.app.root %>**/*",
          "!<%= paths.app.root %>views/**/*.hbs.js"],
        tasks: ['default']
      },
      stage: {
        files: ["<%= paths.app.root %>**/*",
          "!<%= paths.app.root %>views/**/*.hbs.js"],
        tasks: ['stage']
      }
    },

    jshint: {
      all: {
        files: {
          src: ["<%= paths.app.root %>**/*.js"]
        },
        options: {
          bitwise: true
          ,curly: true
          ,eqeqeq: true
          ,forin: true
          ,immed: true
          ,latedef: true
          ,newcap: true
          ,noempty: true
          ,nonew: true
          ,quotmark: false
          ,undef: true
          ,unused: true
          ,laxcomma: true

          ,globals: {
            window: true
            ,jQuery: true
            ,$: true
            ,_: true
            ,require: true
            ,module: true
            ,Backbone: true
            ,Handlebars: true
            ,console: true
            ,moment: true
            ,markdown: true

            ,hackdash: true
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-commonjs-handlebars');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  require('./builder.grunt.js')(grunt);

  grunt.registerTask("default", [
    "clean:before", 
    "jshint:all", 
    "handlebars", 
    "builder:app:local", 
    "concat", 
    "clean:after",
    "copy"
  ]);

  grunt.registerTask("w", ["default", "watch:local"]);
};
