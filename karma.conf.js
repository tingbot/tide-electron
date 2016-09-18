var webpackConfig = require('./webpack.config.js');
delete webpackConfig.entry;

// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['CustomElectron'],
    frameworks: ['mocha','chai'],
    // this is the entry file for all our tests.
    files: ['test/index.js'],
    // we will pass the entry file to webpack for bundling.
    preprocessors: {
      'test/index.js': ['webpack']
    },
    // use the webpack config
    webpack: webpackConfig,
    // avoid walls of useless text
    webpackMiddleware: {
      noInfo: true
    },
    client: {
      useIframe: false
    },
    // Define a custom launcher which inherits from `Electron`
    customLaunchers: {
      CustomElectron: {
        base: 'Electron',
        //flags: ['--show','-r ./app/node_modules/*']
      }
    }
  });
};
