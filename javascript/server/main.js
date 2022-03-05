const {Server} = require("socket.io");
const {insert} = require("./util.js");
const {Vector} = require("./vector.js");

const io = new Server(3000, {secure: false});
var players = [];
const field_w = 1000;
const field_h = 1000;
const tickrate = 10;

io.on("connection", (socket) => {
  var playerId = null;

  function player() {
    return players[playerId];
  }

  console.log('A user just connected.');

  socket.on("PlayerJoinRequest", (tokenId, callback) => {
    var playerData = {
      pos: new Vector(Math.floor(Math.random(field_w)), Math.floor(Math.random(field_h))),
      velocity: new Vector(0, 0),
      //socket: socket;
      blob: {}
    };
    playerData.id = insert(players, playerData);
    playerId = playerData.id;

    callback(playerData.id);
    io.emit("PlayerJoined", playerData.id, playerData.blob);
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
  });

  socket.on('PlayerUpdate', (px, py, vx, vy) => {
    let newpos = new Vector(px, py);
    let newvel = new Vector(vx, vy);

    if (newvel.lengthsqr() > 9) {
      return; // discard the update
    };

    if (newpos.distancesqr(player().pos) > 9) {
      return; // discard the update
    };

    player().pos = newpos;
    player().velocity = newvel;

    console.log(`Received PlayerUpdate event from ${playerId}`);
  });

  console.log('Player connected.');
});

function game_loop() {
  var contents = [];
  for (i = 0; i < players.length; i++) {
    let data = players[i];
    contents[i] = [data.id, data.pos.x, data.pos.y, data.velocity.x, data.velocity.y];
  }

  io.emit("GameUpdate", contents);
}

setInterval(game_loop, (1000/tickrate))

console.log('The server is working. Ctrl+C to stop.');
