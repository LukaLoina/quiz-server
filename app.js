var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
var MemoryStore = require('memorystore')(session)

var apiRouter = require('./routes/api');

var app = express();


app.set('trust proxy', 1); //trust first proxy
app.use(session({
    cookie: {maxAge: 720000},
    store: new MemoryStore({checkPeriod: 720000}),
    secret: 'arithmeticMentalStressTest secret key',
    resave: false,
    saveUninitialized: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    console.log(err)
    res.locals.error = req.app.get('env') === 'development' ? err : {}; 
    // render the error page
    res.status(err.status || 500).json({"status": 'error', "error": res.locals.error});
});

module.exports = app;
