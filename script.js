var socket = io.connect('http://localhost:3000');


function createTable(){

	mytable = $('<table></table>').attr({ id: "basicTable" });
	var rows = 20;
	var cols = 20;
	var tr = [];
	for (var i = 0; i < rows; i++) {
		var row = $('<tr></tr>').attr({ class: [i].join(' ') }).appendTo(mytable);
		for (var j = 0; j < cols; j++) {
			$('<td></td>').attr({ class: [j].join(' ') }).appendTo(row);
		}

	}
	mytable.appendTo("#snake");

}

$(document).ready(function(){
    $("#snake").hide();
    $("#ou").hide();
    $("form").submit(function(){
        var user = $('#user').val();

        socket.emit('reg', {
            u: user
        });
        $("#formulari").hide();
        $("#snake").show();
        $("#ou").show();
        return false;
    });

    socket.on('online', function (data) {
        createTable();






//        $( "li" ).remove();
//        var u = jQuery.parseJSON(data.u);
//        console.log('CLIENT -> dades rebudes del servidor->' + u[0].nom);
//
////        for(var user in u){
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

        });



    });








