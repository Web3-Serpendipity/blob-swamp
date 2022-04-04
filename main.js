const joinButton = document.querySelector("#joinButton")
const connectBtn = document.getElementById('connect-btn')
const isMetaMaskInstalled = () => ethereum.isMetaMaskInstalled
const dlBtn = document.getElementById('dl-btn')
const socket = io(window.location.href);
const showAccount = document.querySelector('#show-account')
const returnBtn = document.querySelector('#return-btn')
const deathModal = document.querySelector('.u-ded-modal')
const joinModal = document.querySelector('#join-game-modal')
const welcomeMsg = document.querySelector('#welcome-msg')


let signerNonce;
let isAuthenticated = false; //TODO: must be false in final, change to true to skip authentication

if (typeof window.ethereum !== 'undefined') {
    connectBtn.style.display = 'flex'
    dlBtn.style.display = 'none'
} else {
    connectBtn.style.display = 'none'
    dlBtn.style.display = 'flex'
}

function setup() {
    createCanvas(windowWidth, windowHeight);
};

// Main Game Loop
function draw() {
    background(0);

    if (currentGame.startGame && isAuthenticated) {
        if (currentGame.player() == undefined) {return};
            adjustViewport()
            drawGridLines();
            drawFood()
            drawPlayers()
    }
}

//TODO prolly delete this. see how everyone feels but i don't like it
function drawGridLines() {
    stroke(125);
    strokeWeight(1);
    for (var x = 0; x < currentGame.width; x += currentGame.width / 15) {
        line(x, 0, x, currentGame.height);
        line(0, x, currentGame.width, x);
    };
}

function adjustViewport() {
    let localModel = currentGame.player().model;
    adjustZoom(localModel.r)
    adjustPosition(-localModel.pos.x, -localModel.pos.y)
    localModel.control();
}

function adjustZoom(r) {
    let newZoom = 64 / r;
    let zoom = 1;
    zoom = lerp(zoom, newZoom, .1)
    scale(zoom)
}

function adjustPosition(x,y) {
    translate(width/2, height/2)
    translate(x, y)
}

function drawFood() {
    for (let i = currentGame.food.length-1; i >= 0; i--) {
        currentGame.food[i].show();
    }
}

function drawPlayers() {
    for (let i = 0; i < currentGame.players.length; i++) {
        if (currentGame.players[i] == undefined) {continue};
            let blob = currentGame.players[i].model;
            blob.show();
            blob.update();
            blob.constrain();
    }
}

function Game() {
    this.food = [],
    this.playerID = undefined,
    this.startGame = false; //TODO: must be false in final
    this.players = [],
    this.player = () => this.players[this.playerID]
    this.width = 3000
    this.height = 3000
}

const currentGame = new Game()

socket.on('AuthNonce', (nonce) => {
    signerNonce = nonce
})

connectBtn.addEventListener('click', signIn);

async function signIn() {
    let account  = await getAccount();
    let signature = await getSignature();
    if (account !== undefined) {
        setConnected(account, signature)
        welcomeMsg.style.display = 'block'
        showAccount.innerHTML = account;
    }
}

async function getAccount(){
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    return account;
}

async function getSignature() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    // Prompt user for account connections
     provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(signerNonce.toString());
    console.log("Account: ", await signer.getAddress()); //TODO delete in final
    return signature;
}

function setConnected (account, signature) {
    connectBtn.style.display = 'none'
    joinButton.style.display = 'flex'
    socket.emit('PlayerAuth', account, signature, () => {
        isAuthenticated = true;
    });
}

// Uncomment the below line to temporarily skip auth
// joinButton.style.display = 'flex' //TODO: DELETE THIS

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

    //TODO: add constrain to server
    this.constrain = function () {
        this.pos.x = constrain(this.pos.x, -currentGame.width, currentGame.width)
        this.pos.y = constrain(this.pos.y, -currentGame.height, currentGame.height)
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
    joinModal.style.display = 'none'
    playerJoinEvent()
    currentGame.startGame = true;
})

const playerJoinEvent = () => {
    socket.emit("PlayerJoinRequest", 0 , (id, px, py) => {
        console.log('PlayerJoinRequest response', id, px, py);
        currentGame.playerID = id;
        ply = currentGame.player();
        ply.model.pos.x = px;
        ply.model.pos.y = py;
    });
}

socket.on('PlayerJoined', (pid, blob) => {
    currentGame.players[pid] = {
        id: pid,
        blob: blob,
        model: new Blob(0, 0, 64)
    };
})

socket.on('PlayerLeft', (pid) => {
    if (pid == currentGame.playerID) {
        deathModal.style.display = 'flex'
        currentGame.startGame = false;
    } // TODO: handle this.
    delete currentGame.players[pid];
})

socket.on("GameUpdate", (contents) => {
    if (currentGame.playerID == undefined) {return};
    if (currentGame.players[currentGame.playerID] == undefined) {return};

    contents.forEach(x => {
        ply = currentGame.players[x[0]];
        if (ply == undefined) {return};
        ply.model.r = x[5];
        if (x[0] == currentGame.playerID) {return};
        ply.model.pos = createVector(x[1], x[2]);
        ply.model.velocity = createVector(x[3], x[4]);
    });

    socket.emit("PlayerUpdate", currentGame.player().model.pos.x, currentGame.player().model.pos.y, currentGame.player().model.velocity.x, currentGame.player().model.velocity.y);
});

socket.on('FoodCreated', (id, x, y) => {
    currentGame.food[id] = new Blob(x, y, 15);
    currentGame.food[id].id = id;
})

socket.on('FoodEaten', (id) => {
    currentGame.food.splice(id, 1);
    console.log(`food ${id} eaten`);
})

returnBtn.addEventListener('click', () => {
    joinModal.style.display = 'block'
    deathModal.style.display = 'none'
})