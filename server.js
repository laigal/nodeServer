var express = require('express');

var app = express();

app.use(express.static('www'));

var server = app.listen(80, function () {
  console.log('Servidor web iniciado');
});