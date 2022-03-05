const {Server} = require("socket.io");
const {insert} = require("./util.js");
const {Vector} = require("./vector.js");

const io = new Server(3000);
var players = [];
const field_w = 1000;
const field_h = 1000;
const tickrate = 10;

io.on("connection", (socket) => {
  var playerId = null;

  socket.on("PlayerJoinRequest", (tokenId, callback) => {
    var playerData = {
      pos: new Vector(Math.floor(Math.random(field_w)), Math.floor(Math.random(field_h))),
      velocity: new Vector(0, 0),
      blob: {}
    };
    playerData.id = insert(players, playerData);
    playerId = playerData.id;

    callback(playerData.id);
    io.emit("PlayerJoined", playerData.id, playerData.blob);
    console.log(`Player ${playerId} has joined the game.`);
  });

  socket.on("PlayerLeaveRequest", () => {
    delete players[playerId];
    io.emit("PlayerLeft", playerId);
    console.log(`Player ${playerId} left the game.`);
    playerId = null;
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
  //console.log('Server tick.');
}

setInterval(game_loop, (1000/tickrate))

console.log('The server is working. Ctrl+C to stop.');