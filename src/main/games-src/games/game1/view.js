'use strict';

var GameMapModule = require('./gameMap.js');
var enumTile = GameMapModule.enumTile; 

function View(ctrl){
	this._ctrl = ctrl;
	this._tileColor = '#6A7C89';
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
	this._paper.circle(275, 275, 500).attr({stroke: "none", fill: "r(.5,.5)#4F6A7F-#A5AAAE", "opacityStops": "1-0-0.6"});
	this._tiles = this._paper.set();
	this._tilesOld = this._paper.set();
}

View.prototype.makeScene = function(gameMap){
	var i = 0, j = 0, idx=0;
	var tileSize = 50; // + 3 pix between
	var margin = 100;
	var tileSize = ( 550 - margin * 2) / gameMap.col; // v 

	this._bg = this._paper.rect(margin-10, margin-10, gameMap.col*tileSize + 20, gameMap.row*tileSize + 20, 10).attr("fill", '#CCCFCF').attr("stroke", '#7C8E8F');
	this._tiles.push(this._bg);
	for (j = 0; j < gameMap.row ; j ++ ) { // v = Y
		for (i = 0; i < gameMap.col ; i ++, idx++ ) { // u = X
			var rect = this._paper.rect(margin + i*tileSize, 2 + margin + j*tileSize, tileSize-4, tileSize-4, 10).attr("fill", this._tileColor).attr("stroke", '#4F6A7F');
			rect.tileId = idx;
			rect.tileType = gameMap.map[idx]; //idx % 3; // gameData[idx];
			if(rect.tileType == 1) 
				rect.attr({fill: 'red'});
			this._tiles.push(rect);
		}
	}
	this._tiles.transform('t0,-500'); // put the new tiles over the screen
	// animates falling
	var self = this;
	this._tiles.animate({transform: 't0,0'}, 250, 'easeIn', function(){
		self._tiles.exclude(self._bg); // remove the background from this set.
		
		// give the player a moment to memorize gameboard
		setTimeout(function(){
			self.activateScene();
		}, 2000);
	});
}

function howerInTile(){
	this.animate({transform: "s1.025"}, 200, "bounce");
}
function howerOutTile(){
	this.animate({transform: "s1.0"}, 200, "easeIn");
}
function stopInteractionsWithTile(tile){
	tile.unhover(howerInTile, howerOutTile);
	tile.attr({cursor: "default"});
	tile.unclick(); // this.tileClickFunction
}

View.prototype.activateScene = function(){
	var self = this;
	self._tiles.animate({fill: self._tileColor, transform: "s1.0"}, 200, "easeIn", function(){
		self._tiles.hover(howerInTile, howerOutTile);
		self._tiles.attr({cursor: "pointer"});
		self._tiles.click(function(){
			self.onClickTile(this);
		});
	});
}

View.prototype.deactivateScene = function(){
	this._tiles.unhover(howerInTile, howerOutTile);
	this._tiles.attr({cursor: "default"});
	this._tiles.unclick(this.onTileClick);
}

// // enumTile.badOne enumTile.goodOne
View.prototype.animateAfterClick = function (tile, result){
	if(result === enumTile.goodOne) 
		tile.animate({fill: "red", transform: "s1.0"}, 200, "easeIn");
	else if(result === enumTile.badOne) 
		tile.animate({fill: "#34333b", transform: "s1.0"}, 200, "easeIn");
}

View.prototype.onClickTile = function(tile){
	var result = this._game.clickPos(tile.tileId); // clickPos tileWasClicked
	stopInteractionsWithTile(tile, this.onClickTile);
	this.animateAfterClick(tile, result);
	if(this._game.isRoundOver()) 
		this.onGameRoundIsOver();
}

View.prototype.onGameRoundIsOver = function(){
	this.deactivateScene();
	if(this._game.getNumberOfMissingTilesLastRound() > 0) // 1 == no mistakes 
		this.displayMissedTiles(); // fix, missing tiles can be 0, then display success
	else this.displaySuccess();
	this.runRoundEndingAnimation(); // will start after 2 sec
}

View.prototype.displayMissedTiles = function(){
	this._tiles.forEach( function(t){
		if(t.tileType === enumTile.goodOne)  
			t.animate({fill: "pink", transform: "s1.0"}, 200, "easeIn");
	});
}

View.prototype.displaySuccess = function(){
	var self = this;
	this._tiles.animate({ transform: 'r90'}, 1000, 'bounce', function(){
		self._tiles.transform('r0'); // reset rotation to make the tiles behave well when animated next time 
	});
}

View.prototype.runRoundEndingAnimation = function(){
	var self = this;
	// a bit delayed so user can see the gameboard before it turns away
	setTimeout(function(){
		// move each tile from one set to antother set (so coordinates gets transformed?)
		self._tiles.forEach( function(t){
			var tile = self._tiles.pop(); // pop(t); 
			self._tilesOld.push(tile);
		});
		self._tilesOld.push(self._bg); // make sure the background follows the tiles
		// animate moving down
		self._tilesOld.animate({transform: 't0,500'}, 250, function(){
			self._tilesOld.forEach( function(t){
				var dead = self._tilesOld.pop(); // pop(t); 
				dead.remove();
			});
		});
		self._ctrl.startNewRound(self);
	}, 2000);
}

module.exports = {
	View : View
}