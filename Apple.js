// Constructor
function Apple() {
    this.pos;
    this.index;

    this.spawn = function() {
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        this.pos = {"x":getRandomInt(0, 19), "y": getRandomInt(0, 19)};

    }
}


// export the class
module.exports = Apple;
