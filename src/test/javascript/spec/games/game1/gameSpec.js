'use strict';
// var enumTile = require('../../../main/webapp/games-src/game1/gameMap.js').enumTile;
// var GameModule = require('../../../main/webapp/games-src/game1/model.js');

xdescribe('Game', function () {
	xdescribe('Facory.', function () {
		var someLevel = 4;
		var game = GameModule.GameFacotry(someLevel);

		it('can make a game with facory', function () {
			expect(game).toBeDefined();
		});
	});

	xdescribe('nextLevel().', function () {
		var level = 5;
		var game = new GameModule.Game(level);

		it('can incease next level, if successfull', function () {
			game.nFailFails = 0;
			expect(game.nextLevel()).toBe(level + 1);
		});
		it('can lower next level, when failed twice', function () {
			game.nFailFails = 2;
			expect(game.nextLevel()).toBe(level - 1);
		});
		it('can can keep next level if just 1 miss', function () {
			game.nFailFails = 1;
			expect(game.nextLevel()).toBe(level);
		});
	});

	xdescribe('gameOver()', function () {
		var level = 5;
		var game = new GameModule.Game(level);

		it('can end game if loss', function () {
			game.nFailFails = 2;
			game.nSuccessClicks = 1;
			expect(game.gameOver()).toBe(true);
		});
		it('can end game if success', function () {
			game.nSuccessClicks = level;
			game.nFailFails = 1;
			expect(game.gameOver()).toBe(true);
		});
		it('will not end game when there is more to do', function () {
			game.nFailFails = 1;
			game.nSuccessClicks = level - 1;
			expect(game.gameOver()).toBe(false);
		});
	});
});