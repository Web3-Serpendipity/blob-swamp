const {insert} = require("./util.js");
const {Vector} = require("./vector.js");

const {createServer} = require("http");
const {Server} = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", //"https://localhost:3000"
  }
});

io.listen(3000);

let players = [];
let food = [];
const field_w = 1000;
const field_h = 1000;
const tickrate = 10;
const food_size = 15;

io.on("connection", (socket) => {
  let playerId = null;

  function player() {
    return players[playerId];
  }

  console.log('A user just connected.');

  socket.on("PlayerJoinRequest", (tokenId, callback) => {
    let playerData = {
      pos: new Vector(Math.floor(Math.random()*field_w), Math.floor(Math.random()*field_h)),
      velocity: new Vector(0, 0),
      size: 64, // TODO
      //socket: socket;
      blob: {}
    };
    playerData.id = insert(players, playerData);
    playerId = playerData.id;

    console.log('PlayerJoinRequest', playerId, playerData);

    io.emit("PlayerJoined", playerData.id, playerData.blob);
    callback(playerData.id, playerData.pos.x, playerData.pos.y);

    for (i = 0; i < food.length; i++) {
      socket.emit('FoodCreated', i, food[i].x, food[i].y);
    }

    for (i = 0; i < players.length; i++) {
      if (i == playerId || players[i] == undefined) {continue};
      socket.emit("PlayerJoined", i, players[i].blob);
    }
    console.log(`Player ${playerId} has joined the game.`);
  });
    
  socket.on('disconnect', () => {
    delete players[playerId];
    io.emit("PlayerLeft", playerId);
    console.log(`Player ${playerId} left the game (disconnect).`);
    playerId = null;
  })

  socket.on("PlayerLeaveRequest", () => {
    delete players[playerId];
    io.emit("PlayerLeft", playerId);
    console.log(`Player ${playerId} left the game.`);
    playerId = null;
  })

  socket.on('PlayerUpdate', (px, py, vx, vy) => {
    let newpos = new Vector(px, py);
    let newvel = new Vector(vx, vy);

    //if (newvel.lengthsqr() > 9) {
    //  console.log(`Discarded PlayerUpdate from ${playerId} (velocity manipulation)`);
    //  return; // discard the update
    //};

    //if (newpos.distancesqr(player().pos) > 25) {
    //  console.log(`Discarded PlayerUpdate from ${playerId} (position manipulation)`);
    //  console.log('old', player().pos, 'new', newpos);
    //  return; // discard the update
    //};

    player().pos = newpos;
    player().velocity = newvel;
  })

  console.log('Player has successfully connected.');
})

// Spawn the food

function spawnFood(n) {
  for (let i = 0; i < n; i++) {
    //positions will need to be fed from server
    let x = -field_w + Math.random()*field_w*2;
    let y = -field_h + Math.random()*field_h*2;
    //this can prolly be kept to show food from server
    food[i] = new Vector(x, y); // radius=15
    io.emit('FoodCreated', i, food[i].x, food[i].y);
  }
}
spawnFood(100);

// Start the main game loop

function getPredator(p1, p2) {
  return (p1.size > p2.size && p1) || (p2.size > p1.size && p2) || null;
}

function game_loop() {
  removed_food = 0;

  // Check food eating
  for (i = 0; i < food.length; i++) {
    if (food[i] == undefined) {break};

    for (j = 0; j < players.length; j++) {
      let ply = players[j]
      if (ply.pos.distancesqr(food[i]) < (ply.size + 15)**2) {
        food.splice(i, 1);

        let sum = Math.PI * ply.size * ply.size + Math.PI * 15 * 15;
        ply.size = Math.sqrt(sum / Math.PI);

        io.emit('FoodEaten', i);
        i--;
        removed_food += 1;
      }
    }
  }

  // Respawn eaten food
  spawnFood(removed_food);

  // TODO: Check eating of other blobs
  /*dead_players = [];
  for (i = 0; i < players.length; i++) {
    let ply1 = players[i];
    if (ply1 == undefined) {continue};

    for (j = 0; j < players.length; j++) {
      let ply2 = players[j]
      if (ply1.pos.distancesqr(ply2.pos) < (ply1.size + ply2.size)**2) {
        let predator = getPredator(ply1, ply2);
        if (predator == null) {continue};

        let sum = Math.PI * ply.size * ply.size + Math.PI * 15 * 15;
        ply.size = sqrt(sum / Math.PI);

        dead_players.push()
        io.emit('FoodEaten', i);
        i--;
        removed_food += 1;
      }
    }
  }*/

  // broadcast the game update to all clients
  let contents = [];
  for (i = 0; i < players.length; i++) {
    let data = players[i];
    if (data != undefined) {
      contents.push([data.id, data.pos.x, data.pos.y, data.velocity.x, data.velocity.y, data.size]);
    }
  }

  io.emit("GameUpdate", contents);
}
setInterval(game_loop, (1000/tickrate));

console.log('The server is working. Ctrl+C to stop.');
