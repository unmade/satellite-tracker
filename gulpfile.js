var gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sourcemaps = require("gulp-sourcemaps");

var paths = {
    scripts: ['src/js/module.js',
              'src/js/utils/*.js',
              'src/js/*.js']
};


gulp.task('app-scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(uglify().on('error', gulpUtil.log))
        .pipe(concat('elektro-tracker.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});


gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['app-scripts']);
});


gulp.task('default', [
    'app-scripts',
    'watch'
]);
