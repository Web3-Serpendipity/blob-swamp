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
  })

  socket.on('PlayerUpdate', (px) => {
    console.log('Update:'+ px)
    let newpos = new Vector(px[0], px[1])
    let newvel = new Vector(px[2], px[3])

    if (newvel.lengthsqr() > 9) {
      return; // discard the update
    };

    if (player() != null) {
      if (newpos.distancesqr(player().pos) > 9) {
        return; // discard the update
      }

      player().pos = newpos;
      player().velocity = newvel;
    }
    console.log(`Received PlayerUpdate event from ${playerId}`);
  })

  console.log('Player has successfully connected.');
})

function game_loop() {
  var contents = [];
  for (i = 0; i < players.length; i++) {
    let data = players[i];
    if (data != undefined) {
      contents[i] = [data.id, data.pos.x, data.pos.y, data.velocity.x, data.velocity.y];
    }
  }

  io.emit("GameUpdate", contents);
}

setInterval(game_loop, (1000/tickrate))

console.log('The server is working. Ctrl+C to stop.');
