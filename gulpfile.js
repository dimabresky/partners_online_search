// Require our dependencies
const gulp = require('gulp');
const minify = require('gulp-minify');
const concat = require('gulp-concat');

const path = "./assets/js";
const path_module = path + "/module";
const path_bundles = path + "/bundles";

function __min() {
    return minify({
        ext: {
            src: '-debug.js',
            min: '.js'
        }});
}

gulp.task('children', function () {
    return gulp.src([
        path_module + '/namespace.js',
        path_module + '/const.js',
        path_module + '/utils.js',
        path_module + '/children.js'
    ])
            .pipe(concat('children.js'))
            .pipe(__min())
            .pipe(gulp.dest(path_bundles));
});

gulp.task('datepicker', function () {
    return gulp.src([
        path_module + '/namespace.js',
        path_module + '/const.js',
        path_module + '/utils.js',
        path_module + '/datepicker.js'
    ])
            .pipe(concat('datepicker.js'))
            .pipe(__min())
            .pipe(gulp.dest(path_bundles));
});

gulp.task('forms', function () {
    return gulp.src([
        path_module + '/namespace.js',
        path_module + '/const.js',
        path_module + '/utils.js',
        path_module + '/frames.js',
        path_module + '/forms.js'
    ])
            .pipe(concat('forms.js'))
            .pipe(__min())
            .pipe(gulp.dest(path_bundles));
});

gulp.task('init', function () {
    return gulp.src([
        path_module + '/namespace.js',
        path_module + '/const.js',
        path_module + '/utils.js',
        path_module + '/frames.js',
        path_module + '/init.js'
    ])
            .pipe(concat('init.js'))
            .pipe(__min())
            .pipe(gulp.dest(path_bundles));
});

gulp.task('search_result', function () {
    return gulp.src([
        path_module + '/../mask.js',
        path_module + '/namespace.js',
        path_module + '/const.js',
        path_module + '/utils.js',
        path_module + '/search_result.js'
    ])
            .pipe(concat('search_result.js'))
            .pipe(__min())
            .pipe(gulp.dest(path_bundles));
});

gulp.task('select', function () {
    return gulp.src([
        path_module + '/namespace.js',
        path_module + '/select.js'
    ])
            .pipe(concat('select.js'))
            .pipe(__min())
            .pipe(gulp.dest(path_bundles));
});

gulp.task('default', ['children', 'datepicker', 'forms', 'init', 'search_result', 'select']);