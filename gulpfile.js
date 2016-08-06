var gulp = require('gulp')
var webserver = require('gulp-webserver')
var runSequence = require('run-sequence')
var standard = require('gulp-standard')
var webpack = require('webpack')
var webpackStream = require('webpack-stream')
var spawn = require('child_process').spawn
var node

gulp.task('build', function() {
  return gulp.src('./src/client/main.js')
    .pipe(webpackStream({
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            BROWSER: JSON.stringify(true)
          }
        })
      ],
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

gulp.task('node', function() {
  if (node) {
    node.kill()
  }

  node = spawn('node', ['./src/game-server/main.js'])
  node.on('error', function (err) {
    gulp.log(err)
  })
  .on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...')
    }
  })
})

gulp.task('lint', function () {
  return gulp.src('./src/**/*.js')
  .pipe(standard())
  .pipe(standard.reporter('default', {
    breakOnError: false,
    breakOnWarnings: false
  }))
})

gulp.task('watch', function () {
  gulp.watch(['./src/client/**/*.js', './src/shared/**/*.js'], function () {
    runSequence('lint', 'build')
  })
  gulp.watch(['./src/game-server/**/*.js', './src/shared/**/*.js'], function () {
    runSequence('lint', 'node')
  })
})

gulp.task('serve', function () {
  return gulp.src('./build')
  .pipe(webserver({
    livereload: true,
    open: false
  }))
})

gulp.task('client', function (cb) {
  gulp.watch(['./src/client/**/*.js', './src/shared/**/*.js'], function () {
    runSequence('lint', 'build')
  })

  runSequence('lint', 'build', 'serve', cb)
})

gulp.task('server', function (cb) {
  gulp.watch(['./src/server/**/*.js', './src/shared/**/*.js'], function () {
    runSequence('lint', 'node')
  })

  runSequence('lint', 'node', cb)
})

gulp.task('default', function (cb) {
  runSequence('lint', 'build', 'node', 'serve', 'watch', cb)
})
