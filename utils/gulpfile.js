var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require("gulp-uglify");

var paths = {
  artmobilib_src: ['../src/**/*.js']
};

gulp.task('default', ['lint', 'minify-artmobilib']);

gulp.task('lint', function() {
  return gulp.src(paths.artmobilib_src)
    .pipe(jshint())
    .on('error', function(err) {
      console.log(err.toString());
    })
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('minify-artmobilib', function () {
    gulp.src(paths.artmobilib_src)
    .pipe(concat('artmobilib.js'))
    .pipe(gulp.dest('../build/'))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('../build/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.artmobilib_src, ['minify-artmobilib']);
});
