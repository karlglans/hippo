'use strict';

var GameMapModule = require('./gameMap.js');

function GameRound(level, gameMap) {
	this.level = level;
	this.gameMap = gameMap;
	this.nSuccessClicks = 0;
	this.nFailFails = 0;
}

GameRound.prototype.addClick = function(success) {
	if(success)
		this.nSuccessClicks++;
	else
		this.nFailFails++;
}


// GameRound.prototype.calcnextTileColor = function() {
// 	var curColor = this.gameMap.getMostFrequentColor();
// 	if(this.gameOver())
// 		curColor = enumTileDisplay.noColor;
	
// 	if( this.gameMap.moreThenOneColorLeft() && curColor === this.nextTileColor) {
// 		console.log("switching color", curColor, 1);
// 		curColor = 1;
// 	}
// 	this.nextTileColor = curColor;
// 	return curColor;
// }

// GameRound.prototype.getNumberOfMissingTiles = function() {
// 	return this.level - this.nFailFails;
// }

// GameRound.prototype.clickPos = function(idx) {
// 	var nClicks = this.nSuccessClicks + this.nFailFails;
// 	var tile = this.gameMap.touchTile(idx, this.nextTileColor);
// 	if(tile.status === enumTileStatus.correct) {
// 		this.nSuccessClicks++;
// 	} else {
// 		this.nFailFails++;
// 	}
// 	this.nextTileColor = this.calcnextTileColor();
// 	return tile.viewColor;
// }

GameRound.prototype.isRoundOver = function() {
	if (this.nFailFails >= 3)
		return true;
	if (this.nSuccessClicks == this.level)
		return true;
	return false;
}

// GameRound.prototype.nextLevel = function() {
// 	if(this.nFailFails == 0)
// 		return this.level + 1;
// 	if(this.nFailFails == 2)
// 		return this.level - 1;
// 	return this.level;
// }

function GameRoundFactory(level) {
	var m = new GameMapModule.GameMap(level);

	return new GameRound(level, m);
}

// GameRound.prototype.getNextTile = function(){
// 	return this.gameMap.getViewColor(this.nextTileColor);
// }

GameRound.prototype.getMapViewModel = function() {
	//return this.gameMap.createMapViewModel();
	console.log("GameRound.prototype.getMapViewModel", this.gameMap.map);
	return this.gameMap.map;
}

module.exports = {
	GameRound: GameRound,
	GameRoundFactory : GameRoundFactory
}