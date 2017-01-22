(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function QuadMap(dencity, level) {
	if (!dencity || !level)
		throw "missing params";
	this.row = this.col = 0;
	this.map = undefined;
	this.setDim(dencity, level); // 2016-12-10 setDim(dencity, level);
}

QuadMap.prototype.setDim = function(dencity, level){
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

QuadMap.prototype.getDim = function() {
	return {row: this.row, col: this.col};
}

QuadMap.prototype.getIdx = function(x, y){
	if(x > this.col || y > this.row)
		throw("param too big");
	return y*this.col + x; 
}

QuadMap.prototype.checkPos = function(idx){
	return this.map[idx];
}
QuadMap.prototype.setPos = function(idx, value){
	console.log('setPos', idx, value);
	this.map[idx] = value;
}

module.exports = {
	QuadMap : QuadMap
};
},{}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
'use strict';

var RutorModule = require('./multiRutorGame.js');

function Controller(host) {
	this.hostApp = host;
	this.createNewGame = function(view, level) {
		this.game = new RutorModule.Game(level);
		view.injectModel(this.game);
		view.makeScene(this.game.getGameMap());
	}
	this.startNewRound = function(view){
		if(this.game.isGameOver()) {
			var r = this.game.getResults();
			this.hostApp.gameDone(r.score, r.endLevel);
			return;
		}
		var gameMap = this.game.startNewRound(); // this.game.startNewRound
		view.makeScene(gameMap);
	}
}

module.exports = {
	Controller : Controller
}
},{"./multiRutorGame.js":6}],4:[function(require,module,exports){
'use strict';

var CtrlModule = require('./controller.js');
var viewModule = require('./view.js');
var HostConnector = require('../../common/HostConnector.js'); //require('../common/HostConnector.js');
var hostConnector, view, ctrl;

function startGameScript(level) {
	console.log('startGameScript(), level: ', level);
	ctrl.createNewGame(view, level);
}

window.onload = function(){
	var gameId = 2;
	hostConnector = new HostConnector(gameId, startGameScript, window);
	ctrl = new CtrlModule.Controller(hostConnector);
	view = new viewModule.View(ctrl);
	view.setup('gamescreen', 550, 550);
}
},{"../../common/HostConnector.js":2,"./controller.js":3,"./view.js":8}],5:[function(require,module,exports){
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
},{"../../common/GameMaps/QuadMap.js":1}],6:[function(require,module,exports){
'use strict';

var RoundModule = require('./round.js');

function Game (level) {
	this.level = level - 1;
	if (this.level < 3)
		this.level = 3;
	this.score = 0;
	this.nRoundsLeft = 5;
	this.startNewRound();
}

Game.prototype.getSuccess = function() {
	if (this.round.nFailFails == 0) 
		return 1;
	else if(this.round.nFailFails == 1)
		return 0;
	return -1;
}

Game.prototype.getNumberOfMissingTilesLastRound = function() {
	return this.round.getNumberOfMissingTiles()
}

Game.prototype.getResults = function() {
	return {endLevel: this.level, score: this.score};
}

Game.prototype.clickPos = function(idx) {
	return this.round.clickPos(idx);
}

//redundant?
Game.prototype.getMap = function(){
	return this.round.gameMap.map;
}

Game.prototype.startNewRound = function() {
	this.nRoundsLeft -= 1;
	this.round = RoundModule.GameRoundFactory(this.level);
	return this.round.getMapViewModel(); // this.round.gameMap
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
	//return this.round.gameMap; // this.round.gameMap;
	return this.round.getMapViewModel();
}

Game.prototype.isGameOver = function(){
	return (this.nRoundsLeft < 1);
}

Game.prototype.getInfoText = function(){
	return "nRoundsLeft: " + this.nRoundsLeft + " Select Green";
}

Game.prototype.getNextTile = function(){
	return this.round.getNextTile();
}


module.exports = {
	Game: Game
}
},{"./round.js":7}],7:[function(require,module,exports){
'use strict';

var GameMapModule = require('./gameMap.js');
var enumTileStatus = GameMapModule.enumTileStatus;
var dencity = 0.6;
var enumTileDisplay = GameMapModule.enumTileDisplay;

function GameRound(level, gameMap) {
	this.level = level;
	this.gameMap = gameMap;
	this.nSuccessClicks = 0;
	this.nFailFails = 0;
	this.nextTileColor = this.calcnextTileColor(false);
	this.prevClickWasMistake = false;
}

GameRound.prototype.calcnextTileColor = function() {
	var curColor = this.gameMap.getMostFrequentColor();
	if(this.gameOver())
		curColor = enumTileDisplay.noColor;
	
	if( this.gameMap.moreThenOneColorLeft() && curColor === this.nextTileColor) {
		console.log("switching color", curColor, 1);
		curColor = 1;
	}
	this.nextTileColor = curColor;
	return curColor;
}

GameRound.prototype.getNumberOfMissingTiles = function() {
	return this.level - this.nFailFails;
}

GameRound.prototype.clickPos = function(idx) {
	var nClicks = this.nSuccessClicks + this.nFailFails;
	var tile = this.gameMap.touchTile(idx, this.nextTileColor);
	if(tile.status === enumTileStatus.correct) {
		this.nSuccessClicks++;
	} else {
		this.nFailFails++;
	}
	this.nextTileColor = this.calcnextTileColor();
	return tile.viewColor;
}

GameRound.prototype.gameOver = function() {
	if (this.nFailFails >= 2)
		return true;
	if (this.nSuccessClicks == this.level)
		return true;
	if (this.nextTileColor == 0)
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

GameRound.prototype.getNextTile = function(){
	return this.gameMap.getViewColor(this.nextTileColor);
}

GameRound.prototype.getMapViewModel = function() {
	return this.gameMap.createMapViewModel();
}

module.exports = {
	enumTileDisplay: enumTileDisplay,
	GameRound: GameRound,
	GameRoundFactory : GameRoundFactory
}
},{"./gameMap.js":5}],8:[function(require,module,exports){
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
},{"./gameMap.js":5}]},{},[4])