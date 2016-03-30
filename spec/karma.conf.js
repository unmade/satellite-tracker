module.exports = function(config) {
  config.set({

    basePath : '../',

    files : [
      'bower_components/jquery/dist/jquery.min.js',
      'bower_components/satellite.js/dist/satellite.min.js',
      'bower_components/three.r75.min.js',
      'bower_components/OBJLoader.js',
      'bower_components/MTLLoader.js',
      'bower_components/threejs-trackball-controls/TrackballControls.js',
      'dist/elektro-tracker.min.js',
      'spec/**/*.spec.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
