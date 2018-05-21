var express = require('express');
var bodyParser = require('body-parser')
var fs = require('fs');
var listaTareas=[];

fs.exists("tareas.json", function(encontrado) {
  if (encontrado){
  console.log("cargando datos...");
  var data=fs.readFileSync("tareas.json","UTF-8");
  listaTareas=JSON.parse(data);
}else{
  listaTareas=[];
}
});

var app = express();
// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(jsonParser);
app.use(urlencodedParser);

app.use(express.static('www/Tareas'));

app.post('/', function (req, res) {
  console.log("petición recibida");

  
  var nomb = req.body.nombre || '';
  var tar = req.body.tarea || '';
  var nuevaTarea={nombre:nomb,tarea:tar};
  listaTareas.push(nuevaTarea);
  actualizarBBDD;
  res.redirect('/');
  // console.log(listaTareas);

  // fs.readFile('./www/Tareas/tareas.html', 'utf8', function (err, text) {
  //   // console.log(text);
    
  //   var fila =cargarTareas(listaTareas);
  //   text = text.replace("[sustituir]", fila)
  //   res.send(text);
  // });
  // res.send('Hello ' + datos.nombre);
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

app.get('/eliminar/:id?',function(req,res){
  console.log("Eliminando registro " + req.query.id);
  listaTareas.splice(req.query.id,1);
  // Eliminar registro de la colección

 actualizarBBDD;

 res.redirect('/');
//   fs.readFile('./www/Tareas/tareas.html', 'utf8', function (err, text) {
//     var fila =cargarTareas(listaTareas);
//     text = text.replace("[sustituir]", fila)
//     res.send(text);
// });
});

app.get('/editar/:id?',function (req,res){
  fs.readFile('./www/Tareas/tareas.html', 'utf8', function (err, text) {
    var fila= cargarTareas(listaTareas);

    
    var nombre=listaTareas[req.query.id].nombre;
    var tarea=listaTareas[req.query.id].tarea;
    text=text.replace("[sustituir]",fila);
    text=text.replace('action="/"','action="/editar"');
    text=text.replace("[id_editar]",req.query.id);
    text=text.replace('placeholder="Nombre de usuario"','value="'+nombre+'"');
    text=text.replace('placeholder="Nombre de la tarea"','value="'+tarea+'"');
    res.send(text);
  });
});

app.post('/editar',function(req,res){
  var nomb = req.body.nombre || '';
  var tar = req.body.tarea || '';
  var id=req.body.id;
  listaTareas[id].nombre=nomb;
  listaTareas[id].tarea=tar;
  actualizarBBDD();
res.redirect('/');
});

app.get('/',function(req,res){
  console.log("petición recibida en tareas");
  fs.readFile('./www/Tareas/tareas.html', 'utf8', function (err, text) {

    var fila =cargarTareas(listaTareas);
    text = text.replace("[sustituir]", fila)
    res.send(text);
  })
});

var server = app.listen(8080, function () {
  console.log('Servidor web iniciado');
});


function cargarTareas(tareas){
  var lista="";
  for(var indice in tareas){
      var fila=`
      <tr>
      <td>[id]</td>
      <td>[nombre]</td>
      <td>[tarea]</td>
      <td><a href="/eliminar?id=[id]">Eliminar</a>
      <a href="/editar?id=[id]">Editar</a></td>
      </tr>
      `;

      fila=fila.split("[id]").join(indice);
      fila=fila.replace ("[nombre]",tareas[indice].nombre);
      fila=fila.replace ("[tarea]",tareas[indice].tarea);
      lista += fila;
  }
  return lista;


}

function actualizarBBDD(){
  fs.writeFile("tareas.json",JSON.stringify(listaTareas),function(){
  console.log("Fichero de datos actualizado");
});
}