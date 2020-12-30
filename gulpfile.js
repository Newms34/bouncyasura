// First, we'll just include gulp itself.
const gulp = require('gulp');

// Include Our Plugins
const jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    terser = require('gulp-terser'),
    cleany = require('gulp-clean-css'),
    babel = require('gulp-babel'),
    addSrc = require('gulp-add-src'),
    cachebust = require('gulp-cachebust'),
    replace = require('gulp-replace'),
    cabu = new cachebust(),
    iife = require('gulp-iife'),
    th2 = require('through2'),
    chalk = require('chalk'),
    devVue = 'https://cdn.jsdelivr.net/npm/vue/dist/vue.js',
    prodVue = 'https://cdn.jsdelivr.net/npm/vue@2.6.12',
    cleanF = require('gulp-clean'),
    del = require('del');
let sassStart = 0,
    jsStart = 0;
const reporterFn = function (results, data, opts = {}) {
    const errLen = results.filter(q => q.error.code[0] == 'E').length,
        warnLen = results.filter(q => q.error.code[0] == 'W').length;
    let str = '',
        prevfile;

    // opts = opts || {};

    results.forEach(function (result) {
        var file = result.file;
        var error = result.error;

        if (prevfile && prevfile !== file) {
            str += "\n";
        }
        prevfile = file;
        if (error.code[0] == 'E') {
            str += chalk.red('ERR: ');
        } else if (error.code[0] == 'W' && error.reason != 'Missing semicolon.') {
            str += chalk.yellow('WARN: ');
        } else if (error.code[0] == 'W' && error.reason == 'Missing semicolon.') {
            str += chalk.rgb(128, 128, 0)('Semicolon: ');
        }
        // str += error.code[0]=='E'?chalk.red('ERR:'):chalk.yellow("WARN:")
        str += `${file}: line ${error.line}, col ${error.character} - ${error.reason}`;
        // str += file + ': line ' + error.line + ', col ' + error.character + ', ' + error.reason + 'FULL ERR:' + JSON.stringify(error);

        if (opts.verbose) {
            str += ' (' + error.code + ')';
        }

        str += '\n';
    });

    if (str) {
        console.log(`${str}\n ${errLen} ${chalk.red("error" + (errLen === 1 ? '' : 's'))},  ${warnLen} ${chalk.yellow("warning" + (warnLen === 1 ? '' : 's'))}`)
        // console.log(str + "\n" + len + ' error' + ((len === 1) ? '' : 's'));
    }
    // console.log('NOT SURE WHERE THIS GOES!')
}
// Lint Task
gulp.task('lint', function () {
    let alreadyRan = false,
        semisDone = false;
    return gulp.src(['build/js/main/*.js', 'build/js/main/**/*.js', 'build/js/admin/*.js', 'build/js/admin/**/*.js'])
        .pipe(th2.obj((file, enc, cb) => {
            if (!alreadyRan) {
                drawTitle('Front-End Linting');
                alreadyRan = true;
            }
            // jsStart = file._contents.toString('utf8').length;
            return cb(null, file);
        }))
        .pipe(jshint({
            esversion: 8
        }))
        .pipe(jshint.reporter(reporterFn));
});

gulp.task('lintBE', function () {
    let alreadyRan = false;
    return gulp
        .src(['routes/*.js', 'routes/**/*.js'])
        .pipe(th2.obj((file, enc, cb) => {
            if (!alreadyRan) {
                drawTitle('Back-End Linting');
                alreadyRan = true;
            }
            // jsStart = file._contents.toString('utf8').length;
            return cb(null, file);
        }))
        .pipe(jshint({
            esversion: 8
        }))
        .pipe(jshint.reporter(reporterFn));
});


gulp.task('html', function () {
    return gulp
        .src(['build/views/*.html', 'build/views/**/*.html'])
        .pipe(cabu.references())
        .pipe(replace(devVue, function (m) {
            if (process.env.NODE_ENV && process.env.NODE_ENV == 'production') {
                return prodVue;
            }
            return m;
        }))
        .pipe(gulp.dest('./views'))
})

