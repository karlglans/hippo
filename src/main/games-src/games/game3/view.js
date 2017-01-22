'use strict';

var GameMapModule = require('./gameMap.js');
var enumTile = GameMapModule.enumTile;
var enumClickResult = require('./numbMembGame.js').EnumClickResult;
//var enumTileDisplay = require('./../../../../main/games-src/games/game2/round.js').enumTileDisplay;

var colorDisableText = "#999999";
var colorText = "#111111";
var colorFail = "#ff1111";
var screenWidth = 550;
var screenHeigh = 550;

function View(ctrl){
	this._ctrl = ctrl;
	this._tileColor = '#6A7C89';
	this._options = []; // 4 lable SVG text elements
	this._currTile = null;
	this.isAnimating = false;
	//this._tileToBeFound = enumTile.badOne; // not used atm
}

View.prototype.injectModel = function(game){
	this._game = game;
}

View.prototype.bindGameOverCallback = function(gameOverCallback){
	this._gameOverCallback = gameOverCallback;
}

View.prototype.setup = function(divName, width, height){ //
	this._paper = Raphael(document.getElementById(divName), width, height);
	// make a huge circle as a background
	this._paper.circle(275, 275, 500).attr({stroke: "none", fill: "r(.5,.5)#7F6A4F-#AEAAA5", "opacityStops": "1-0-0.6"});
	this._tileArr = [];
	this._tiles = null; //this._paper.set();
	this._tilesLables = null; // rahpahelSet
	this._infoTextSet = this._paper.set();
	this._selectionSet = this._paper.set();
	this.makeSelectionUI();
	this._buttonSet = this._paper.set();
}

View.prototype.makePreRoundScene = function(gameMap) {
	var buttonWidth = 300; 
	var topLeft = (screenWidth - buttonWidth) / 2;
	var rect = this._paper.rect(topLeft, 100, buttonWidth, 50).attr("fill", this._tileColor).attr("stroke", '#4F6A7F');
	var lable = this._paper.text(topLeft + buttonWidth/2, 125, "Next Round").attr("font-size", 26).attr("stroke", '#111111').attr("fill", '#111111');
	this._buttonSet.push(rect);
	this._buttonSet.push(lable);
	var self = this; 
	rect.attr({cursor: "pointer"});
	rect.click(function() {
		this.unclick();
		self._buttonSet.remove();
		self.makeScene(gameMap);
	});
}

View.prototype.endRound = function() {
	var self = this;
	this._game.endRound();
	this._selectionSet.hide();
	this._tiles.animate({transform: 't0,-500'}, 250, 'easeIn', function(){
		self.destroyScene();
		self._ctrl.startNewRound(self);
	});
}

View.prototype.thereAreMoreTilesLeft = function() {
	var untouchedFound = false;
	this._tileArr.forEach(function(e){
		if(e.untouched === true)
			untouchedFound = true; // found at least 1 tile still untouched
	});
	return untouchedFound;
}

View.prototype.clickOption = function(selectedOption) {
	if(this.isAnimating)
		return;
	// only click once
	if(selectedOption.lable.clicked)
		return;
	selectedOption.lable.clicked = true;

	var isCorret = selectedOption.lable.isCorrect;
	var self = this;
	var tile = this._currTile;

	this.isAnimating = true;
	var roundIsOver = this._game.registerResult(isCorret);
	if(this.thereAreMoreTilesLeft() == false)
		roundIsOver = true;
 
	function afterAnimation(){
		self.isAnimating = false;
		selectedOption.attr({cursor: "default"});
		if(roundIsOver) {
			self.endRound();
		}
			else self.activateNextTile();
	}

	if (isCorret) {
		this._currTile.lable.attr("text", selectedOption.lable.figure);
		this._currTile.lable.animate({stroke: colorText, fill: colorText, transform: "s1.0"}, 200, "easeIn", function(){
			afterAnimation();
		});

	} else if(!isCorret && tile.nMistakes < 1) { // fail click but still waiting for 2nd click
		selectedOption.lable.animate({stroke: colorFail, fill: colorFail}, 200, "easeIn", function(){
			self.isAnimating = false;
			tile.nMistakes++;
		});

	} else { // last fail click
		var str = "t"+this._currTile.posX+" "+this._currTile.posY +", r180 0 0"; // funkar
		selectedOption.lable.animate({stroke: colorFail, fill: colorFail}, 100, "easeIn");
		this._currTile.lable.attr("text", this._currTile.figure);
		this._currTile.lable.animate({stroke: colorDisableText, fill: colorDisableText}, 200, "easeIn");
		this._selectionSet.animate({transform: str}, 1000, 'easeIn', function(){
			afterAnimation();
		});
	}
}

/* Will only be called once.

 */
View.prototype.makeSelectionUI = function() {
	var self = this;
	this._selectionSet.transform('');
	var alpha = 2*Math.PI/4;
	var beta = 2*Math.PI/8;
	for(var i = 0; i < 4 ; i++) {
		var _set = this._paper.set();
		var posX = 60 * Math.cos(i*alpha + beta);
		var posY = 60 * Math.sin(i*alpha + beta);
		var cir = this._paper.circle(posX, posY, 20).attr({stroke: "none", fill: "green"});
		var lable = this._paper.text(posX, posY, "" + i).attr("font-size", 20).attr("stroke", '#111111').attr("fill", '#111111');
		cir.idx = i;
		cir.click(function(e){
			self.clickOption(this);
		});
		cir.lable = lable;
		this._options.push(lable);
		this._selectionSet.push(cir);
		this._selectionSet.push(lable);
	}
	this._selectionSet.hide();
}

