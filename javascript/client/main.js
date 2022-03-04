let blob;
let food = [];
let zoom = 1;
//array to be sent to server to show what's been eaten
let foodEaten = [];

//player blob data
let data = {
    x: blob.x,
    y: blob.y,
    r: blob.r
}

// Setup plan with server/client code
// Food will be instantiated by the server - an array 
// will be sent over when the canvas is first drawn - foodEaten events will also be sent
// by the server when a blob feasts
function setup() {
    createCanvas(1000, 1000);
    blob = new Blob(0, 0, 64);
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

    blob.show();
    blob.update();
    for (let i = food.length-1; i >= 0; i--) {
        food[i].show();
        if (blob.eats(food[i])) {
            //pushes food eaten to array that can be sent to server
            foodEaten.push(i)
            food.splice(i, 1)

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