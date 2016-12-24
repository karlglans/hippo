'use strict';

var GameMap = require('./../../../../main/games-src/games/game2/gameMap.js').GameMap;
var GameRound = require('./../../../../main/games-src/games/game2/round.js').GameRound;
var enumTile = require('./../../../../main/games-src/games/game2/gameMap.js').enumTile;

describe('GameRound:', function () {
	describe('Constructor().', function () {
		it('can make new round', function () {
			var someLevel = 5;
			var gameMapStub = {getMostFrequentColor : function() {return 0;},
				moreThenOneColorLeft : function() {return true;}} 
			var instance = new GameRound(someLevel, gameMapStub);
			expect(instance).to.exist;
			expect(instance.level).to.equal(someLevel);
		});
	});

	// xdescribe('calcNextTileType().', function () {
	// 	xit('will select a green over red, when last picked was green', function () {
	// 		var gameMapMock = {
	// 			getMostFrequentColor : function() {return enumTile.greenOne;},
	// 			moreThenOneColorLeft : function() {return true;}
	// 		} 
	// 		var gameRound = Object.create(GameRound.prototype);
	// 		gameRound.gameOver = function() {return false;}
	// 		gameRound.gameMap = gameMapMock;
	// 		gameRound.nextTileType = enumTile.greenOne;
	// 		expect(gameRound.calcNextTileType()).to.equal(enumTile.redOne);
	// 	});

	// 	xit('it should give badOne if there is no tiles left to press', function () {
	// 		var gameMapMock = {
	// 			getMostFrequentColor : function() {return enumTile.badOne;},
	// 			moreThenOneColorLeft : function() {return false;}
	// 		} 
	// 		var gameRound = Object.create(GameRound.prototype);
	// 		gameRound.gameMap = gameMapMock;
	// 		gameRound.nextTileType = enumTile.greenOne;
	// 		expect(gameRound.calcNextTileType()).to.equal(enumTile.badOne);
	// 	});


	// });


	
});