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