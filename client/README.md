# How to

**[NodeJS](http://nodejs.org/) v0.8.x is required**

## Install [GruntJS](http://gruntjs.com/)
This will put the `grunt` command in your system path

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

*these 3 commands will compile all the project and leave the compiled files ```/dist```*

### FileSystem Watcher

> Only for Develop Enviroment

To set a watcher, so you wont need to be running ```grunt``` every time a change is made, run:

```bash
grunt watch
```

*So, everytime a file is saved inside ```/app``` it will run the compilation again*
