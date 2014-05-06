var gulp = require('gulp'),
    util = require('gulp-util'),
    es = require('event-stream'),
    http = require('http'),
    sass = require('gulp-sass'),
    jshint = require('gulp-jshint'),
    connect = require('connect'),
    tiny_lr = require('tiny-lr'),
    connectLr = require('connect-livereload');

var outputDir = 'build'

var target = process.env.TARGET || 'development';

gulp.task('sass', function() {
    var config = {};

    if(target === 'development')
        config.sourceComments = 'map';

    if(target === 'production')
        config.outputStyle = 'compressed';

    return gulp.src('app/style/style.scss')
        .pipe(sass(config))
        .pipe(gulp.dest(outputDir + '/css/'))
        .pipe(reload());
});

gulp.task('lint', function() {
    return gulp.src('app/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('html', function() {
    return gulp.src('app/index.html')
        .pipe(gulp.dest(outputDir))
        .pipe(reload());
});

gulp.task('watch', function() {
    gulp.watch('app/*.html', ['html']);
    gulp.watch('app/js/**/*.js', ['lint']);
    gulp.watch('app/style/**/*.scss', ['sass']);
});

gulp.task('default', ['lint', 'sass', 'connect', 'watch']);


gulp.task('connect', function() {
    startServer();
});

var lr;

var startServer = function() {
    var appPort = 3000,
        livereloadPort = 35729,
        server,
        app;

    var middleware = [];

    middleware.push(connectLr({ port: livereloadPort }));
    middleware.push(connect.static(outputDir));

    app = connect.apply(null, middleware);
    server = http.createServer(app);

    app.use(connect.directory(outputDir));

    server.listen(appPort);

    util.log(util.colors.green('Server started http://localhost:' + appPort));

    tiny_lr.Server.prototype.error = function() {};
    lr = tiny_lr();
    lr.listen(livereloadPort);

    util.log(util.colors.green('LiveReload started on port: ' + livereloadPort));
}

var reload = function() {
    return es.map(function(file, callback) {
        lr.changed({
            body: {
                files: file.path
            }
        });

        return callback(null, file);
    });
}
