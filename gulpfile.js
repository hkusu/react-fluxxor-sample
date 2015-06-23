var gulp = require('gulp');
var browserSync = require('browser-sync');
var shell = require('gulp-shell');

gulp.task('build:js', shell.task(
  'npm run build'
));

gulp.task('build:html', function() {
  gulp.src('./src/*.html')
    .pipe(gulp.dest('./dest/'))
});

gulp.task('watch:src', function() {
  gulp.watch('./src/*.jsx', ['build:js']);
  gulp.watch('./src/*.html', ['build:html']);
});

gulp.task('browser-sync:run', function() {
  browserSync.init({
    server: {
      baseDir: "./dest/",
      index: "index.html"
    }
  });
  gulp.watch('./dest/*', ['browser-sync:reload']);
});

gulp.task('browser-sync:reload', function() {
  browserSync.reload();
});

gulp.task('build', ['build:js', 'build:html']);
gulp.task('serve', ['build', 'watch:src', 'browser-sync:run']);
