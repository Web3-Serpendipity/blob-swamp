let blob;
let food = [];
let zoom = 1;
//array to be sent to server to show what's been eaten
let foodEaten = [];

let activePlayers = []

//player blob data
let data;


//set parameters for arena

// Setup plan with server/client code
// Food will be instantiated by the server - an array 
// will be sent over when the canvas is first drawn - foodEaten events will also be sent
// by the server when a blob feasts
function setup(x_pos, y_pos) {
    // createCanvas(1000, 1000);
    // let canvasSize = (activePlayers.length + 1) * 100
    // console.log(activePlayers.length)
    // console.log(canvasSize)
    // createCanvas(1000, 1000);

    let w = x_pos || random(width)
    let h = y_pos || random(height)
    blob = new Blob(w, h, 64);
    activePlayers.push(blob)
    // npb = new Blob(rw + 130, rh + 130, 80);
    // activePlayers.push(npb)

    for (let i = 0; i < 10; i++) {
        activePlayers[i] = new Blob(random(width), random(height), 64)
    }

    //player blob data
    data = {
        x: blob.pos.x,
        y: blob.pos.y,
        r: blob.r
    }

    for (let i = 0; i < 100; i++) {
        //positions will need to be fed from server
        let x = random(-width,width)
        let y = random(-height,height)
        //this can prolly be kept to show food from server
        food[i] = new Blob(x, y, 15);
    }

    
    
}



function draw() {
    
    background(0);

    translate(width/2, height/2)
    let newZoom = 64 / blob.r
    zoom = lerp(zoom, newZoom, .1)
    scale(zoom)
    translate(-blob.pos.x, -blob.pos.y)
    
    for (let i = activePlayers.length-1; i >= 0; i--) {
        activePlayers[i].show()
    }
    // console.log(activePlayers)

    blob.show();
    blob.update();
    blob.constrain();

    for (let i = food.length-1; i >= 0; i--) {
        food[i].show();
        if (blob.eats(food[i])) {
            //pushes food eaten to array that can be sent to server
            foodEaten.push(i)
            // console.log(foodEaten)
            food.splice(i, 1)

        }
    }
    for (let i = activePlayers.length-1; i >= 0; i--) {
        if (blob.eats(activePlayers[i])) {
            activePlayers.splice(i, 1)
        }
    }
}

function Blob(x, y, r) {
    this.pos = createVector(x, y);
    this.r = r;
    this.velocity = createVector(0,0)

    this.update = function() {
        let newVelocity = createVector(mouseX-width/2, mouseY-height/2);
        newVelocity.setMag(3);
        this.velocity.lerp(newVelocity, .3)
        this.pos.add(this.velocity);
        
        //updates radius for data
        data.r = this.r
        // console.log(data)
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
        blob.pos.x = constrain(blob.pos.x, -width, width)
        blob.pos.y = constrain(blob.pos.y, -height, height)
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