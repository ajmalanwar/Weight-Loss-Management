var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const flash = require('connect-flash');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var weightRouter = require('./routes/weights');
const weightAjaxRoutes = require('./routes/weightAjax');
const db = require('./database/db')
var app = express();

//import the express-session
const session = require('express-session');

// session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { id: req.session.userId, email: req.session.userEmail } : null;
  next();
});

app.use(express.urlencoded({ extended: true })); // Required for parsing form data


const expressLayouts = require('express-ejs-layouts');
//layout setup
app.use(expressLayouts);
app.set('layout', 'layouts/main-layout');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');





app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/weights', weightRouter); 
app.use('/weights/ajax', weightAjaxRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
