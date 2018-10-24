
//DEPENDENCIES
var bodyParser = require('body-parser');
var favicon = require('express-favicon');
var morgan = require('morgan'); // replaces logger
var methodOverride = require('method-override')
var errorHandler = require('errorhandler');

//CONFIG

module.exports = function(app, process, dirname, express, path, routes, renderEngine) {
    // all environments
    app.engine('html', renderEngine.renderFile);

    app.set('port',  process.env.PORT || 3000);
    app.set('view engine', 'ejs');
    app.set('views', path.join(dirname, 'views'));

    app.use(favicon(dirname + '/public/favicon.png'));
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(methodOverride());
    //app.use(app.router); deprecated!
    app.use(express.static(path.join(dirname, 'public')));

    // development only
    if ('development' == app.get('env')) {
        app.use(errorHandler());
    }
}
