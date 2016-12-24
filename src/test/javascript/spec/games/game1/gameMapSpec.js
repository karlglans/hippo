'use strict';
//var GameMap = require('../../../main/webapp/games/game1/gameMap.js').GameMap;
//var enumTile = require('../../../main/webapp/games/game1/gameMap.js').enumTile;

describe('GameMap', function () {
	describe('Method SetDim().', function () {
		var someDencity = 0.5;
		var level = 5;
		var gameMap = new GameMap();
		gameMap.setDim(someDencity, level);

		it('will set a value for row and col.', function () {
			expect(gameMap.row > 1 && gameMap.col > 1).toBeTruthy();
			expect(gameMap.row * gameMap.col * someDencity > level).toBeTruthy();
		});
	});

	describe('Method: generateMap().', function () {
		var gm = new GameMap();
		var row = 5, col = 6, level = 3;
		gm.generateMap(row, col, level);

		it('has corrext size.', function () {
			expect(gm.map.length).toBe(row*col);
		});

		it("has level number of 1's in it.", function () {
			var countTiles = 0;
			gm.map.forEach(function(item){
				if(item == 1)
					countTiles++;
			});
			expect(countTiles).toBe(level);
		});
	});

	describe('Method: touchTile().', function () {
		var gm = new GameMap();
		gm.map = [];
		gm.row = 10; gm.col = 12;
		var somePosX = 4, somePosY = 2;
		var idx = gm.getIdx(somePosX, somePosY);
		gm.map[idx] = enumTile.goodOne;

		it("can modify a map-positon by calling touchTile", function () {
			var tileStatusBefore = gm.touchTile(somePosX, somePosY);
			expect(tileStatusBefore).toBe(enumTile.goodOne);
			var tileStatusAfter = gm.map[idx];
			expect(tileStatusAfter).toBe(enumTile.used);
		});
	});
});