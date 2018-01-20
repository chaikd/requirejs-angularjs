'use strict';

var path = require('path');
var gulp = require('gulp');
var util = require('util');
var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');
var wiredep = require('wiredep').stream;
var _ = require('lodash');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

var conf = {
    paths: {
        src: 'src',
        dist: 'dist',
        tmp: '.tmp',
        e2e: 'e2e'
    },
    wiredep: {
        // exclude: [/\/bootstrap\.js$/],
        directory: 'bower_components'
    },
    errorHandler: function(title) {
        return function(err) {
            gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
            this.emit('end');
        };
    }
};
gulp.task('inject-reload', ['inject'], function() {
    browserSync.reload();
});

gulp.task('inject', ['scripts'], function() {
    var injectStyles = gulp.src([
        path.join(conf.paths.src, '/app/**/*.css')
    ], { read: false });

    var injectScripts = gulp.src([
            path.join(conf.paths.src, '/app/**/*.module.js'),
            path.join(conf.paths.src, '/app/**/*.js'),
        ])
        .pipe($.angularFilesort()).on('af-error', conf.errorHandler('AngularFilesort'));

    var injectOptions = {
        ignorePath: [conf.paths.src, path.join(conf.paths.tmp, '/serve')],
        addRootSlash: false
    };

    return gulp.src(path.join(conf.paths.src, '/*.html'))
        .pipe($.inject(injectStyles, injectOptions))
        .pipe($.inject(injectScripts, injectOptions))
        .pipe(wiredep(_.extend({}, conf.wiredep)))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve')));
});

/**
 * scripts
 */
gulp.task('scripts-reload', function() {
    return buildScripts()
        .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
    return buildScripts();
});

function buildScripts() {
    return gulp.src(path.join(conf.paths.src, '/app/**/*.js'))
        .pipe($.eslint())
        // .pipe($.eslint.format())
        .pipe($.size())
};

/**
 * watch
 */
function isOnlyChange(event) {
    return event.type === 'changed';
}

gulp.task('watch', ['inject'], function() {

    gulp.watch([path.join(conf.paths.src, '/*.html'), 'bower.json'], ['inject-reload']);

    gulp.watch(path.join(conf.paths.src, '/app/**/*.css'), function(event) {
        if (isOnlyChange(event)) {
            browserSync.reload(event.path);
        } else {
            gulp.start('inject-reload');
        }
    });

    gulp.watch(path.join(conf.paths.src, '/app/**/*.js'), function(event) {
        if (isOnlyChange(event)) {
            gulp.start('scripts-reload');
        } else {
            gulp.start('inject-reload');
        }
    });

    gulp.watch(path.join(conf.paths.src, '/app/**/*.html'), function(event) {
        browserSync.reload(event.path);
    });
});

/**
 * serve
 */
function browserSyncInit(baseDir, browser) {
    browser = browser === undefined ? 'default' : browser;

    var routes = null;
    if (baseDir === conf.paths.src || (util.isArray(baseDir) && baseDir.indexOf(conf.paths.src) !== -1)) {
        routes = {
            '/bower_components': 'bower_components'
        };
    }

    browserSync.instance = browserSync.init({
        startPath: '/',
        server: {
            baseDir: baseDir,
            routes: routes
        },
        notify: false,
        browser: browser,
        logPrefix: '-',
        ui: false,
        online: false,
        logLevel: 'silent',
    });
}
browserSync.use(browserSyncSpa({
    selector: '[ng-app]'
}));

gulp.task('clean', function() {
    return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});

gulp.task('build', ['build-inject', 'html', 'fonts', 'other', 'build-scripts', 'build-styles']);

gulp.task('default', ['clean', 'watch'], function() {
    browserSyncInit([path.join(conf.paths.tmp, '/serve'), conf.paths.src]);
});