View.prototype.activateNextTile = function() {
	
	var selecInfo = this._game.activateNextTile();
	var currTileIdx = selecInfo.currTileIdx;
	var tile = this._tileArr[currTileIdx];
	
	if(!tile)
		throw("View::activateNextTile() .missing tile");
	//var _set = this._paper.set();

	var i = parseInt(Math.random()*4);
	var self = this;
	this._options.forEach(function(lable) {
		var idx = i++ % 4;
		var figure = selecInfo.options[idx];
		lable.attr("text", figure);
		lable.clicked = false;
		lable.figure = figure; // maybe remove
		lable.isCorrect = (idx === 0);
		lable.attr("stroke", colorText);
		lable.attr("fill", colorText);
	});

	tile.lable.attr("stroke", colorText);
	tile.lable.attr("fill", colorText);
	tile.nMistakes = 0;
	tile.untouched = false;
	this._currTile = tile;
	this._selectionSet.attr({cursor: "pointer"});
	this._selectionSet.transform('t' + tile.posX + ',' + tile.posY); // put the new tiles over the screen
	this._selectionSet.toFront();
	this._selectionSet.show();
}

View.prototype.destroyScene = function() {
	this._tileArr.forEach( function(e){
		e.lable = null; // remove ref
	});
	this._tilesLables.remove();
	this._bg.remove();
	this._tileArr = null;
	this._tiles.remove();
}


/* length : 6   col : 6
   row : 1      * * * * * *

   length : 16  col : 6
   row : 3      * * * * * *
   				* * * * * *
   				* * * *
   length : 26  col : 7
   				* * * * * * *
   row : 4		* * * * * * *
   				* * * * * * *
   				* * * * *
 */
View.prototype.dimMap = function(length) {
	var row = 1, col = 6;
	for (var i = 0 ; i < length ; i++) {
		if(row * col >= length)
			break; // found fitting dim
		if(row + 3 < col)
			row ++;
		else 
			col ++;
	}
	return {row : row, col : col}
}

View.prototype.makeScene = function(gameMap) {
	var dim = this.dimMap(gameMap.length);
	var col = dim.col;
	var row = dim.row;
	var i = 0, j = 0, idx=0;
	var tileSize = 50; // + 3 pix between
	var margin = 100;
	var tileSize = ( 550 - margin * 2) / col; // v 
	var textOffset = (tileSize-4) / 2;
	var lableArr = [];
	this._tileArr = [];

	this._tiles = this._paper.set();
	this._tilesLables = this._paper.set();
	this._bg = this._paper.rect(margin-10, margin-10, col*tileSize + 20, row*tileSize + 20, 10).attr("fill", '#CCCFCF').attr("stroke", '#7C8E8F');
	this._tiles.push(this._bg);
	for (j = 0; j < row ; j ++ ) { // v = Y
		for (i = 0; i < col ; i ++, idx++ ) { // u = X
			var number = gameMap[idx];
			if(!number)
				continue;
			var centX = margin + i*tileSize + textOffset;
			var centY = 2 + margin + j*tileSize + textOffset;
			var rect = this._paper.rect(margin + i*tileSize, 2 + margin + j*tileSize, tileSize-4, tileSize-4, 10).attr("fill", this._tileColor).attr("stroke", '#4F6A7F');
			rect.posX = centX;
			rect.posY = centY;
			rect.tileId = idx;
			rect.figure = number;
			rect.untouched = true;
			this._tiles.push(rect);
			this._tileArr.push(rect);
			var lable = this._paper.text(centX, centY, "" + number).attr("font-size", 26).attr("stroke", '#111111').attr("fill", '#111111');
			rect.lable = lable;
			this._tilesLables.push(lable);
			this._tiles.push(lable);
		}
	}
	//this._tiles.push(this._tilesLables);
	this._tiles.transform('t0,-500'); // put the new tiles over the screen
	// animates falling
	var self = this;
	this._tiles.animate({transform: 't0,0'}, 250, 'easeIn', function(){
		//self._tiles.exclude(self._bg); // remove the background from this set.
		// give the player a moment to memorize gameboard
		var time = self._game.getMemorizeTimeLength();
		setTimeout(function(){
			self.activateScene();
		}, time);
	});
}




// function howerInTile(){
// 	this.animate({transform: "s1.025"}, 200, "bounce");
// }
// function howerOutTile(){
// 	this.animate({transform: "s1.0"}, 200, "easeIn");
// }
// function stopInteractionsWithTile(tile){
// 	tile.unhover(howerInTile, howerOutTile);
// 	tile.attr({cursor: "default"});
// 	tile.unclick();
// }

View.prototype.activateScene = function(){
	console.log("activateScene");
	var self = this;
	this._tilesLables.attr("text", "?");
	this._tilesLables.animate({stroke: colorDisableText, fill: colorDisableText, transform: "s1.0"}, 200, "easeIn", function(){
		self.activateNextTile();
	});
}

module.exports = {
	View : View
}