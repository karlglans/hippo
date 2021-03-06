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