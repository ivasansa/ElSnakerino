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
 if(emitS == "online"){
    socket.emit(emitS, {
            u: data

        });
//        socket.broadcast.emit(emitS, {
//            u: data
//        });
 } else if(emitS == "pinta"){
//     console.log(data);
     socket.emit(emitS, {
        u: data
     });
    socket.broadcast.emit(emitS, {
        u: data
    });
 }
     else{
         console.log("error");
     }
}

io.sockets.on('connection', function (socket) {

    socket.on('reg', function (data) {
        console.log('SERVIDOR -> Login User->' + data.u);
        var u = new user(data.u);
        u.spawn();
        listaUsers.push(u);
        u.index = listaUsers.indexOf(u);

        MongoClient.connect(urldb, function(err, db) {
          assert.equal(null, err);
          insertDocument(db, data, function() {
              db.close();
          });
        });
//        console.log(u.pos);

        u = listaUsers[u.index];
        enviarMissatges(socket,u,"online");
        enviarMissatges(socket,u,"pinta");
        /**/



    });


    socket.on('ks', function (data) {
            var ind = data.u.index;
//            var u = data.u;
//            listaUsers[ind].oldPos = listaUsers[ind].pos;
            var oldPos = listaUsers[ind].pos;
//            var newPosX = listaUsers[ind].pos.x;
//            console.log(newPosX);
            //            console.log(u.pos);
            //         u.oldPos = u.pos;
            //        console.log(u.oldPos.x);
            switch (data.d) {
                case "l":
                    if(listaUsers[ind].pos.x > 0){
                        listaUsers[ind].oldPos.y = listaUsers[ind].pos.y;
                        listaUsers[ind].oldPos.x = listaUsers[ind].pos.x;
                        listaUsers[ind].pos.x -= 1;
                    }
                    break;
                case "u":
                    if(listaUsers[ind].pos.y > 0){
                        listaUsers[ind].oldPos.x = listaUsers[ind].pos.x;
                        listaUsers[ind].oldPos.y = listaUsers[ind].pos.y;
                        listaUsers[ind].pos.y -= 1;
                    }
                    break;
                case "r":
                    if(listaUsers[ind].pos.x < 19){
                        listaUsers[ind].oldPos.y = listaUsers[ind].pos.y;
                        listaUsers[ind].oldPos.x = listaUsers[ind].pos.x;
                        listaUsers[ind].pos.x += 1;
                    }
                    break;
                case "d":
                    if(listaUsers[ind].pos.y < 19){
                        listaUsers[ind].oldPos.x = listaUsers[ind].pos.x;
                        listaUsers[ind].oldPos.y = listaUsers[ind].pos.y;
                        listaUsers[ind].pos.y += 1;
                    }
                    break;
            }
//            listaUsers[ind].oldPos = oldPos;
            console.log("OLD: "+listaUsers[ind].oldPos.x+" "+listaUsers[ind].oldPos.y);
            console.log("NEW: "+listaUsers[ind].pos.x+" "+listaUsers[ind].pos.y);
            var u = listaUsers[ind];

            //         console.log('SERVIDOR -> dades rebudes del client->' + u.oldPos.x);
            enviarMissatges(socket,u,"pinta");
        });

     socket.on('b', function (data) {
        console.log('SERVIDOR -> dades rebudes del client->' + data.b);
        enviarMissatges(socket,data);
    });

});
