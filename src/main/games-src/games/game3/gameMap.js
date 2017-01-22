'use strict';

function GameMap(level) {
	if (!level)
		throw "GameMap() missing param";
	//this.row = this.col = 0;
	this.map = 111; // array of numbers
	this.tilesUsed = undefined; // array of numbers
	this.generateMap(level);
	this.currTileIdx = -1;
	this.level = level;
}

GameMap.prototype.generateMap = function(level){
	var newMap = [], tilesUsed = [];
	for(var i = 0; i < level; i++) {
		newMap[i] = 1 + (Math.floor(Math.random() * 10)) % 9;
		tilesUsed[i] = false;
	}
	this.map = newMap;
	this.tilesUsed = tilesUsed;
	this.currTileIdx = Math.floor(Math.random() * level);
	this.tilesUsed[this.currTile] = true;
	console.log(newMap);
}

// select 4 options. TODO: Remake this function
GameMap.prototype.getOptions = function() {
	var options = [];
	// first option is the correct one
	var taken = this.map[this.currTileIdx];
	var opIdx = 0;
	options[opIdx] = this.map[this.currTileIdx];
	opIdx = 1;

	var i, alreadyThere = false;
	var elementFoundInMap;
	for (var safe = 0 ; safe < 100 && opIdx < 4; safe++) {
		var p = parseInt(Math.random()*10);
		i = 0;
		alreadyThere = false;
		// test if p is quniqe
		for(i = 0; i < opIdx; i++) {
			if(options[i] === p) {
				alreadyThere = true;
				break;
			}
		}
		// first try to grab numbers not found in map, those will be easyer for a player to exclude
		if(safe < 50) {
			if(this.map.indexOf(p) != -1)
				continue;
		}
		if(alreadyThere)
			continue;
		options[opIdx] = p;
		opIdx++;
	}

	return options;
}

GameMap.prototype.getOptionsInfo = function() {
	var options = this.getOptions(); // first option should be correct
	console.log("getOptionsInfo()", options);
	var obj = {
		currTileIdx : this.currTileIdx,
		options : options
	}
	return obj;
}

GameMap.prototype.selectNextTile = function() {
	var foundNextTile = false;
	var nextTileIdx = -1;
	var safe = 0;
	while(safe++ < 1000) {
		nextTileIdx = Math.floor(Math.random() * this.level);
		if(this.tilesUsed[nextTileIdx] == false) {
			this.tilesUsed[nextTileIdx] = true;
			this.currTileIdx = nextTileIdx;
			return;
		}
	}
	throw("GameMap:selectNextTile()");
}

// GameMap.prototype.generateMap = function(level){
// 	return this.map;
// }

// called after a mouse-click.
// GameMap.prototype.checkPos = function(idx){
// 	return this.map[idx];
// }

module.exports = {
	GameMap : GameMap
};