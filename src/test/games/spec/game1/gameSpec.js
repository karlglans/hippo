'use strict';

var enumTile = require('./../../../../main/games-src/games/game1/gameMap.js').enumTile;
var GameModule = require('./../../../../main/games-src/games/game1/rutorGame.js');

describe('Game:', function () {
	describe('Facory.', function () {
		var someLevel = 4;
		var game = new GameModule.Game(someLevel);
		it('can make a game with facory', function () {
			expect(game).to.exist; //.toBeDefined();
		});
	});

	describe('setNextLevel(). ', function () {
		var someStartLevel = 5;
		var game = new GameModule.Game(someStartLevel);
		game.round = {nFailFails: 0}; // mock

		it('can incease next level, if successfull', function () {
			game.round.nFailFails = 0;
			game.level = someStartLevel;
			game.setNextLevel();
			expect(game.level).to.equal(someStartLevel + 1);
		});
		it('can lower next level, when failed twice', function () {
			game.round.nFailFails = 2;
			game.level = someStartLevel;
			game.setNextLevel();
			expect(game.level).to.equal(someStartLevel - 1);
		});
		it('can can keep next level if just 1 miss', function () {
			game.round.nFailFails = 1;
			game.level = someStartLevel;
			game.setNextLevel();
			expect(game.level).to.equal(someStartLevel);
		});
		it('can not go below 3', function () {
			game.round.nFailFails = 2;
			game.level = 3;
			game.setNextLevel();
			expect(game.level).to.equal(3);
		});
	});
});