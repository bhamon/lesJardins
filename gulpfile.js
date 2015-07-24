'use strict';

var lib = {
	node:{
		path:require('path')
	},
	deps:{
		gulp:require('gulp'),
		rename:require('gulp-rename'),
		bower:require('gulp-bower'),
		usemin:require('gulp-usemin'),
		uglify:require('gulp-uglify'),
		minifyCss:require('gulp-minify-css'),
		minifyHtml:require('gulp-minify-html')
	}
};

var config = {};
config.public = {};
config.public.src = lib.node.path.resolve(__dirname, 'lib', 'public');
config.public.deps = {};
config.public.deps.src = lib.node.path.join(config.public.src, 'deps');
config.public.dist = lib.node.path.resolve(__dirname, 'lib', 'public_dist');
config.public.deps.fonts = {};
config.public.deps.fonts.base = lib.node.path.join(config.public.deps.src, 'material-design-icons');
config.public.deps.fonts.src = lib.node.path.join(config.public.deps.fonts.base, 'iconfont', '*.{eot,ttf,woff,woff2}');
config.public.deps.fonts.dist = lib.node.path.join(config.public.dist, 'fonts');
config.public.index = lib.node.path.join(config.public.src, 'index.html');
config.public.fonts = {};
config.public.fonts.src = lib.node.path.join(config.public.src, 'fonts', '*.{eot,ttf,woff,woff2}');
config.public.fonts.dist = lib.node.path.join(config.public.dist, 'fonts');
config.public.templates = {};
config.public.templates.src = lib.node.path.join(config.public.src, 'templates', '*.html');
config.public.templates.dist = lib.node.path.join(config.public.dist, 'templates');

// Install bower packages
lib.deps.gulp.task('bower', function() {
	return lib.deps.bower()
	.pipe(lib.deps.gulp.dest(config.public.deps.src));
});

// Handle bower components from index
lib.deps.gulp.task('usemin', function() {
	return lib.deps.gulp.src(config.public.index)
	.pipe(lib.deps.usemin({
		depsStyles:[lib.deps.minifyCss({keepSpecialComments:0})],
		styles:[lib.deps.minifyCss({keepSpecialComments:0})],
		depsScripts:[lib.deps.uglify()],
		scripts:[lib.deps.uglify()]
	}))
	.pipe(lib.deps.minifyHtml({quotes:true}))
	.pipe(lib.deps.gulp.dest(config.public.dist));
});

// Build and copy assets
lib.deps.gulp.task('build-assets', ['material-icons-fonts']);

lib.deps.gulp.task('material-icons-fonts', function() {
	return lib.deps.gulp.src(config.public.deps.fonts.src)
	.pipe(lib.deps.rename({
		dirname:lib.node.path.basename(config.public.deps.fonts.dist)
	}))
	.pipe(lib.deps.gulp.dest(lib.node.path.normalize(lib.node.path.join(config.public.deps.fonts.dist, '..'))));
});

// Handle custom files
lib.deps.gulp.task('build-custom', ['custom-fonts', 'custom-templates', 'custom-assets']);

lib.deps.gulp.task('custom-fonts', function() {
	return lib.deps.gulp.src(config.public.fonts.src)
	.pipe(lib.deps.gulp.dest(config.public.fonts.dist));
});

lib.deps.gulp.task('custom-templates', function() {
	return lib.deps.gulp.src(config.public.templates.src)
	.pipe(lib.deps.minifyHtml())
	.pipe(lib.deps.gulp.dest(config.public.templates.dist));
});

lib.deps.gulp.task('custom-assets', function() {
	return lib.deps.gulp.src([
		lib.node.path.join(config.public.deps.src, 'angular', 'angular.min.js'),
		lib.node.path.join(config.public.deps.src, 'angular-ui-router', 'release', 'angular-ui-router.js'),
		lib.node.path.join(config.public.deps.src, 'angular-aria', 'angular-aria.js'),
		lib.node.path.join(config.public.deps.src, 'angular-animate', 'angular-animate.js'),
		lib.node.path.join(config.public.deps.src, 'angular-resource', 'angular-resource.js'),
		lib.node.path.join(config.public.deps.src, 'angular-cookies', 'angular-cookies.js'),
		lib.node.path.join(config.public.deps.src, 'angular-messages', 'angular-messages.js'),
		lib.node.path.join(config.public.deps.src, 'angular-material', 'angular-material.min.js'),
		lib.node.path.join(config.public.deps.src, 'marked', 'lib', 'marked.js'),
		lib.node.path.join(config.public.deps.src, 'angular-marked', 'angular-marked.js'),
/*
		lib.node.path.join(config.public.deps.src, 'highstock-release', 'adapters', 'standalone-framework.src.js'),
		lib.node.path.join(config.public.deps.src, 'highstock-release', 'highstock.src.js'),
		lib.node.path.join(config.public.deps.src, 'highcharts-ng', 'dist', 'highcharts-ng.js')
*/
	], {base:config.public.src})
	.pipe(lib.deps.gulp.dest(config.public.dist));
});

// Gulp tasks
lib.deps.gulp.task('install', ['bower']);
lib.deps.gulp.task('build', ['usemin', 'build-assets', 'build-custom']);
lib.deps.gulp.task('default', ['build']);