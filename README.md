# grunt-builder

> Grunt plugin allowing to build js and css app files with index.html main development file. It uses Uglify.js for minification.

> Example with index.html development file :
```html
<!DOCTYPE html>
<html manifest="manifest.appcache">
  <head>
    <link href="font.css" rel="stylesheet" data-bundle="app.css">
    <link href="app.css" rel="stylesheet" data-bundle="app.css">
  </head>
  <body>
    <script type="text/javascript" src="backbone.min.js" data-bundle="vendors.js"></script>
    <script type="text/javascript" src="underscore.min.js" data-bundle="vendors.js"></script>
    <script type="text/javascript" src="models.js" data-bundle="app.min.js" data-minify="true"></script>
    <script type="text/javascript" src="router.js" data-bundle="app.min.js" data-minify="true"></script>
    <script type="text/javascript" src="views.js" data-bundle="app.min.js" data-minify="true"></script>
  </body>
</html>
```

> Files generated : `app.css` `vendors.js` `app.min.js`

> You can also specified to create a manifest.appcache file with js and css files generated.



## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-builder --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-builder');
```

## The "builder" task

### Overview
In your project's Gruntfile, add a section named `builder` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  builder: {
    app: {
      src: //indicate base file (index.html),
      options: {
        //builder options
        appcache: true //need it for generate the manifest cache file
      }
    }
  },
});
```

### Options

#### options.directory
Type: `String`
Default value: `''`

Specific directory app .

#### options.appcache
Type: `Boolean`
Default value: `false`

Need to be true for generate the Manisfest cache file.

#### options.appcacheOptions
Type: `Object`
Default value: `{}`

Options for manifest cache file (`optionalFiles` `excludeFiles`)


### Usage Examples

#### Basic Example

```js
grunt.initConfig({
  builder: {
    app: {
      src: 'index.html'
    }
  },
});
```

#### Complete Example

With all Custom Options used

```js
grunt.initConfig({
  builder: {
    app: {
      src: 'index.html',
      options: {
        directory: 'backbone/',//forder app if it different
        appcache: true,//need it for generate the manifest cache file
        appcacheOptions: {
          optionalFiles: ['vendor/fonts.min.css'],//add specifics no build files in manifest.appcache                 
          excludeFiles: ['vendors.js']//exclude specifics build files in manifest.appcache
        }
      }
    }
  },
});
```
