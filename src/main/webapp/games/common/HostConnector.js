'use strict';

module.exports = function (gameId, startGameScript, wnd) {
	// private:
	var GameState = {init: 1, started: 2, done: 3};
	var _gameState = GameState.init;
	var _initHasBeenRun = false;
	var _key;
	var _startGameScript, _gameId, _wnd;
	function sendToHost(msg) {
		console.log("host_connector::sendToHost", msg);
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
		_wnd = wnd;
		_gameId = gameId;
		_startGameScript = startGameScript;
		setupEventhandler();
		_initHasBeenRun = true;
		sendToHost({event: "client_loaded", gameId: 12});  /// fix
	}

	// init:
	init(gameId, startGameScript, wnd);

	// public:
	this.gameDone = function(score, endLevel) {
		if (_gameState != GameState.started) {
			throw("game done, withouth started");
		}
		_gameState = GameState.done;
		sendToHost({event: "game_over", key : _key, score : score, endLevel: endLevel});
	}
}

