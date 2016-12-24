'use strict';

var enumTile = {badOne: 0, goodOne: 1, used: 2}; 

function GameMap(dencity, level) {
	if (!dencity || !level)
		return;
	this.row = this.col = 0;
	this.map = undefined;
	this.setDim(dencity, level);
	this.generateMap(this.row, this.col, level);
}

GameMap.prototype.setDim = function(dencity, level){
	var u =  1, v = 1;
	var safe = 0;
	while (true){
		if( u * v * dencity > level )
			break;
		if( u == v ) 
			v++; // increase v before u
		else 
			u++;
		if(safe++ > 1000) 
			throw "too big somehow"; // TODO remove
	}
	this.row = u;
	this.col = v;
}

GameMap.prototype.generateMap = function(row, col, level){
	var newMap = [];
	var mapSize = row * col;
	for(var i = 0; i < mapSize; i++) 
		newMap[i] = enumTile.badOne;
	var spotToBeFound = level;
	var safe = 0;
	while(spotToBeFound > 0){
		var spot = Math.floor(Math.random() * mapSize);
		if(newMap[spot] === enumTile.badOne) {
			newMap[spot] = enumTile.goodOne;
			spotToBeFound--;
		}
		if(safe++ > 1000) 
			throw "too big somehow"; // TODO remove
	}
	this.map = newMap;
}

GameMap.prototype.getIdx = function(x, y){
	if(x > this.col || y > this.row)
		throw("param too big");
	return y*this.col + x; 
}

// called after a mouse-click.
GameMap.prototype.checkPos = function(idx){
	return this.map[idx];
}

module.exports = {
	GameMap : GameMap,
	enumTile : enumTile
};