var app = require('http').createServer(onRequest);
var io = require('socket.io').listen(app);
var fs = require('fs');
var url = require("url");
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert'); //utilitzem assercions
var ObjectId = require('mongodb').ObjectID;
var user = require("./User.js");
var apple = require("./Apple.js");

console.log('servidor iniciat');
app.listen(3000);

var urldb = 'mongodb://localhost:27017/daw2';

var listaUsers = [];
var listaManzanas = [];
var tT = [];

var topTen = function (db, callback) {
        var cursor = db.collection('usuaris').find().sort({
            "punts": -1
        });
        cursor.each(function (err, u) {
            assert.equal(err, null);
            if (u != null) {
                tT.push(u.nom + ': ' + u.punts);
            } else {
                callback();
            }
        });
    };

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

var guardarPunt = function(db, data, callback) {
   db.collection('usuaris').update({"_id":data.nom},{
    "_id":data.nom,
     "nom": data.nom,
    "punts": data.punt
    },{'upsert':true}, function(err, result) {
        assert.equal(err, null);
        console.log("Inserted a document into the usuaris collection.");
        callback();
  });
};

function morir(socket, u){
    //guardar punt bd
    MongoClient.connect(urldb, function(err, db) {
          assert.equal(null, err);
          guardarPunt(db, u, function() {
              db.close();
          });
    });
    //eliminar jug de lista
    listaUsers.splice(u.index,1);
    for(var i=u.index; i<listaUsers.length; ++i){
        listaUsers[i].index -=1;
    }
    //emit para mostrar pagina de resumen/login

    //broadcast para borrar el recuadro del muerto
    socket.broadcast.emit("muerte", {u: u});
    socket.emit("youDied", {u: u});
    //console.log OP
    console.log("Me morio");
}

function hayManzana(socket,u){
    var len = listaManzanas.length;
    var x = u.pos.x;
    var y = u.pos.y;
    var out = -1;
    if(len >0){
        for(var i = 0; i < len; ++i){
            if((listaManzanas[i].pos.x == x) && (listaManzanas[i].pos.y == y)){
                var m = listaManzanas[i];
                listaUsers[u.index].punt += 50;
                console.log(listaUsers[u.index].punt);
                out = i;
                enviarMissatges(socket,m,"borraManzana");
            }
        }
        if(out != -1)listaManzanas.splice(out,1);
        out = -1;
    }
}

function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

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
 if(emitS == "online" || emitS == "topTen"){
    socket.emit(emitS, {
            u: data

        });
//    socket.broadcast.emit(emitS, {
//        u: data
//    });
 } else if(emitS == "pinta" || emitS == "pintaManzana" || emitS == "borraManzana"){
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

    var interval = setInterval(function() {
        if(listaManzanas.length <= 5){
            var m = new apple();
            m.spawn();
            listaManzanas.push(m);

            enviarMissatges(socket,m,"pintaManzana");
        }
    },getRandomInt(5000, 10000));

    /**TopTen*/
    MongoClient.connect(urldb, function(err, db) {
          assert.equal(null, err);
          topTen(db, function() {
              db.close();
          });
        });

    var tT2 = tT.slice(0,9);
    console.log(tT2);

    enviarMissatges(socket,tT2,"topTen");

    /*On Registre**/
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
            var u = listaUsers[ind];
            switch (data.d) {
                case "l":
                    if(listaUsers[ind].pos.x > 0){
                        //Guardamos pos
                        listaUsers[ind].oldPos.y = listaUsers[ind].pos.y;
                        listaUsers[ind].oldPos.x = listaUsers[ind].pos.x;

                        //movemos pos
                        listaUsers[ind].pos.x -= 1;

                        //miramos si hay mansana
                        hayManzana(socket,listaUsers[ind]);
                        enviarMissatges(socket,u,"pinta");
                    } else {
//                        listaUsers[ind].pos.x -= 1;
                        morir(socket,listaUsers[ind]);
                    }
                    break;
                case "u":
                    if(listaUsers[ind].pos.y > 0){
                        listaUsers[ind].oldPos.x = listaUsers[ind].pos.x;
                        listaUsers[ind].oldPos.y = listaUsers[ind].pos.y;

                        listaUsers[ind].pos.y -= 1;

                        hayManzana(socket,listaUsers[ind]);
                        enviarMissatges(socket,u,"pinta");
                    }  else {
//                        listaUsers[ind].pos.y -= 1;
                        morir(socket,listaUsers[ind]);
                    }
                    break;
                case "r":
                    if(listaUsers[ind].pos.x < 19){
                        listaUsers[ind].oldPos.y = listaUsers[ind].pos.y;
                        listaUsers[ind].oldPos.x = listaUsers[ind].pos.x;

                        listaUsers[ind].pos.x += 1;
                        hayManzana(socket,listaUsers[ind]);
                        enviarMissatges(socket,u,"pinta");
                    }  else {
//                        listaUsers[ind].pos.x += 1;
                        morir(socket,listaUsers[ind]);

                    }
                    break;
                case "d":
                    if(listaUsers[ind].pos.y < 19){
                        listaUsers[ind].oldPos.x = listaUsers[ind].pos.x;
                        listaUsers[ind].oldPos.y = listaUsers[ind].pos.y;

                        listaUsers[ind].pos.y += 1;
                        hayManzana(socket,listaUsers[ind]);
                        enviarMissatges(socket,u,"pinta");
                    }  else {
//                        listaUsers[ind].pos.y += 1;
                        morir(socket,listaUsers[ind]);
                    }
                    break;
            }
//            listaUsers[ind].oldPos = oldPos;
//            console.log("OLD: "+listaUsers[ind].oldPos.x+" "+listaUsers[ind].oldPos.y);
//            console.log("NEW: "+listaUsers[ind].pos.x+" "+listaUsers[ind].pos.y);
//            var u = listaUsers[ind];

            //         console.log('SERVIDOR -> dades rebudes del client->' + u.oldPos.x);
//            enviarMissatges(socket,u,"pinta");
        });

     socket.on('b', function (data) {
        console.log('SERVIDOR -> dades rebudes del client->' + data.b);
        enviarMissatges(socket,data);
    });

});
