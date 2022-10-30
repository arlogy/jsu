// Adapted from https://github.com/karma-runner/karma/blob/master/test/client/karma.conf.js
// which contains useful settings from browserstack and travis for example

module.exports = function(config) {
  config.set({
    // for more information on the properties used below, see the corresponding sections at
    //     https://karma-runner.github.io/latest/config/configuration-file.html

    basePath: '',

    frameworks: ['mocha'],

    files: [
      './tests_browserified/*.js',
    ],

    exclude: [
    ],

    preprocessors: {
      // https://karma-runner.github.io/latest/config/preprocessors.html
    },

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: [
      // http://karma-runner.github.io/latest/config/browsers.html
      'ChromeHeadless', 'FirefoxHeadless',
    ],

    singleRun: true,

    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',
    ],

    concurrency: 1, // just to prevent simultaneous logging for multiple browsers when testing
  });
};
