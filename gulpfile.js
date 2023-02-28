const { src, dest, watch, series } = require('gulp')
const sass = require('gulp-sass')(require('sass'));

function buildStyles() {
  return src('dist/scss/**/*.scss')
    .pipe(sass())
    .pipe(dest('dist/css'))
}

function watchTask() {
  watch(['dist/scss/**/*.scss'], buildStyles)
}

exports.default = series(buildStyles, watchTask)