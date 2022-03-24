var Game = function ()  {
    this.food = [],
    this.playerID = undefined,
    this.startGame = false;
    this.players = [],
    this.player = () => this.players[this.playerID]
    return this
}
const game = new Game();
