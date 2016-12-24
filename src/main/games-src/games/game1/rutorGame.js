'use strict';

var RoundModule = require('./round.js');

function Game (level) {
	this.level = level - 1;
	if (this.level < 3)
		this.level = 3;
	this.score = 0;
	this.nRoundsLeft = 5;
	//this.startNewRound();
}

Game.prototype.getSuccess = function() {
	if (this.round.nFailFails == 0) 
		return 1;
	else if(this.round.nFailFails == 1)
		return 0;
	return -1;
}

Game.prototype.getResults = function() {
	return {endLevel: this.level, score: this.score};
}

Game.prototype.clickPos = function(idx) {
	return this.round.clickPos(idx);
}

Game.prototype.getMap = function(){
	return this.round.gameMap.map;
}

Game.prototype.startNewRound = function() {
	this.nRoundsLeft -= 1;
	this.round = RoundModule.GameRoundFactory(this.level);
	return this.round.gameMap;
}

Game.prototype.setNextLevel = function() {
	if(this.getSuccess() === 1)
		this.level += 1;
	else if(this.getSuccess() === -1)
		this.level -= 1;
	if(this.level < 3)
		this.level = 3;
}

Game.prototype.incScore = function(nSuccessClicks) {
	this.score += nSuccessClicks;
}

Game.prototype.isRoundOver = function() {
	if (this.round.gameOver() ) {
		this.incScore(this.round.nSuccessClicks);
		this.setNextLevel();
		return true;
	}
	return false
}

Game.prototype.getGameMap = function() {
	return this.round.gameMap;
}

Game.prototype.isGameOver = function(){
	return (this.nRoundsLeft < 1);
}

// new, not tested
Game.prototype.getNumberOfMissingTilesLastRound = function(){
	return (this.round.level - this.round.nSuccessClicks);
}

module.exports = {
	Game: Game
}