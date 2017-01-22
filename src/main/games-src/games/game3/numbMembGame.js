'use strict';

var RoundModule = require('./round.js');
var EnumClickResult = { Correct : 1, Wrong : 2 };

function NumbMembGame (level) {
	this.level = level - 1;
	if (this.level < 3)
		this.level = 3;
	this.score = 0;
	this.nRoundsLeft = 3;
	this.startNewRound();
}

NumbMembGame.prototype.getSuccess = function() {
	if (this.round.nFailFails == 0) 
		return 1;
	else if(this.round.nFailFails == 1)
		return 0;
	return -1;
}

// Game.prototype.getNumberOfMissingTilesLastRound = function() {
// 	return this.round.getNumberOfMissingTiles()
// }

NumbMembGame.prototype.getResults = function() {
	return {endLevel: this.level, score: this.score};
}

// Game.prototype.clickPos = function(idx) {
// 	return this.round.clickPos(idx);
// }

// //redundant?
// Game.prototype.getMap = function(){
// 	return this.round.gameMap.map;
// }

NumbMembGame.prototype.startNewRound = function() {
	console.log("starting round: ", this.nRoundsLeft);
	this.nRoundsLeft -= 1;
	this.round = RoundModule.GameRoundFactory(this.level);
	return this.round.getMapViewModel(); // this.round.gameMap
}

NumbMembGame.prototype.getMemorizeTimeLength  = function() {
	console.log('NumbMembGame::getMemorizeTimeLength() ', this.level);
	return this.level * 1500;
}

// NumbMembGame.prototype.getNextTile = function() {
// 	return 3;
// }

// NumbMembGame.prototype.clickOption = function(idx) {
// 	console.log("NumbMembGame", idx);
// 	return EnumClickResult.Correct;
// }

NumbMembGame.prototype.registerResult = function(successClick) {
	this.round.addClick(successClick);
	return this.round.isRoundOver();
}

NumbMembGame.prototype.endRound =function() {
	this.incScore(this.round.nSuccessClicks);
	this.setNextLevel();
}


NumbMembGame.prototype.activateNextTile = function() {
	this.round.gameMap.selectNextTile();
	return this.round.gameMap.getOptionsInfo();
}

// NumbMembGame.prototype.getSelectionOptions = function() {
// 	// var options = [1, 3, 5, 4]; // first option should be correct
// 	// var obj = {
// 	// 	currTileIdx : 4,
// 	// 	options : options
// 	// }
// 	return this.round.gameMap.getOptionsInfo();
// 	//return obj;
// }

NumbMembGame.prototype.setNextLevel = function() {
	if(this.getSuccess() === 1)
		this.level += 1;
	else if(this.getSuccess() === -1)
		this.level -= 1;
	if(this.level < 3)
		this.level = 3;
}

NumbMembGame.prototype.incScore = function(nSuccessClicks) {
	this.score += nSuccessClicks;
}

// Game.prototype.isRoundOver = function() {
// 	if (this.round.gameOver() ) {
// 		this.incScore(this.round.nSuccessClicks);
// 		this.setNextLevel();
// 		return true;
// 	}
// 	return false
// }

NumbMembGame.prototype.getGameMap = function() {
	//return this.round.gameMap; // this.round.gameMap;
	return this.round.getMapViewModel();
}

NumbMembGame.prototype.isGameOver = function(){
	return (this.nRoundsLeft < 1);
}

// Game.prototype.getInfoText = function(){
// 	return "nRoundsLeft: " + this.nRoundsLeft + " Select Green";
// }

// Game.prototype.getNextTile = function(){
// 	return this.round.getNextTile();
// }


module.exports = {
	NumbMembGame: NumbMembGame,
	EnumClickResult : EnumClickResult
}