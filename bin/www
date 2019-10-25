var express = require('express');
var app = express();
var path = require('path');

// Routes
app.get('/', function(req, res) {
  res.render("index")
});

// Listen
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on localhost:'+ port);

app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;