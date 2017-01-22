(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function (gameId, startGameScript, wnd) {
	// private:
	var GameState = {init: 1, started: 2, done: 3};
	var _gameState = GameState.init;
	var _initHasBeenRun = false;
	var _key;
	var _startGameScript, _gameId, _wnd;
	function sendToHost(msg) {
		//console.log("host_connector::sendToHost", msg);
		_wnd.top.postMessage(JSON.stringify(msg), '*');
	}
	function setupEventhandler() {
		_wnd.onmessage = function(e){
			var fromHost = JSON.parse(e.data);
			if(fromHost.msg == "start") {
				setAsStarted(fromHost.scriptKey, fromHost.level);
			}
		}
	}
	function setAsStarted (key, level) {
		if (_gameState == GameState.started)
			throw("HostConector::setAsStarted() game already started");
		_gameState = GameState.started;
		_key = key;
		startGameScript(level);
	}
	// only called when once, when script has loaded
	function init(gameId, startGameScript, wnd) {
		if (_initHasBeenRun)
			throw("game done, withouth started");

		console.log('init', gameId);
		_wnd = wnd;
		_gameId = gameId;
		_startGameScript = startGameScript;
		setupEventhandler();
		_initHasBeenRun = true;
		sendToHost({event: "client_loaded", gameId: gameId});  /// fix
	}

	// init:
	init(gameId, startGameScript, wnd);

	// public:
	this.gameDone = function(score, endLevel) {
		if (_gameState != GameState.started) {
			throw("game done, withouth started");
		}
		console.log("HostConector, score: ",score );
		_gameState = GameState.done;
		sendToHost({event: "game_over", key : _key, score : score, endLevel: endLevel});
	}
}


},{}],2:[function(require,module,exports){
'use strict';

var GameModule = require('./numbMembGame.js');

function Controller(host) {
	this.hostApp = host;
	this.createNewGame = function(view, level) {
		this.game = new GameModule.NumbMembGame(level);
		view.injectModel(this.game);
		view.makeScene(this.game.getGameMap());
	}
	this.startNewRound = function(view){
		if(this.game.isGameOver()) {
			var r = this.game.getResults();
			this.hostApp.gameDone(r.score, r.endLevel);
			return;
		}
		var gameMap = this.game.startNewRound();
		view.makePreRoundScene(gameMap);
	}
}

module.exports = {
	Controller : Controller
}
},{"./numbMembGame.js":5}],3:[function(require,module,exports){
'use strict';

var CtrlModule = require('./controller.js');
var viewModule = require('./view.js');
var HostConnector = require('../../common/HostConnector.js'); //require('../common/HostConnector.js');
var hostConnector, view, ctrl;

function startGameScript(level) {
	ctrl.createNewGame(view, level);
}

window.onload = function(){
	var gameId = 3;
	hostConnector = new HostConnector(gameId, startGameScript, window);
	ctrl = new CtrlModule.Controller(hostConnector);
	view = new viewModule.View(ctrl);
	view.setup('gamescreen', 550, 550);
}
},{"../../common/HostConnector.js":1,"./controller.js":2,"./view.js":7}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{"./round.js":6}],6:[function(require,module,exports){
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
},{"./gameMap.js":4}],7:[function(require,module,exports){
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
},{"./gameMap.js":4,"./numbMembGame.js":5}]},{},[3])