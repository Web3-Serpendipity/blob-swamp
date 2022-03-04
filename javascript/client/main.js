let blob;
let food = [];
let zoom = 1;



// Setup plan with server/client code
// Food will be instantiated by the server - an array 
// will be sent over when the canvas is first drawn - foodEaten events will also be sent
// by the server when a blob feasts
function setup() {
    createCanvas(1000, 1000);
    blob = new Blob(0, 0, 64);
    for (let i = 0; i < 100; i++) {
        let x = random(-width,width)
        let y = random(-height,height)
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
        // velocity.sub(this.pos);
        newVelocity.setMag(3);
        this.velocity.lerp(newVelocity, .3)
        this.pos.add(this.velocity);
    }

    this.eats = function (foodItem) {
        let d = p5.Vector.dist(this.pos, foodItem.pos)
        if (d < this.r + foodItem.r) {
            let sum = PI * this.r * this.r + PI * foodItem.r * foodItem.r
            this.r = sqrt(sum / PI)
            // this.r += foodItem.r*.2
            return true
        }
        return false;
    }

    this.show = function () {
        fill(255)
        ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2)
    }
}


