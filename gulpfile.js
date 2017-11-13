// Skivd Gulp v0.2
// Gulp Dependencies
const gulp    = require('gulp');
const html    = require('gulp-html');
const bs      = require('browser-sync').create();
const inject  = require('bs-html-injector');
const sass    = require('gulp-sass');
const image   = require('gulp-imagemin');
const prefix  = require('gulp-autoprefixer');
const clean   = require('gulp-clean');
const plumber = require('gulp-plumber');
const gutil   = require('gulp-util');
const mq      = require('gulp-combine-mq');

// Dev Source
const src     = '_development/';
const srcSASS = src + '_scss/';
const srcHTML  = src + '_html/';
const srcJS   = src + '_js/';
const srcIMG  = src + '_images/';

// Prod Dist
const dist    = '_production/';
const dirCSS  = dist + 'css/';
const dirJS   = dist + 'js/';
const dirIMG  = dist + 'images/';

// Error Handeling
const gulp_src = gulp.src;
gulp.src = function() {
  return gulp_src.apply(gulp, arguments)
    .pipe(plumber(function(error) {
      // Output an error message
      gutil.log(gutil.colors.red('error (' + error.plugin + '):') + gutil.colors.white(error.message));
      // emit the end event, to properly end the task
      this.emit('end');
    })
  );
};

// Run Tasks
gulp.task('html', function() {
  return gulp.src(srcHTML + '*.html')
    .pipe(gulp.dest(dist));
});

gulp.task('sass', function() {
  return gulp.src(srcSASS + '*.scss')
    .pipe(sass(
      {outputStyle: 'nested'}
    ))
    .pipe(prefix({
      browsers: ['> 5%'],
    }))
    .pipe(mq({
      beautify: false
    }))
    .pipe(gulp.dest(dirCSS))
    .pipe(bs.stream());
});

gulp.task('js', function() {
  gulp.src(srcJS + '*')
    .pipe(gulp.dest(dirJS))
    .pipe(bs.stream());
});

gulp.task('clean-images', function() {
  return gulp.src(dirIMG, {read: false})
    .pipe(clean());
})

gulp.task('image', ['clean-images'], function() {
  gulp.src(srcIMG + '**/*')
    .pipe(image())
    .pipe(gulp.dest(dirIMG))
    .pipe(bs.stream());
});

gulp.task('serve', ['watch'], function() {
  bs.use(inject, {
    files: srcHTML + '*.html'
  });
  bs.init({
    server: dist
  });
});

gulp.task('watch', ['html', 'sass', 'js', 'image'], function() {
  gulp.watch(srcSASS + '*.scss', ['sass']);
  gulp.watch(srcJS + '*.js', ['js']);
  gulp.watch(srcHTML + '*.html', ['html']);
  gulp.watch(dist + '*.html', inject);
  gulp.watch(srcIMG + '**/*', ['image']);
});

gulp.task('build', ['html', 'sass', 'js', 'image']);
gulp.task('default', ['serve']);