gulp.task('imgs', function () {
    return gulp
        .src(['build/img/*.*', 'build/img/**/*.*'])
        // .pipe(cabu.resources())
        .pipe(gulp.dest('public/img'))
})

gulp.task('fonts', function () {
    return gulp
        .src(['build/fonts/*.*'])
        // .pipe(cabu.resources())
        .pipe(gulp.dest('public/fonts'))
})
gulp.task('media', function () {
    return gulp
        .src(['build/media/*.*'])
        // .pipe(cabu.resources())
        .pipe(gulp.dest('public/media'))
})

// Compile Our Sass
gulp.task('sass', function () {
    let alreadyRan = false;
    return gulp.src('build/scss/*.scss')
        .pipe(th2.obj((file, enc, cb) => {
            if (!alreadyRan) {
                drawTitle('SASS (SCSS) Compiling');
                alreadyRan = true;
            }
            // jsStart = file._contents.toString('utf8').length;
            return cb(null, file);
        }))
        .pipe(sass())
        .pipe(th2.obj((file, enc, cb) => {
            // console.log('FILE IS',file._contents.toString('utf8'),'ENC',enc,'CB',cb);
            sassStart = file._contents.toString('utf8').length;
            return cb(null, file);
        }))
        .pipe(concat('styles.css'))
        .pipe(cleany())
        .pipe(th2.obj((file, enc, cb) => {
            // console.log('FILE IS',file._contents.toString('utf8'),'ENC',enc,'CB',cb);
            // sassDims.e = file._contents.toString('utf8');
            let sassEnd = file._contents.toString('utf8').length,
                sassRedPerc = Math.floor(10000 * (sassStart - sassEnd) / sassStart) / 100;
            console.log('CSS reduced from', sassStart, 'to', sassEnd + '. Reduction of', sassRedPerc + '%.')
            return cb(null, file);
        }))
        .pipe(cabu.resources())
        .pipe(gulp.dest('public/css'));
});
gulp.task('scriptsAdmin', function () {
    let alreadyRan = false;
    return gulp.src(['build/js/admin/*.js', 'build/js/admin/**/*.js'])
        .pipe(th2.obj((file, enc, cb) => {
            if (!alreadyRan) {
                drawTitle('Front-End Script Concatenation, Minification, and Uglification');
                alreadyRan = true;
            }
            // jsStart = file._contents.toString('utf8').length;
            return cb(null, file);
        }))
        .pipe(concat('adminCust.js'))
        .pipe(th2.obj((file, enc, cb) => {
            // console.log('FILE IS',file._contents.toString('utf8'),'ENC',enc,'CB',cb);
            jsStart = file._contents.toString('utf8').length;
            return cb(null, file);
        }))
        .pipe(iife())
        .pipe(gulp.dest('public/js'))
        .pipe(babel({
            presets: [
                [
                    "@babel/preset-env",
                    // {
                    //     useBuiltIns: "usage",
                    //     corejs: 2,
                    //     targets: {
                    //         firefox: "64", // or whatever target to choose .    
                    //     },
                    // }
                ]
            ]
        }))
        .pipe(terser())
        .pipe(th2.obj((file, enc, cb) => {
            // console.log('FILE IS',file._contents.toString('utf8'),'ENC',enc,'CB',cb);
            let jsEnd = file._contents.toString('utf8').length,
                jsRedPerc = Math.floor(10000 * (jsStart - jsEnd) / jsStart) / 100;
            console.log('Admin JS reduced from', jsStart, 'to', jsEnd + '. Reduction of', jsRedPerc + '%.')
            return cb(null, file);
        }))
        .pipe(concat('admin.js'))
        .pipe(rename('admin.min.js'))
        .pipe(cabu.resources())
        .pipe(gulp.dest('public/js'));
});
// Concatenate & Minify JS
gulp.task('scriptsMain', function () {
    let alreadyRan = false;
    return gulp.src(['build/js/main/*.js', 'build/js/main/**/*.js'])
        .pipe(th2.obj((file, enc, cb) => {
            if (!alreadyRan) {
                drawTitle('Front-End Script Concatenation, Minification, and Uglification');
                alreadyRan = true;
            }
            // jsStart = file._contents.toString('utf8').length;
            return cb(null, file);
        }))
        .pipe(concat('mainCust.js'))
        .pipe(th2.obj((file, enc, cb) => {
            // console.log('FILE IS',file._contents.toString('utf8'),'ENC',enc,'CB',cb);
            jsStart = file._contents.toString('utf8').length;
            return cb(null, file);
        }))
        .pipe(iife())
        .pipe(gulp.dest('public/js'))
        .pipe(babel({
            presets: [
                [
                    "@babel/preset-env",
                    // {
                    //     useBuiltIns: "usage",
                    //     corejs: 2,
                    //     targets: {
                    //         firefox: "64", // or whatever target to choose .    
                    //     },
                    // }
                ]
            ]
        }))
        .pipe(terser())
        .pipe(th2.obj((file, enc, cb) => {
            // console.log('FILE IS',file._contents.toString('utf8'),'ENC',enc,'CB',cb);
            let jsEnd = file._contents.toString('utf8').length,
                jsRedPerc = Math.floor(10000 * (jsStart - jsEnd) / jsStart) / 100;
            console.log('Main JS reduced from', jsStart, 'to', jsEnd + '. Reduction of', jsRedPerc + '%.')
            return cb(null, file);
        }))
        .pipe(addSrc.prepend(['build/js/libs/*.js', 'build/js/libs/**/*.js']))
        .pipe(concat('main.js'))
        .pipe(rename('main.min.js'))
        .pipe(cabu.resources())
        .pipe(gulp.dest('public/js'));
});

