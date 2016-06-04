var gulp = require('gulp')
var browserify = require('browserify')
var through2 = require('through2')
var rename = require('gulp-rename')
var webserver = require('gulp-webserver')
var runSequence = require('run-sequence')
var standard = require('gulp-standard')
var path = require('path')
var webpack = require('webpack-stream')

gulp.task('build', function() {
  return gulp.src('./src/client/main.js')
    .pipe(webpack({
      stats: {
        timings: true,
        reasons: true,
        errorDetails: true,
        source: true
      },
      output: {
        filename: 'main.js'
      },
      devtool: 'source-map'
    }))
    .on('error', function(error) {
      this.emit('end')
    })
    .pipe(gulp.dest('./build/js'))
})
// gulp.task('build', function () {
//   return gulp.src('./src/client/main.js')
//   .pipe(through2.obj(function (file, enc, next) {
//     browserify(file.path, { debug: process.env.NODE_ENV === 'development' })
//     .bundle(function (err, res) {
//       if (err) {
//         return next(err)
//       }

//       file.contents = res;
//       next(null, file);
//     })
//   }))
//   .on('error', function (error) {
//     console.log(error.stack)
//     this.emit('end')
//   })
//   .pipe(rename('main.js'))
//   .pipe(gulp.dest('./build/js'))
// })

gulp.task('lint', function () {
  return gulp.src('./src/**/*.js')
  .pipe(standard())
  .pipe(standard.reporter('default', {
    breakOnError: false,
    breakOnWarnings: false
  }))
})

gulp.task('watch', function () {
  gulp.watch(['./src/**/*.js'], function () {
    runSequence('lint', 'build')
  })
})

gulp.task('serve', function () {
  return gulp.src('./build')
  .pipe(webserver({
    livereload: true,
    open: true
  }))
})

gulp.task('default', function (cb) {
  runSequence('lint', 'build', 'serve', 'watch', cb)
})
