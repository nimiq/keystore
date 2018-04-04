const gulp = require('gulp');

const NimiqBuild = require('../../meta/build-process/nimiq-base-gulpfile.js');

gulp.task('clean', () => NimiqBuild.cleanBuild('deployment-keyguard/dist'));

gulp.task('build', ['clean'], () => NimiqBuild.build({
    jsEntry: 'src/keyguard.js',
    cssEntry: 'src/keyguard.css',
    htmlEntry: 'src/index.html',
    rootPath: `${__dirname}/../../`,
    distPath: 'deployment-keyguard/dist'
}));

gulp.task('build-iframe', () => NimiqBuild.build({
    jsEntry: 'src/keyguard.js',
    cssEntry: 'src/keyguard.css',
    htmlEntry: 'src/index-list-only.html',
    rootPath: `${__dirname}/../../`,
    distPath: 'deployment-keyguard/dist'
}));

gulp.task('default', ['build']);
