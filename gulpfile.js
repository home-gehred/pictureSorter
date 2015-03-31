var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    notify = require('gulp-notify'),
    mocha = require('gulp-mocha'),
    sourceGlob = [
        './gulpfile.js',
        './index.js',
        './src/**/*.js'
    ],
    testGlob = [
        './src/**/*.test.js'
    ];

gulp.task('default', function () {
    // place code for your default task here
    return gulp.src(sourceGlob)
        .pipe(jscs())
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(notify({ message: 'default task complete' }));
});

gulp.task('jscs', function () {
    return gulp.src(sourceGlob)
        .pipe(jscs())
        .pipe(notify({ message: 'jscs complete'}));
});

gulp.task('unit_test', function () {
    return gulp.src(testGlob)
        .pipe(mocha({
            reporter: 'spec',
            ui: 'tdd',
            timeout: 60000,
            globals: {
            //expect: require('expect')
        }}))
        .pipe(notify({message: 'unit tests complete'}));
});
