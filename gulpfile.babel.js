'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import babel from 'gulp-babel';
import plumber from 'gulp-plumber';
import runSequence from 'run-sequence';

import del from 'del';

const BUILD_DIR = 'dist/server';

gulp.task('clean', () => {
  return del.sync([
    `${BUILD_DIR}/*`,
    `!${BUILD_DIR}/.gitkeep`
  ]);
});

gulp.task('build:js', () => {
  return gulp.src('src/server/**/*.js')
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('build', () => runSequence('clean', 'build:js'));
gulp.task('watch', runSequence('build'), () => {
  gulp.watch('./src/**/*.js', () => runSequence('build'));
});
