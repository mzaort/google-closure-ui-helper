'use strict';

var argv = require('yargs').argv;
var debug = require('gulp-debug');
var del = require('del');
var download = require('gulp-download');
var exec = require('child_process').exec;
var filter = require('gulp-filter');
var fs = require('fs.extra');
var git = require('gulp-git');
var gjslint = require('gulp-gjslint');
var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var unzip = require('gulp-unzip');
var util = require('util');
var zip = require('gulp-zip');

var config = {
	path: {
		src: {
			css: path.join(__dirname, 'src', 'main', 'webapp', 'css'),
			javascript: path.join(__dirname, 'src', 'main', 'webapp', 'js')
		},
		lib: {
			base: path.join(__dirname, 'src', 'main', 'webapp', 'lib'),
			closureLibrary: path.join(__dirname, 'src', 'main', 'webapp', 'lib', 'closure-library'),
			closureCompiler: path.join(__dirname, 'src', 'main', 'webapp', 'lib', 'closure-compiler', 'compiler.jar')
		},
		package: 'google-closure-ui-helper.zip'
	},
	revision: {
		closureLibrary: 'npm-v20171203.0.0'
	}
};

gulp.task('init', ['init:download-gcl', 'init:download-gcc']);

gulp.task('init:download-gcl', function(callback) {
	if (fs.existsSync(config.path.lib.closureLibrary)) {
		callback();
		return;
	}
	fs.mkdirp(config.path.lib.base, function() {
		git.clone(
			'https://github.com/google/closure-library.git',
			{cwd: config.path.lib.base},
			function(err) {
				if (err) throw err;
				process.chdir(config.path.lib.closureLibrary);
				git.checkout(config.revision.closureLibrary, function(err2) {
					if (err2) throw err2;
					callback();
				});
			});
	});
});

gulp.task('init:download-gcc', function(callback) {
	fs.exists(config.path.lib.closureCompiler, function(exists) {
		if (exists) {
			callback();
			return;
		}
		fs.mkdirp(path.dirname(config.path.lib.closureCompiler), function() {
			download('http://dl.google.com/closure-compiler/compiler-latest.zip')
				.pipe(unzip())
				.pipe(debug({title: 'init:download-gcc:'}))
				.pipe(gulp.dest(path.dirname(config.path.lib.closureCompiler)))
				.on('end', callback);
		});
	});
});

gulp.task('package', function() {
	return gulp.src(['src/main/webapp/**/*', '!src/main/webapp/WEB-INF{,/**}'])
		.pipe(debug({title: 'package:'}))
		.pipe(zip(config.path.package))
		.pipe(gulp.dest('.'));
});

gulp.task('default', ['init']);