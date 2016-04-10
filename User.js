// Constructor
function User(nombre) {
    this.nom = nombre;
    this.dir = "";
    this.pos;
    this.oldPos;
    this.color;
    this.index;

    this.spawn = function() {
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        var computerResponse = getRandomInt(1, 4);
        if(computerResponse == 1){
            this.pos = {"x":2, "y": 2};
            this.oldPos = {"x":2, "y": 2};
        }else if(computerResponse == 2){
            this.pos = {"x":2, "y": 17};
            this.oldPos = {"x":2, "y": 17};
        }else if(computerResponse == 3){
            this.pos = {"x":17, "y": 17};
            this.oldPos = {"x":17, "y": 17};
        }else{
            this.pos = {"x":17, "y": 2};
            this.oldPos = {"x":17, "y": 2};
        }
        /*COLOR*/
        function getRandomColor() {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        this.color = getRandomColor();
    }
}


// export the class
module.exports = User;
