const { src, dest, watch, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));

function compose() {
  return src("dist/scss/**/*.scss").pipe(sass()).pipe(dest("dist/css"));
}

function track() {
  watch(["dist/scss/**/*.scss"], buildStyles);
}

exports.default = series(compose, track);
