// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-08-20 using
// generator-karma 1.0.0

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-bootstrap-show-errors/src/showErrors.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/angular-breadcrumb/release/angular-breadcrumb.js',
      'bower_components/angular-messages/angular-messages.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/angular-ui-select/dist/select.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/lodash/lodash.js',
      'bower_components/metisMenu/dist/metisMenu.js',
      'bower_components/ngtoast/dist/ngToast.js',
      'bower_components/validator-js/validator.js',
      'bower_components/angular-utils-pagination/dirPagination.js',
      'bower_components/angular-socket-io/socket.js',
      'bower_components/moment/moment.js',
      'bower_components/ng-embed/src/ng-embed.js',
      'bower_components/matchmedia/matchMedia.js',
      'bower_components/ngSticky/lib/sticky.js',
      'bower_components/ngImgCrop/compile/minified/ng-img-crop.js',
      'bower_components/ng-file-upload/ng-file-upload.js',
      'bower_components/angular-trello/dist/angular-trello.min.js',
      'bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
      'bower_components/angular-wysiwyg/dist/angular-wysiwyg.min.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/ui-router-extras/release/ct-ui-router-extras.js',
      // endbower
      'app/scripts/vendor/simpleWebRTC-v2.js',
      // src
      'app/src/app.js',
      'app/src/app.constants.js',
      'app/src/app.routes.js',

      'app/src/components/*.js',

      'app/src/**/*.controller.js',
      'app/src/**/*.service.js',
      'app/src/**/*.serviceModel.js',
      'app/src/**/*.spec.js'
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
    ],

    // Which plugins to enable
    plugins: [
      "karma-phantomjs-launcher",
      "karma-jasmine"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