// gulp.task('cleanMe', function () {
//     let alreadyRan = false;
//     if (!alreadyRan) {
//         drawTitle('Removing Temp Files');
//         alreadyRan = true;
//     }
//     return del([
//         'public/js/adminCust.js', 'public/js/mainCust.js'
//     ]);
// });

gulp.task('cleanMe', function () {
    return gulp.src(['public', 'views'], { read: false, allowEmpty: true })
        .pipe(cleanF());
});

// Watch Files For Changes
gulp.task('watch', function () {
    let alreadyRan = false;
    drawTitle('Watching Front-End scripts, Back-End Scripts, and CSS', true)
    gulp.watch(['build/js/**/*.js', 'build/js/*.js'], gulp.series('lint', 'scriptsMain', 'scriptsAdmin', 'cleanMe'));
    gulp.watch(['routes/*.js', 'routes/**/*.js', 'models/*.js', 'models/**/*.js'], gulp.series('lintBE'))
    gulp.watch(['build/scss/*.scss', 'build/scss/**/*.scss'], gulp.series('sass'));
});

//task to simply create everything without actually watching or starting the DB
gulp.task('render', gulp.series('cleanMe','lint', 'lintBE', 'sass', 'scriptsMain', 'scriptsAdmin', 'html', 'imgs', 'fonts', 'media'))

// Default Task
gulp.task('default', gulp.series('cleanMe','lint', 'lintBE', 'sass', 'scriptsMain', 'scriptsAdmin', 'html', 'imgs', 'fonts', 'media', 'watch'));

let currColInd = 0;

const drawTitle = (t, w) => {
    // console.log('cols',process.stdout.columns);
    let wid = process.stdout.columns;
    // console.log(wid, t.length)
    if (t.length >= wid) {
        console.log(chalk['bg' + colorBgs[currColInd]](t.slice(0, wid)));
    } else {
        let dif = wid - t.length,
            front = 0,
            back = 0;
        if (dif % 2 == 0) {
            front = dif / 2;
            back = dif / 2;
        } else {
            front = (dif - 1) / 2;
            back = (dif + 1) / 2;
        }
        // console.log('dif', dif)
        console.log(chalk.bgHsl(currColInd, 100, 50).black((' '.repeat(front)) + t + (' '.repeat(back))))
    }
    currColInd += 30;
    currColInd = currColInd % 360;
    if (w) {
        //draw caution bars
        let wt = wid % 2 === 0 ? wid : wid - 1;
        console.log((chalk.bgYellowBright(' ') + chalk.bgBlack(' ')).repeat(wt / 2))
    }
};