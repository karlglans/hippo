'use strict';

var GameMap = require('./../../../../main/games-src/games/game1/gameMap.js').GameMap;
var enumTile = require('./../../../../main/games-src/games/game1/gameMap.js').enumTile;

describe('GameMap', function () {
	describe('Method SetDim().', function () {
		var someDencity = 0.5, level = 5;
		var gameMap = new GameMap();
		gameMap.setDim(someDencity, level);

		it('will set a value for row and col.', function () {
			expect(gameMap.row > 1 && gameMap.col > 1).to.be.true;
			expect(gameMap.row * gameMap.col * someDencity > level).to.be.true;
		});
	});

	describe('Method: generateMap().', function () {
		var gm = new GameMap();
		var row = 5, col = 6, level = 3;
		gm.generateMap(row, col, level);

		it('has corrext size.', function () {
			expect(gm.map.length).to.equal(row*col);
		});

		it("has level number of 1's in it.", function () {
			var countTiles = 0;
			gm.map.forEach(function(item){
				if(item == 1)
					countTiles++;
			});
			expect(countTiles).to.equal(level);
		});
	});
});