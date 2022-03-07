const {insert, pick_random} = require("./util.js");
const {Vector} = require("./vector.js");
const { ethers } = require("ethers");

const {RPC_URL, WALLET_SEED, CONTRACT_ADDRESS, WALLET_ADDRESS} = require('./../../../constants.js');
const {DESC_DB, COLOR_DB} = require('./blob_params_db.js');

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
let nfts;
let staked;
let contractWrite;
const field_w = 1000;
const field_h = 1000;
const tickrate = 10;
const food_size = 15;

async function getBlobMetadata(tokenId) {
  return await nfts.findOne({_id: tokenId});
}

io.on("connection", (socket) => {
  let playerId = null;
  let playerWallet; // TODO: get playerWallet from login

  function player() {
    return players[playerId];
  }

  async function stakedBlobs() {
    let cursor = await staked.find({_id: playerWallet});
    let blobs = [];
    await cursor.forEach((x) => {
      blobs.push(x.token);
    });

    return blobs;
  }

  async function isBlobStaked(id) {
    return (await stakedBlobs()).includes(id);
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

  socket.on('Unstake', (tokenId) => {
    if (!await isBlobStaked(tokenId)) {return;}

    let data = await getBlobMetadata(tokenId);
    data.size = player().size;

    // kick the player from the game
    if (playerId != null) {
      delete players[playerId];
      io.emit("PlayerLeft", playerId);
      console.log(`Player ${playerId} left the game.`);
      playerId = null;
    }

    await contractWrite.safeTransferFrom(WALLET_ADDRESS, playerWallet, tokenId);
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
  spawnFood(removed_food)death;

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

//
// Connect to MongoDB
//

const MongoClient = require("mongodb").MongoClient;
    
const url = "mongodb://localhost:27017/";
const mongoClient = new MongoClient(url);
await mongoClient.connect();
const db = mongoClient.db("blobwars");
nfts = db.collection("nfts");
staked = db.collection("staked");

var express = require('express');
var app = express();

// nft api

app.get('/blobInfo/:id', function (req, res) {
  let qr = await getBlobMetadata(req.params.id);
  console.log('blobInfo call', qr);
  res.end(JSON.stringify(qr));
})

var server = app.listen(80, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("blobInfo listening @ http://%s:%s", host, port)
})

//
// Connect the wallet
//

// If you don't specify a //url//, Ethers connects to the default 
// (i.e. ``http:/\/localhost:8545``)
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = ethers.Wallet.fromMnemonic(WALLET_SEED).connect(provider);

const contract = new ethers.Contract(CONTRACT_ADDRESS, [
  "function safeTransferFrom(address from, address to, uint256 tokenId) public",
  "event Transfer(address from, address to, uint256 tokenId)",
  "event BlobBought(address player, uint256 tokenId)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256 balance)",
  "function buyBlob() external payable" // balanceOf, tokenOfOwnerByIndex
], provider);

contractWrite = contract.connect(signer);

contract.on('BlobBought', (player, tokenId) => {
  await nfts.insertOne({
    _id: tokenId,
    name: "Unnamed",
    description: pick_random(DESC_DB),
    color: pick_random(COLOR_DB),
    size: 7 + Math.floor(Math.random()*9),
    dead: false,
    image: "https://static.wikia.nocookie.net/meme/images/7/7e/Ytroll-troll-crazy-insane.png" // TODO
  });
})

contract.on('Transfer', (from, to, tokenId) => {
  if (to == WALLET_ADDRESS) {
    await staked.insertOne({
      _id: from,
      token: tokenId
    });
  } else if (from == WALLET_ADDRESS) {
    await staked.deleteOne({
      _id: to,
      token: tokenId
    })
  } else {
    return;
  }
})

console.log('The server is working. Ctrl+C to stop.');
