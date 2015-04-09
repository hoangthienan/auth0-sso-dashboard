var babel = require("gulp-babel");
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

module.exports = function(gulp, is_production) {

  function scripts(watch) {
    var bundler, rebundle;
    bundler = browserify('../app/lib/Main.js', {
      basedir: __dirname,
      debug: !is_production,
      cache: {}, // required for watchify
      packageCache: {}, // required for watchify
      fullPaths: watch // required to be true only for watchify
    });
    if (watch) {
      bundler = watchify(bundler)
    }

    // bundler.external('lodash')
    // bundler.external('react')

    //bundler.transform('reactify', {"es6": true});
    bundler.transform('babelify')
    bundler.transform('envify');

    var rebundle = function() {
      return bundler.bundle()
        .on('error', function(err) {
          console.log(err)
        })
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
          loadMaps: true
        })) // loads map from browserify file
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./dist/app'));
    };

    bundler.on('update', function() {
      console.log('Start \'scripts-bundle\'');
      rebundle();
      console.log('Finished \'scripts-bundle\'');
    });
    return rebundle();
  }

  gulp.task('scripts-watch', scripts.bind(null, true));
  gulp.task('scripts-bundle', ['app-clean'], scripts.bind(null, false));
  gulp.task('scripts-minify', ['scripts-bundle'], function() {
    return gulp.src('./dist/app/bundle.js')
      .pipe(uglify())
      .pipe(rename(function(path) {
        path.extname = '.min.js'
      }))
      .pipe(gulp.dest('./dist/app'));
  });

  gulp.task('scripts-build', ['scripts-minify']);

}
