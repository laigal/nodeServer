var express = require('express');
var bodyParser = require('body-parser')
var mysql = require('mysql');
var fs = require('fs');


var connection = mysql.createConnection({
  host: 'localhost',
  user: 'master',
  password: '1234',
  database: 'tareasDB'
});

connection.connect(function (error) {
  if (error) {
    throw error;
  } else {
    console.log('Conexion correcta con el servidor.');
  }
});

var app = express();

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(jsonParser);
app.use(urlencodedParser);


app.post('/', function (req, res) {
  console.log("petición recibida");
  var nomb = req.body.nombre || '';
  var tar = req.body.tarea || '';
  var nuevaTarea = { nombre: nomb, tarea: tar };

  var query = connection.query('INSERT INTO tareas(nombre, tarea) VALUES(?, ?)', [nomb, tar], function (error, result) {
    if (error) {
      throw error;
    } else {
      console.log(result);
      res.redirect('/');
    }
  }
  );
});

app.get('/tareas', function (req, res) {
  console.log("petición recibida en tareas");
  fs.readFile('./www/Tareas/tareas.html', 'utf8', function (err, text) {

    res.send(text);
  })
});

app.post('/datos', function (req, res) {
  console.log("petición recibida");
  var datos = req.body;
  console.log(datos);
  res.send('Hello ' + datos.nombre);
});

app.get('/eliminar/:id?', function (req, res) {
  console.log("Eliminando registro " + req.query.id);
  connection.query("DELETE FROM tareas WHERE tareas.id=?", [req.query.id], function (error, result) {
    if(error){
      console.log(error);
    }else{
      console.log(result);
    res.redirect('/');
    }
  });
});

app.get('/editar/:id?', function (req, res) {
  connection.query("SELECT* FROM tareas", function (error, result) {
    var registroEditar;
  for (const tarea of result) {
    if(tarea.id==req.query.id){
      registroEditar=tarea;
    }
  }
  fs.readFile('./www/Tareas/tareas.html', 'utf8', function (err, text) {
    var fila = cargarTareas(result);
    var nombre = registroEditar.nombre;
    var tarea = registroEditar.tarea;
    var id= registroEditar.id;
    text = text.replace("[sustituir]", fila);
    text = text.replace('action="/"', 'action="/editar"');
    text = text.replace("[id_editar]", req.query.id);
    text = text.replace('placeholder="Nombre de usuario"', 'value="' + nombre + '"');
    text = text.replace('placeholder="Nombre de la tarea"', 'value="' + tarea + '"');
    res.send(text);
  });
  });
  });

app.post('/editar', function (req, res) {
  
  var nomb = req.body.nombre || '';
  var tar = req.body.tarea || '';
  var id = req.body.id;

  connection.query("UPDATE tareas SET nombre=?,tarea=? WHERE id=?",[nomb,tar,id],function(error,resultado){
    if(error){
      console.log(error);
    }else{
      console.log(resultado);
      res.redirect('/');
    }
  })
});

app.get('/', function (req, res) {
  connection.query('SELECT * FROM tareas', function (error, result) {
    if (error) {
      throw error;
    } else {
      console.log("petición recibida en tareas");
      fs.readFile('./www/Tareas/tareas.html', 'utf8', function (err, text) {

        var fila = cargarTareas(result);
        text = text.replace("[sustituir]", fila)
        res.send(text);
      })
    }
  });
});

app.use(express.static('www/Tareas'));

var server = app.listen(8080, function () {
  console.log('Servidor web iniciado');
});


function cargarTareas(tareas) {
  var lista = "";
  for (var indice in tareas) {
    var fila = `
      <tr>
      <td>[id]</td>
      <td>[nombre]</td>
      <td>[tarea]</td>
      <td><a href="/eliminar?id=[id]">Eliminar</a>
      <a href="/editar?id=[id]">Editar</a></td>
      </tr>
      `;

    fila = fila.split("[id]").join(tareas[indice].id);
    fila = fila.replace("[nombre]", tareas[indice].nombre);
    fila = fila.replace("[tarea]", tareas[indice].tarea);
    lista += fila;
  }
  return lista;
}
