let blob;
let food = [];
let zoom = 1;
//array to be sent to server to show what's been eaten
let foodEaten = [];
let activePlayers = []
let enemies = []
//player blob data
let data;
const joinButton = document.querySelector("#joinButton")
//set parameters for arena
let playerID;
let vx,vy;
//var port = process.env.PORT || 5000
const socket = io("https://blob-war.herokuapp.com");

let players = [];

function player() {
    return players[playerID];
}

socket.on('PlayerJoined', (pid, blob) => {
    players[pid] = {
        id: pid,
        blob: blob,
        model: new Blob(0, 0, 64)
    };
})

socket.on("GameUpdate", (contents) => {
    if (playerID == undefined) {return};
    if (players[playerID] == undefined) {return};

    contents.forEach(x => {

        ply = players[x[0]];
        if (ply == undefined) {return};

        ply.model.r = x[5];
        if (x[0] == playerID) {return};

        ply.model.pos = createVector(x[1], x[2]);
        ply.model.velocity = createVector(x[3], x[4]);
    });

    //console.log('PlayerUpdate', player().model.pos.x, player().model.pos.y, player().model.velocity.x, player().model.velocity.y);
    socket.emit("PlayerUpdate", player().model.pos.x, player().model.pos.y, player().model.velocity.x, player().model.velocity.y);
});

// Setup plan with server/client code
// Food will be instantiated by the server - an array 
// will be sent over when the canvas is first drawn - foodEaten events will also be sent
// by the server when a blob feasts
function setup() {
    createCanvas(windowWidth, windowHeight);
    socket.emit("PlayerJoinRequest", 0 , (id, px, py) => {
        console.log('PlayerJoinRequest response', id, px, py);
        playerID = id;
        ply = player();
        ply.model.pos.x = px;
        ply.model.pos.y = py;
    });

    for (let i = 0; i < 100; i++) {
        //positions will need to be fed from server
        let x = random(-width,width)
        let y = random(-height,height)
        //this can prolly be kept to show food from server
        food[i] = new Blob(x, y, 15);
    }
}

// Main Game Loop
function draw() {
    background(0);

    if (player() == undefined) {return};
    let localModel = player().model;

    translate(width/2, height/2)
    let newZoom = 64 / localModel.r;
    zoom = lerp(zoom, newZoom, .1)
    scale(zoom)
    translate(-localModel.pos.x, -localModel.pos.y)
    localModel.control();

    for (let i = 0; i < players.length; i++) {
        if (players[i] == undefined) {continue};
        let blob = players[i].model;
        blob.show();
        blob.update();
        blob.constrain();
    }

    //iterate through the food array to get the food
    for (let i = food.length-1; i >= 0; i--) {
        food[i].show();
        if (localModel.eats(food[i])) {
            //pushes food eaten to array that can be sent to server
            foodEaten.push(i)
            // console.log(foodEaten)
            food.splice(i, 1)

        }
    }
    // Check to see if blobs are eating each other
    /*for (let i = activePlayers.length-1; i >= 0; i--) {
        if (blob.eats(activePlayers[i])) {
            activePlayers.splice(i, 1)
        }
    }*/
}

function Blob(x, y, r) {
    this.pos = createVector(x, y);
    this.r = r;
    this.velocity = createVector(0,0)

    this.control = function() {
        let newVelocity = createVector(mouseX-width/2, mouseY-height/2);
        newVelocity.setMag(3);
        this.velocity.lerp(newVelocity, .3);
    }

    this.update = function() {
        this.pos.add(this.velocity);
    }

    this.eats = function (foodItem) {
        let d = p5.Vector.dist(this.pos, foodItem.pos)
        if (d < this.r + foodItem.r) {
            let sum = PI * this.r * this.r + PI * foodItem.r * foodItem.r
            this.r = sqrt(sum / PI)
            return true
        }
        return false;
    }

    this.constrain = function () {
        this.pos.x = constrain(this.pos.x, -width, width)
        this.pos.y = constrain(this.pos.y, -height, height)
    }

    let red = randomHex()
    let green = randomHex()
    let blue = randomHex()
    this.show = function () {
        fill(red, green, blue)
        ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2)
    }
}

function randomHex() {
    return Math.floor(Math.random() * 256)
}

joinButton.addEventListener('click', () => {
    
})

document.getElementById('close-modal-btn').addEventListener('click', () => {
    let modal = document.querySelector('#join-game-modal')
    modal.style.display = 'none'
    let header = document.querySelector('.header')
    header.style.display = 'none'
})
