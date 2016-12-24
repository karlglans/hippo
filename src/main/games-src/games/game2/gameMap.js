'use strict';

var QuadMap = require('../../common/GameMaps/QuadMap.js').QuadMap;

var enumTile = {badOne: 0, usedOne: 1, greenOne: 2, redOne: 3, badRedOne: 4, badGreenOne: 5};
var enumTileStatus = {untouched: 0, correct : 1, mistake : 2};

// Used by View
var enumTileDisplay = {noColor: 0, badPick: 1, 	color1: 2, color1Error : 3, 
												color2: 4, color2Error : 5,
												color3: 6, color3Error : 7,}

var colorToViewColor = [];
colorToViewColor[0] = enumTileDisplay.noColor;
colorToViewColor[1] = enumTileDisplay.color1;
colorToViewColor[2] = enumTileDisplay.color2;
colorToViewColor[3] = enumTileDisplay.color3;

var colorToDisplayError = [];
colorToDisplayError[0] = enumTileDisplay.badPick;
colorToDisplayError[1] = enumTileDisplay.color1Error;
colorToDisplayError[2] = enumTileDisplay.color2Error;
colorToDisplayError[3] = enumTileDisplay.color3Error;

function GameMap(dencity, level) {
	this.tileStatus = []; // 
	// Call the parent constructor
  	QuadMap.call(this, dencity, level);
  	// generate map
  	this.generateMap(this.row, this.col, level);
}
// inherit QuadMap
GameMap.prototype = Object.create(QuadMap.prototype);
// D.prototype = new C(); // use inheritance

GameMap.prototype.getMostFrequentColor = function() {
	var mapSize = this.row * this.col;
	var countColors = []; // <-- countColors[color] = freq
	var maxFound = 0, maxFoundColor = 0;
	for(var i = 0; i < mapSize ; i++) {
		if(this.tileStatus[i] == enumTileStatus.correct || this.tileStatus[i] == enumTileStatus.mistake)
			continue;
		var color = this.map[i];
		if(color === 0)
			continue;
		if(!countColors[color])
			countColors[color] = 1;
		else {
			countColors[color]++;
		}
		var count = countColors[color];
		if(count > maxFound) {
			maxFound = count;
			maxFoundColor = color;
		} else if(count == maxFound && color < maxFoundColor) {
			maxFound = count;
			maxFoundColor = color;
		}
	}
	return maxFoundColor;
}

GameMap.prototype.moreThenOneColorLeft = function() {
	var tilesByMaxColor = this.sortTilesByFequency();
	if(tilesByMaxColor.length < 2)
		return false;
	return true;
}


/**
 * Will return an array sorted by the color with highest frequency: [{color 2: count 3}, {color 1: count: 2}]
 */
GameMap.prototype.sortTilesByFequency = function() {
	var mapSize = this.row * this.col;
	var countColors = []; // <-- countColors[color] = {color: color, count : 1};
	for(var i = 0; i < mapSize ; i++) {
		if(this.tileStatus[i] == enumTileStatus.correct || this.tileStatus[i] == enumTileStatus.mistake)
			continue;
		var color = this.map[i];
		if(color == 0) {
			// skip color 0
		} else if(!countColors[color])
			countColors[color] = {color: color, count : 1};
		else {
			countColors[color].count++;
		}
	}
	function compare(a,b) {
		if (a.count < b.count)
			return 1;
		if (a.count > b.count)
			return -1;
		return 0;
	}
	countColors.sort(compare);
	return countColors;
}

GameMap.prototype.generateMap = function(row, col, level){
	var newMap = [], newTileStatus = [];
	var mapSize = row * col;
	var noColor = 0, tileColor;
	for(var i = 0; i < mapSize; i++) {
		newMap[i] = noColor;		
		newTileStatus[i] = enumTileStatus.untouched;
	}
	var spotToBeFound = level;
	var safe = 0;
	while(spotToBeFound > 0){
		var spot = Math.floor(Math.random() * mapSize);
		if(newMap[spot] === noColor) {
			if(spotToBeFound % 2 == 0)
				tileColor = 1;
			if(spotToBeFound % 2 == 1)
				tileColor = 2;
			newMap[spot] = tileColor;
			spotToBeFound--;
		}
		if(safe++ > 1000) 
			throw "GameMap:generateMap() too big somehow"; // TODO remove
	}
	this.map = newMap;
	this.tileStatus = newTileStatus;
}

GameMap.prototype.createMapViewModel = function() {
	var obj = {row: this.row, col: this.col};
	var mapToDisplayColors = [];
	var mapSize = this.row * this.col;
	for(var i = 0; i < mapSize; i++) {
		mapToDisplayColors[i] = colorToViewColor[ this.map[i] ];
	}
	obj.map = mapToDisplayColors;
	return obj;
}

/**
 *  Will alter state for a tile.
 */
GameMap.prototype.touchTile = function(idx, color) {
	var viewColor;
	if(this.tileStatus[idx] !== enumTileStatus.untouched )
		throw "tile already touched";
	if(this.map[idx] === color) {
		this.tileStatus[idx] = enumTileStatus.correct;
		viewColor = colorToViewColor[ this.map[idx] ];
	} else {
		this.tileStatus[idx] = enumTileStatus.mistake;
		viewColor = colorToDisplayError[ this.map[idx] ];
	}
	return {color: this.map[idx], status: this.tileStatus[idx], viewColor : viewColor};
}

GameMap.prototype.getViewColor = function(color) {
	return colorToViewColor[color];
}

module.exports = { 
	enumTileStatus : enumTileStatus, 
	GameMap : GameMap, 
	enumTile : enumTile, 
	enumTileDisplay : enumTileDisplay
};