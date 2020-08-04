const project_folder = "dist";
const source_folder = "src";

const path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css",
    js: project_folder + "/js",
    img: project_folder + "/img",
    fonts: project_folder + "/fonts",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/css/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/*.{jpg, png, svg, gif, ico, webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/**/*.scss",
    js: source_folder + "/**/*.js",
    img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}",
  },
  clean: `./${project_folder}/`,
};

const { src, dest } = require("gulp");
const gulp = require("gulp");
const browsersync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const del = require("del");
const scss = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const group_files_scss = require("gulp-group-css-media-queries");
const clean_css = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin");
const webP = require("gulp-webp");
const webPHTML = require("gulp-webp-html");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fonter = require("gulp-fonter");

function images() {
  return src(path.src.img)
    .pipe(webP({ quality: 70 }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optiomizationLevel: 3,
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

function fonts() {
  src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
  //   return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function delDist() {
  return del(path.clean);
}

function css() {
  return src(path.src.css)
    .pipe(scss({ outputStyle: "expanded" }))
    .pipe(
      autoprefixer({ overrideBrowserslist: ["last 5 version"], cascade: true })
    )
    .pipe(group_files_scss())
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: ".min.css",
      })
    )

    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webPHTML())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function browserSync() {
  browsersync.init({
    server: {
      baseDir: `./${project_folder}/`,
    },
    port: 3000,
    notify: false,
  });
}

function watchFile() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

const build = gulp.series(delDist, gulp.parallel(images, js, css, html, fonts));
const watch = gulp.parallel(build, watchFile, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
