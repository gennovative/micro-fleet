const 
	del = require("del"),
	cache = require('gulp-cached'),
	debug = require("gulp-debug"),
	dts = require('dts-generator'),
	header = require('gulp-header'),
	istanbul = require('gulp-istanbul'),
	gulp = require("gulp"),
	merge = require('merge-stream'),
	mocha = require('gulp-mocha'),
	remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul'),
	replace = require('gulp-replace'),
	sequence = require('gulp-watch-sequence'),
	sourcemaps = require('gulp-sourcemaps'),
	through = require("through2"),
	tsc = require("gulp-typescript"),
	tsProject = tsc.createProject("tsconfig.json"),
	tslint = require('gulp-tslint'),
	watch = require('gulp-watch')
	;

let onError = function (err) {
	console.error(err.toString());
	this.emit('end');
};

const DIST_FOLDER = 'dist';

/**
 * Removes `dist` folder.
 */
gulp.task('clean', function() {
	return del.sync([DIST_FOLDER]);
});


/**
 * Removes nested `typings` folder to avoid "Duplicate Identifier" error.
 */
gulp.task('dedup', function () {
	return del.sync(['node_modules/**/node_modules/**/typings']);
});


/**
 * Checks coding convention.
 */
const LINT_FILES = ['src/**/*.ts', '!node_modules/**/*.*'];
let lintCode = function() {
	return gulp.src(LINT_FILES)
		.pipe(cache('linting'))
		.pipe(tslint({
			formatter: "verbose"
		}))
		.pipe(tslint.report())
};
gulp.task('tslint', ['clean'], lintCode);
gulp.task('tslint-hot', lintCode);


/**
 * Compiles TypeScript sources and writes to `dist` folder.
 */
const TS_FILES = ['src/**/*.ts', '!node_modules/**/*.*'],
	TYPING_FILES = ['typings/**/*.d.ts', '!typings/app.d.ts'];
let compile = function () {
	let compileTs = gulp.src(TS_FILES)
		.pipe(cache('compiling'));

	let includeTypings = gulp.src(TYPING_FILES);

	return merge(compileTs, includeTypings)
		.on('error', onError)
		.on('failed', onError)
		.pipe(debug())
		// .pipe(sourcemaps.init())
		.pipe(tsProject(tsc.reporter.fullReporter(true)))
		// .pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(DIST_FOLDER));
};
gulp.task('compile', ['tslint'], compile);
gulp.task('compile-hot', ['tslint-hot'], compile);


/**
 * Prepares coverage report before running test cases.
 */
const JS_FILES = ['dist/**/*.js', '!dist/test/**/*.*'];
let preTest = function () {
	return gulp.src(JS_FILES)
		// Covering files
		.pipe(istanbul({includeUntested: true}))
		// Force `require` to return covered files
		.pipe(istanbul.hookRequire());
};
gulp.task('pre-test', ['compile'], preTest);
gulp.task('pre-test-standalone', preTest);


/**
 * Runs all test cases.
 */
const TEST_FILES = ['dist/test/**/*.js'];
let runTest = function () {
	return gulp.src(TEST_FILES)
		// gulp-mocha needs filepaths so you can't have any plugins before it
		.pipe(mocha({reporter: 'spec'}))	
		// Creating the reports after tests ran
		.pipe(istanbul.writeReports())
		.once('error', function (err) {
			onError(err);
			process.exit(1);
		});
};
gulp.task('run-test', ['pre-test'], runTest);
gulp.task('run-test-standalone', ['pre-test-standalone'], runTest);


/**
 * Remaps coverage reports from transpiled code to original TypeScript code.
 */
let remap = function () {
	return gulp.src(['coverage/coverage-final.json'])
		.pipe(remapIstanbul({
			fail: true,
			reports: {
				'json': 'coverage/coverage-remapped.json',
				'html': 'coverage/remapped-report'
			}
		}));
};
gulp.task('remap-istanbul', ['run-test'], remap);
gulp.task('remap-istanbul-standalone', ['run-test-standalone'], remap);

gulp.task('test-full', ['pre-test', 'run-test', 'remap-istanbul']);


/**
 * Copies all resources that are not TypeScript files into `dist` directory.
 */
const RESRC_FILES = ['src/**/*', '!./**/*.ts'];
gulp.task('resources', () => {
	return gulp.src(RESRC_FILES)
		.pipe(cache('resourcing'))
		.pipe(debug())
		.pipe(gulp.dest(DIST_FOLDER));
});

/**
 * Generates TypeScript definition file (.d.ts)
 */
const DEF_FILE = './typings/app.d.ts';
gulp.task('definition', ['compile'], (done) => {
	let pkg = require('./package.json'),
	config = {
		name: pkg['name'],
		project: './',
		out: DEF_FILE,
		sendMessage: console.log,
		verbose: true,
		exclude: ['src/test/**/*.*', 'typings/**/*.*', 'node_modules/**/*.*', 'dist/**/*.*', 'coverage/**/*.*', '.git/**/*.*', 'gulpfile.js']
	};

	del.sync([DEF_FILE]);
	dts.default(config).then(() => { 
		gulp.src(DEF_FILE)
			.on('error', onError)
			.pipe(replace(/([\t\f\v]*)private(.*);[\r\n]*/g, ''))
			.pipe(replace(/\/src\//g, '/dist/'))
			.pipe(replace(/\/dist\/app\/index'/g, "'"))
			.pipe(through.obj(function(file, enc, cb) {
				del.sync([DEF_FILE]);
				this.push(file);
				cb();
			}))
			.pipe(header('/// <reference path="./global.d.ts" />\r\n\r\n'))
			.pipe(gulp.dest('./typings'))
			.on('end', done);
	});
});



/*
 * Default task which is automatically called by "gulp" command.
 */
gulp.task('default', [
	'clean',
	'tslint',
	'compile',
	'resources',
	'test-full']);

gulp.task('release', [
	'clean',
	'compile',
	'resources',
	'definition']);

/*
 * gulp watch
 */
gulp.task('watch', ['clean', 'tslint', 'compile', 'resources'], () => {
	let queue = sequence(1000); // 1 sec

	watch(RESRC_FILES, {
		name: 'watch-resource',
		emitOnGlob: false
	}, queue.getHandler('resources'));

	watch(TS_FILES, {
		name: 'watch-code',
		emitOnGlob: false
	}, queue.getHandler('tslint-hot', 'compile-hot'));
});

/*
 * gulp test
 */
gulp.task('test', [
	'pre-test-standalone',
	'run-test-standalone',
	'remap-istanbul-standalone']);

gulp.task('clean-cache', function () {
	cache.caches = {};
});