/*
 * grunt-builder
 * https://github.com/jrobertou/grunt-builder
 *
 * Copyright (c) 2013 Jeremy Robertou
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  var UglifyJS = require("uglify-js"),
    CleanCSS = require('clean-css'),
    htmlparser = require("htmlparser2"),
    fs = require('fs'),
    path = require('path');

    grunt.registerMultiTask('builder', 'Build app with index.html main development file', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options();
    var dir = options.directory ? options.directory : '',
      src = dir + this.data.src,      
      appcacheOptions = this.data.appcacheOptions;

    var file = src;
    var content = fs.readFileSync(file, 'utf8');
    var javascripts = {};
    var css = {};
    var source_files = [];

    var manifestTpl = ''+fs.readFileSync(path.resolve(__dirname, 'lib/manifest.appcache.template'), 'utf8');

    var dirFileExist = function(path) {
      var way = '';
      if(path[0] == '/')
        way = "/";

      var dirArray = path.split('/');
      dirArray.pop();
      for (var i in dirArray) {
        way += dirArray[i]+"/";
        if(!fs.existsSync(way))
          fs.mkdirSync(way);
      }
    };

    var parsingDone = function() {
      /* 
       * Process CSS files
       */
      for (var i in css) {
        var distFile = dir + i;
        console.log('Generating CSS file [' + distFile + ']');
        source_files.push(i);

        var source = '';
        for (var s in css[i])
          source += fs.readFileSync(dir + css[i][s], 'utf8');

        var minimizedCSS = new CleanCSS().minify(source);

        dirFileExist(distFile);
        fs.writeFileSync(distFile, minimizedCSS);
      }

      var allFilesMinified = function(files) {
        for (var f in files) {
          if (!files[f].minify) return false;
        }
        return true;
      }

      /* 
       * Process JS files
       */

      for (var i in javascripts) {
        var distFile = dir+i;
        console.log('Generating JS file [' + distFile + ']');
        source_files.push(i);

        var content = '';
        if (allFilesMinified(javascripts[i])) {
          var filesToMinify = [];
          for (j in javascripts[i]) {
            filesToMinify.push(dir + javascripts[i][j].src);
          }
          content = UglifyJS.minify(filesToMinify).code
        }
        else {
          for (var j in javascripts[i]) {
            if (javascripts[i][j].minify)
              content += '\n' +  UglifyJS.minify(dir+javascripts[i][j].src).code + '\n';
            else
              content += '\n' + fs.readFileSync(dir+javascripts[i][j].src, 'utf8') + '\n';
          }
        }
        dirFileExist(distFile);
        fs.writeFileSync(distFile, content);
      }

      /* 
       * Process Manifest files
       */

      if (options.appcache){
        console.log('Generating manifest file [' + dir + 'manifest.appcache' + ']');

        if(options.appcacheOptions) {
          if(options.appcacheOptions.optionalFiles) {
            var optionalFiles = options.appcacheOptions.optionalFiles;
            for (var f in optionalFiles) {
              source_files.push(optionalFiles[f]);
            }
          }

          if(options.appcacheOptions.excludeFiles) {
            var excludeFiles = options.appcacheOptions.excludeFiles;
            for (var f in excludeFiles) {
              var index = source_files.indexOf(excludeFiles[f]);
              if (index >= 0)
                source_files.splice(index, 1)
            }
          }
        }
        var timestamp = Date.now();
        var manifest = manifestTpl.replace('_TIMESTAMP_', timestamp);
        manifest = manifest.replace('_SOURCE_FILES_', source_files.join('\n'));

        dirFileExist(distFile);
        fs.writeFileSync(dir + 'manifest.appcache', manifest);
      }
    }

    var parser = new htmlparser.Parser({
      onopentag: function(name, attribs){
        if (name === "script" && attribs.type === "text/javascript" && attribs["data-bundle"]) {
          var bundle = attribs["data-bundle"];
          if (!javascripts[bundle])
            javascripts[bundle] = [];
          var minify = attribs["data-minify"] || false;

          javascripts[bundle].push({src: attribs.src, minify: minify});
        } 
        else if (name === "link" && attribs.rel === "stylesheet" && attribs["data-bundle"]) {
          var bundle = attribs["data-bundle"];
          if (!css[bundle])
            css[bundle] = [];
         
          css[bundle].push(attribs.href);
        }
      },

      onend: function() {
        parsingDone();
      }
    });
    parser.write(content);
    parser.end();

  });

};
