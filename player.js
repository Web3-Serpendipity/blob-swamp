const {Vector} = require("./vector.js");
const {ethers} = require("ethers");

function Player() {
	this.id = -1;
	this.pos = new Vector(0,0);
	this.velocity = new Vector(0,0);
	this.size = 0;
	this.socket = null;
	this.state = 0;
	this.nonce = Math.floor(Math.random() * 10000000);
	this.blob = -1;
}

//Player.prototype = {};
Player.prototype.PLAYER_CONNECTED = 0;
Player.prototype.PLAYER_AUTHED = 1;
Player.prototype.PLAYER_INGAME = 2;

Player.prototype.init = function(id) {
	if (this.id != -1) {throw "Player: double init";}
	this.id = id;
}

Player.prototype.isAuthed = function() {
	return (this.state >= this.PLAYER_AUTHED);
}

Player.prototype.isInGame = function() {
	return (this.state == this.PLAYER_INGAME);
}

//
// state changes
//

// promotes player to authed
Player.prototype.auth = function(addr, signature) {
	if (this.isInGame()) {
		console.log(`Player ${this.id}.auth: player is already in game`);
		return false;
	}

	if (this.nonce == null) {
		console.log(`Player ${this.id}.auth: no nonce`);
		return false;
	}

	const decodedAddress = ethers.utils.verifyMessage(this.nonce.toString(), signature);
    if (decodedAddress.toLowerCase() == addr.toLowerCase()) {
      console.log(`Player ${this.id} has successfully authenticated.`);
      this.state = this.PLAYER_AUTHED;
      return true;
    }

    return false;
}

// promotes player from authed to in game
Player.prototype.joinGame = function() {
	if (!this.isAuthed()) {
		console.log(`Player ${this.id}.joinGame: player isn't authed`);
		return false;
	}

	if (this.isInGame()) {
		console.log(`Player ${this.id}.joinGame: player is already in game`);
		return false;
	}

	this.pos = new Vector(0,0);
	this.velocity = new Vector(0,0);
	this.size = 64;
	this.state = this.PLAYER_INGAME;

	console.log(`Player ${this.id} has joined the game.`);
	return true;
}

// demotes the player from in game to authed
Player.prototype.leaveGame = function() {
	if (!this.isInGame()) {
		console.log(`Player ${this.id}.leaveGame: player isn't in game`);
		return false;
	}

	this.state = this.PLAYER_AUTHED;
	return true;
}

module.exports.Player = Player;