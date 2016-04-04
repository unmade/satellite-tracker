var gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    sourcemaps = require("gulp-sourcemaps");

var paths = {
    scripts: ['src/js/module.js',
              'src/js/utils/*.js',
              'src/js/*.js'],
    styles: ['src/less/elektro-tracker.less',
             'src/less/icon-font.less',
             'src/less/roboto-font.less']
};


gulp.task('app-scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(uglify().on('error', gulpUtil.log))
        .pipe(concat('elektro-tracker.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
});


gulp.task('app-styles', function () {
  return gulp.src(paths.styles)
    .pipe(less())
    .pipe(minifyCss())
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('dist/'));
});


gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['app-scripts']);
    gulp.watch('src/less/*.less', ['app-styles']);
});


gulp.task('default', [
    'app-scripts',
    'app-styles',
    'watch'
]);
