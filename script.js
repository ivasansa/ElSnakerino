var socket = io.connect('http://192.168.1.139:3000');


function createTable(){
	mytable = $('<table></table>').attr({ id: "basicTable" });
	var rows = 20;
	var cols = 20;
	var tr = [];
	for (var i = 0; i < rows; i++) {
		var row = $('<tr></tr>').attr({ id: [i].join(' ') }).appendTo(mytable);
		for (var j = 0; j < cols; j++) {
			$('<td></td>').attr({ id: [j].join(' ') }).appendTo(row);
		}

	}
	mytable.appendTo("#snake");

}

$(document).ready(function(){
    createTable();
    $("#snake").hide();
    $("#ou").hide();
    $("form").submit(function(){
        var user = $('#user').val();

        socket.emit('reg', {u: user});
        $("#formulari").hide();
        $("#snake").show();
        $("#ou").show();
        return false;
    });

    socket.on('online', function (data) {
        console.log('CLIENT -> dades rebudes del servidor->' + data.u.nom);

        $(document).keydown(function(e) {
            console.log(data.u.index);
            switch(e.which) {
                case 37: // left
                    socket.emit('ks', {u: data.u, d: "l"});
                break;

                case 38: // up
                    socket.emit('ks', {u: data.u, d: "u"});
                break;

                case 39: // right
                    socket.emit('ks', {u: data.u, d: "r"});
                break;

                case 40: // down
                    socket.emit('ks', {u: data.u, d: "d"});
                break;

                default: return; // exit this handler for other keys

            }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });



    });
        socket.on('pinta', function (data) {
            console.log(data.u.oldPos.x+1);
            console.log(data.u.oldPos.y+1);

        $('tr:nth-of-type('+(data.u.oldPos.y + 1)+') td:nth-of-type('+(data.u.oldPos.x + 1)+')').css("background-color","black!important");

         $('tr:nth-of-type('+(data.u.pos.y + 1)+') td:nth-of-type('+(data.u.pos.x + 1)+')').css("background-color",data.u.color);
    });


    });


//        $( "li" ).remove();
//        var u = jQuery.parseJSON(data.u);
//        console.log('CLIENT -> dades rebudes del servidor->' + u[0].nom);
//
////
//        for(var user in u){
////          $("#ousers").append('<li>'+user.nom+'</li>');
////        }
////
//        var i=0;
//        do{
//
//            $("#ousers").append('<li>'+u[i].nom+'</li>');
//        }while(u[i].nom != undefined);
//
////        for(var user = 0; user< u.lenght; ++user){
////          $("#ousers").append('<li>'+u[user].nom+'</li>');
////        }






