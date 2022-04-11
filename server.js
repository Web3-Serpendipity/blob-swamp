const {insert} = require("./insert.js");
const {Vector} = require("./vector.js");
let players = [];
let food = [];
const field_w = 1000;
const field_h = 1000;
const tickrate = 10;
const food_size = 15;
const path = require('path');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { ethers } = require("ethers");

const {Player} = require('./player.js');

var port = process.env.PORT || 3000

io.on("connection", (socket) => {
  let playerId;

  function playerInit() {
    let playerObject = new Player();
    playerId = insert(players, playerObject);
    playerObject.init(playerId);
  }

  function player() {
    return players[playerId];
  }

  socket.on("PlayerJoinRequest", (tokenId, callback) => {
    if (!player().joinGame()) {return;}
    player().pos = new Vector(Math.floor(Math.random()*field_w), Math.floor(Math.random()*field_h));

    io.emit("PlayerJoined", player().id, player().blob);
    callback(player().id, player().pos.x, player().pos.y);

    for (i = 0; i < food.length; i++) {
      socket.emit('FoodCreated', i, food[i].x, food[i].y);
    }

    for (i = 0; i < players.length; i++) {
      if (i == playerId || players[i] == undefined) {continue};
      socket.emit("PlayerJoined", i, players[i].blob);
    }
  });

  socket.on('disconnect', () => {
    player().leaveGame();
    delete players[playerId];
    io.emit("PlayerLeft", playerId);
    console.log(`Player ${playerId} has disconnected (socket closing).`);
    playerId = null;
  })

  socket.on('PlayerUpdate', (px, py, vx, vy) => {
    if (!player().isInGame()) {return;}

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

  socket.on('PlayerAuth', (addr, signature, cb) => {
    if (player().auth(addr, signature)) {
      cb();
    }
  });

  playerInit();
  socket.emit('AuthNonce', player().nonce);
  console.log(`Player ${playerId} has successfully connected.`);
})

// Spawn the food

function spawnFood(n) {
  for (let i = 0; i < n; i++) {
    let x = -field_w + Math.random()*field_w*2;
    let y = -field_h + Math.random()*field_h*2;

    let id = food.length;
    food.push(new Vector(x, y));
    io.emit('FoodCreated', id, food[id].x, food[id].y);
  }
}
spawnFood(100);

// Start the main game loop

function getBlobRelationship(p1, p2) {
  diff = p1.size - p2.size;
  return (diff > 10 && [p1, p2]) || (diff < -10 && [p2, p1]) || [null, null];
}

function game_loop() {
  removed_food = 0;

  // Check food eating
  for (i = 0; i < food.length; i++) {
    if (food[i] == undefined) {break};

    for (j = 0; j < players.length; j++) {
      let ply = players[j]
      if (ply != undefined && ply.isInGame() && ply.pos.distancesqr(food[i]) < (ply.size + 15)**2) {
        console.log(`food ${i} eaten by player ${j}`);
        food.splice(i, 1);

        ply.size = Math.sqrt(ply.size**2 + (Math.exp(-ply.size/64 + 1)) * 225)

        io.emit('FoodEaten', i);
        i--;
        removed_food += 1;
      }
    }
  }

  // Respawn eaten food
  spawnFood(removed_food);

  // Takes in two game objects, determines aggressor and updates size of victor
  function checkConsumption(p1, p2)
  {
    //determine which is the aggressor (larger)
    let [att, vict] = getBlobRelationship(p1, p2);
    // ignore combat if player are roughly equal size
    if (att == null) {console.log(`Size diff too smol for players ${p1.id} and ${p2.id}`); return;}

    // update attackers size directly
    att.size = Math.sqrt(att.size**2 + (Math.exp(-att.size/64 + 1)) * vict.size**2)
    //kick out the victim if killed
    vict.leaveGame();
    io.emit('PlayerLeft', vict.id);
    console.log(`Player ${vict.id} eaten by ${att.id}`);
  }


  // Check eating of other blobs
  for (i = 0; i < players.length; i++) {
    let ply1 = players[i];
    if (ply1 == undefined || !ply1.isInGame()) {continue;}

    for (j = 0; j < players.length; j++) {
      let ply2 = players[j]
      if (i == j || ply2 == undefined || !ply2.isInGame()) {continue;}

      // if players are close enough together, see which player gets eaten
      if (ply1.pos.distancesqr(ply2.pos) < (ply1.size + ply2.size)**2) {
        checkConsumption(ply1, ply2)
      }
    }
  }

  // broadcast the game update to all clients
  let contents = [];
  for (i = 0; i < players.length; i++) {
    let ply = players[i];
    if (ply != undefined && ply.isInGame()) {
      contents.push([ply.id, ply.pos.x, ply.pos.y, ply.velocity.x, ply.velocity.y, ply.size]);
    }
  }

  io.emit("GameUpdate", contents);
}
setInterval(game_loop, (1000/tickrate));

function publish(fileName, url = '/' + fileName) {
  app.get(url, function(req, res) { res.sendFile(fileName, {root: __dirname}); });
}

publish('index.html');
publish('main.js');
publish('p5.js');
publish('styles.css');
publish('index.html', '/');
publish('images/metamask.svg');
publish('images/title_blob.png');

//
// NFT metadata
//

app.get('/api/token/:token_id', function(req, res) {
  const tokenId = parseInt(req.params.token_id).toString()

  res.send({
    tokenId: tokenId,
    name: `Test Blob #${tokenId}`,
    description: "Test description",
    image: "https://static.wikia.nocookie.net/meme/images/7/7e/Ytroll-troll-crazy-insane.png",
    attributes: [
      {
        "display_type": "number", 
        "trait_type": "Points", 
        "value": 0
      }
    ]
  });
})

app.get('/api/collection', function(req, res) {
  res.send({
    name: `blobs`,
    description: "blob blob blob blob blob blob blob blob",
    image: "https://static.wikia.nocookie.net/meme/images/7/7e/Ytroll-troll-crazy-insane.png",
    external_link: "http://blob-war.herokuapp.com",
    seller_fee_basis_points: 5,
    fee_recipient: "0xa8099485e72b7c54bA233e195FA3e0E650BCFF01"
  });
})

http.listen(port, function() {
   console.log(`listening on *:${port}`);
});

console.log('The server is working. Ctrl+C to stop.');
