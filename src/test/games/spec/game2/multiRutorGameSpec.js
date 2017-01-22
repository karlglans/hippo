'use strict';

var Game = require('./../../../../main/games-src/games/game2/multiRutorGame.js').Game;


describe('multiRutorGame ', function () {
	describe('Constructor.', function () {
		var level = 5;

		it('can be instantiated', function () {	
			var instance = new Game(level);
			expect(instance).to.exist;
		});

		it('should decrease start level', function () {	
			var game = new Game(level);
			expect(game.level).to.equal(level - 1);
		});
	});
});