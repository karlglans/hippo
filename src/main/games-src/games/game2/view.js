'use strict';

var GameMapModule = require('./gameMap.js');
var enumTile = GameMapModule.enumTile;
//var enumTileDisplay = require('./../../../../main/games-src/games/game2/round.js').enumTileDisplay;

var enumTileDisplay = GameMapModule.enumTileDisplay;

var tileColorHex = [];
tileColorHex[enumTileDisplay.color1] 		= "#ff4444";
tileColorHex[enumTileDisplay.color1Error] 	= "#330000";
tileColorHex[enumTileDisplay.color2] 		= "green";
tileColorHex[enumTileDisplay.color2Error] 	= "#003300";
tileColorHex[enumTileDisplay.color3] 		= "#000044";
tileColorHex[enumTileDisplay.color3Error] 	= "#000033";
tileColorHex[enumTileDisplay.badPick] 		= "#34333b";

var tileColorAfterHex = []; // tileColorHex.slice();
tileColorAfterHex[enumTileDisplay.color1] 		= "#ffaaaa";
tileColorAfterHex[enumTileDisplay.color2] 		= "#aaffaa";
tileColorAfterHex[enumTileDisplay.color3] 		= "#aaaaff";


function View(ctrl){
	this._ctrl = ctrl;
	this._tileColor = '#6A7C89';
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
	this._paper.circle(275, 275, 500).attr({stroke: "none", fill: "r(.5,.5)#4F6A7F-#A5AAAE", "opacityStops": "1-0-0.6"});
	this._tiles = this._paper.set();
	this._tilesOld = this._paper.set();
	this._infoTextSet = this._paper.set();
	//this._tiles.push(this._infoTextSet);
}

View.prototype.makePreroundInfo = function(text){
	// remove prev text
	var dead = this._infoTextSet.pop();
	if(!!dead) {
		dead.remove();
	}

	var nextTileType = this._game.getNextTile();

	if (nextTileType === 0) // enumTile.badOne <-- signals end
		return;

	var rect = this._paper.rect(550/2, 10, 20, 20, 5).attr("fill", this._tileColor).attr("stroke", '#4F6A7F');
	rect.attr({fill: tileColorHex[nextTileType]});
	this._infoTextSet.push(rect);
	this._infoTextSet.transform('t-500,0'); // put the new tiles over the screen
	this._infoTextSet.animate({transform: 't0,0'}, 500, 'easeIn');
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
			rect.clicked = false;
			if(rect.tileType == enumTileDisplay.color1 || rect.tileType == enumTileDisplay.color2) {
				rect.shouldHaveBeenClicked = true;
				rect.attr({fill: tileColorHex[rect.tileType]});
			}
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
	this.makePreroundInfo();
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
	tile.unclick();
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


View.prototype.animateAfterClick = function (tile, result){
	if(!tileColorHex[result])
		throw ("unknown tile");
	tile.animate({fill: tileColorHex[result], transform: "s1.0"}, 200, "easeIn")
}

View.prototype.onClickTile = function(tile){
	var result = this._game.clickPos(tile.tileId); // clickPos tileWasClicked
	tile.clicked = true;
	this.makePreroundInfo();
	stopInteractionsWithTile(tile, this.onClickTile);
	this.animateAfterClick(tile, result);
	if(this._game.isRoundOver()) 
		this.onGameRoundIsOver();
}

View.prototype.onGameRoundIsOver = function(){
	this.deactivateScene();
	if(this._game.getSuccess() != 1) // some mistakes. 1 == no mistakes 
		this.displayMissedTiles(); // fix, missing tiles can be 0, then display success
	else this.displaySuccess();
	this.runRoundEndingAnimation(); // will start after 2 sec
}

View.prototype.displayMissedTiles = function(){
	var colorString = "aaa";
	this._tiles.forEach( function(t){
		if(t.shouldHaveBeenClicked === true && t.clicked === false) {
			colorString = tileColorAfterHex[t.tileType];
			t.animate({fill: colorString, transform: "s1.0"}, 200, "easeIn");
		}
		// else if(t.tileType === enumTileDisplay.color2 && t.clicked == false)  
		// 	t.animate({fill: "pink", transform: "s1.0"}, 200, "easeIn");
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