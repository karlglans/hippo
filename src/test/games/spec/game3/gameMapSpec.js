'use strict';

var GameMapModule = require('./../../../../main/games-src/games/game3/gameMap.js');

var GameMap = GameMapModule.GameMap;
var enumTileDisplay = GameMapModule.enumTileDisplay;
var enumTile = GameMapModule.enumTile;
var enumTileStatus = GameMapModule.enumTileStatus;


describe('GameMap:', function () {

	describe('Constructor.', function () {
		var level = 5;

		it('can make a new game gameMap', function () {	
			var instance = new GameMap(level);
			expect(instance).to.exist;
		});

		it('will make a map', function () {
			var instance = new GameMap(level);
			expect(instance.map).to.exist;
			expect(instance.map.length).to.equal(level);
		});
	});

	describe('getOptions.', function () {
		it('it will put the correct number as the first option', function () {
			var gameMap = Object.create(GameMap.prototype);
			gameMap.map = [1, 2, 33, 4, 5];
			gameMap.currTileIdx = 2; // thats 33
			var opts = gameMap.getOptions();
			expect(opts[0]).to.equal(33);
		});

		it('it should give 4 options', function () {
			var gameMap = Object.create(GameMap.prototype);
			gameMap.map = [1, 3, 5, 7, 9];

			// gameMap.map = Array();
			// gameMap.map.push(1);
			// gameMap.map.push(3);
			// gameMap.map.push(5);
			// gameMap.map.push(7);
			gameMap.currTileIdx = 2; // thats 33
			var opts = gameMap.getOptions();
			expect(opts.length).to.equal(4);
		});
	});
});