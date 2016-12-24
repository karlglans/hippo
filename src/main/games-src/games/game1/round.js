'use strict';

var GameMapModule = require('./gameMap.js');
var enumTile = GameMapModule.enumTile;
var dencity = 0.4;

function GameRound(level, gameMap) {
	this.level = level;
	this.gameMap = gameMap;
	this.nSuccessClicks = 0;
	this.nFailFails = 0;
}

GameRound.prototype.clickPos = function(idx) {
	var tileStatus = this.gameMap.checkPos(idx);
	if(tileStatus == enumTile.goodOne) {
		this.nSuccessClicks++;
	} else if( tileStatus == enumTile.badOne) {
		this.nFailFails++;
	} else if( tileStatus == enumTile.used) {
	}
	return tileStatus;
}

GameRound.prototype.gameOver = function() {
	if (this.nFailFails >= 2)
		return true;
	if (this.nSuccessClicks == this.level)
		return true;
	return false;
}

GameRound.prototype.nextLevel = function() {
	if(this.nFailFails == 0)
		return this.level + 1;
	if(this.nFailFails == 2)
		return this.level - 1;
	return this.level;
}

function GameRoundFactory(level) {
	var m = new GameMapModule.GameMap(dencity, level);
	return new GameRound(level, m);
}

module.exports = {
	GameRound: GameRound,
	GameRoundFactory : GameRoundFactory
}