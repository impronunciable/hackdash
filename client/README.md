# How to

**[NodeJS](http://nodejs.org/) v0.8.x is required**

## Install [GruntJS](http://gruntjs.com/)
This will put the `grunt` command in your system path

#### Installing GruntJS CLI
**If you have installed grunt globally in the past (version 0.3.x), you will need to remove it first:**

```bash
npm uninstall -g grunt
```

In order to get started, you'll want to install grunt's command line interface (CLI) globally.  You may need to use sudo (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) to do this.

```bash
npm install -g grunt-cli
```

**More Info at [GruntJS: Getting Started](https://github.com/gruntjs/grunt/wiki/Getting-started)**

## Install Dependencies

```bash
npm install
```

## Compile the project

Run the following command at root of project

### Develop Enviroment

```bash
grunt
```

### Stagging Enviroment

```bash
grunt stage
```

### Production Enviroment (Stagging and minified)

```bash
grunt prod
```

*these 3 commands will compile all the project and leave the compiled files ```/dist```*

### FileSystem Watcher

> Only for Develop Enviroment

To set a watcher, so you wont need to be running ```grunt``` every time a change is made, run:

```bash
grunt watch
```

or 

```bash
grunt w
```

*So, everytime a file is saved inside ```/app``` it will run the compilation again*
