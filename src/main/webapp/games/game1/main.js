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

var RutorModule = require('./rutorGame.js');

function Controller(host) {
	this.hostApp = host;
	this.createNewGame = function(view, level) {
		this.game = new RutorModule.Game(level);
		this.game.startNewRound();
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
		view.makeScene(gameMap);
	}
}

module.exports = {
	Controller : Controller
}
},{"./rutorGame.js":6}],3:[function(require,module,exports){
'use strict';

var CtrlModule = require('./controller.js');
var viewModule = require('./view.js');
var HostConnector = require('../../common/HostConnector.js'); //require('../common/HostConnector.js');
var hostConnector, view, ctrl;

function startGameScript(level) {
	ctrl.createNewGame(view, level);
}

window.onload = function(){
	var gameId = 1;
	hostConnector = new HostConnector(gameId, startGameScript, window);
	ctrl = new CtrlModule.Controller(hostConnector);
	view = new viewModule.View(ctrl);
	view.setup('gamescreen', 550, 550);
}
},{"../../common/HostConnector.js":1,"./controller.js":2,"./view.js":7}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{"./gameMap.js":4}],6:[function(require,module,exports){
'use strict';

var RoundModule = require('./round.js');

function Game (level) {
	this.level = level - 1;
	if (this.level < 3)
		this.level = 3;
	this.score = 0;
	this.nRoundsLeft = 5;
	//this.startNewRound();
}

Game.prototype.getSuccess = function() {
	if (this.round.nFailFails == 0) 
		return 1;
	else if(this.round.nFailFails == 1)
		return 0;
	return -1;
}

Game.prototype.getResults = function() {
	return {endLevel: this.level, score: this.score};
}

Game.prototype.clickPos = function(idx) {
	return this.round.clickPos(idx);
}

Game.prototype.getMap = function(){
	return this.round.gameMap.map;
}

Game.prototype.startNewRound = function() {
	this.nRoundsLeft -= 1;
	this.round = RoundModule.GameRoundFactory(this.level);
	return this.round.gameMap;
}

Game.prototype.setNextLevel = function() {
	if(this.getSuccess() === 1)
		this.level += 1;
	else if(this.getSuccess() === -1)
		this.level -= 1;
	if(this.level < 3)
		this.level = 3;
}

Game.prototype.incScore = function(nSuccessClicks) {
	this.score += nSuccessClicks;
}

Game.prototype.isRoundOver = function() {
	if (this.round.gameOver() ) {
		this.incScore(this.round.nSuccessClicks);
		this.setNextLevel();
		return true;
	}
	return false
}

Game.prototype.getGameMap = function() {
	return this.round.gameMap;
}

Game.prototype.isGameOver = function(){
	return (this.nRoundsLeft < 1);
}

// new, not tested
Game.prototype.getNumberOfMissingTilesLastRound = function(){
	return (this.round.level - this.round.nSuccessClicks);
}

module.exports = {
	Game: Game
}
},{"./round.js":5}],7:[function(require,module,exports){
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
},{"./gameMap.js":4}]},{},[3])