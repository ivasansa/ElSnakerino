var app = require('http').createServer(onRequest);
var io = require('socket.io').listen(app);
var fs = require('fs');
var url = require("url");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert'); //utilitzem assercions
var ObjectId = require('mongodb').ObjectID;
var user = require("./User.js");

console.log('servidor iniciat');
app.listen(3000);

var urldb = 'mongodb://localhost:27017/daw2';

var listaUsers = [];


var insertDocument = function(db, data, callback) {
   db.collection('usuaris').update({"_id":data.u},{
    "_id":data.u,
     "nom": data.u
    },{'upsert':true}, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the usuaris collection.");
        callback();
  });
};

function onRequest(req, res) {
    var pathname = url.parse(req.url).pathname;
    if (pathname == '/') {
        fs.readFile(__dirname + '/index.html',
            function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error carregant pàgina');
                }
                res.writeHead(200);
                res.end(data);
            });



    } else if (pathname == '/script.js') {
        fs.readFile(__dirname + '/script.js',
            function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error carregant pàgina');
                }
                res.writeHead(200);
                res.end(data);
            });
    } else if (pathname == '/style.css') {
        fs.readFile(__dirname + '/style.css',
            function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error carregant pàgina');
                }
                res.writeHead(200);
                res.end(data);
            });
    } else {
        res.writeHead(404, {
            "Content-Type": "text/html; charset=utf-8"
        });
        sortida = "404 NOT FOUND";
        res.write(sortida);
        res.end();
    }
}


function enviarMissatges(socket,data, emitS){
  socket.emit(emitS, {
            u: JSON.stringify(listaUsers)
        });
        socket.broadcast.emit(emitS, {
            u: JSON.stringify(listaUsers)
        });
}
io.sockets.on('connection', function (socket) {

    socket.on('reg', function (data) {
        console.log('SERVIDOR -> Login User->' + data.u);

        listaUsers.push(new user(data.u));

        MongoClient.connect(urldb, function(err, db) {
          assert.equal(null, err);
          insertDocument(db, data, function() {
              db.close();
          });
        });

        enviarMissatges(socket,data,"online");

    });
     socket.on('g', function (data) {
        console.log('SERVIDOR -> dades rebudes del client->' + data.g);
        enviarMissatges(socket,data);
    });
     socket.on('b', function (data) {
        console.log('SERVIDOR -> dades rebudes del client->' + data.b);
        enviarMissatges(socket,data);
    });

});
