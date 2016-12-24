'use strict';

var GameMapModule = require('./../../../../main/games-src/games/game2/gameMap.js');

var GameMap = GameMapModule.GameMap;
var enumTileDisplay = GameMapModule.enumTileDisplay;
var enumTile = GameMapModule.enumTile;
var enumTileStatus = GameMapModule.enumTileStatus;


describe('GameMap:', function () {

	describe('Constructor.', function () {
		var dencity = 0.7, level = 5;

		it('can make a new game gameMap', function () {	
			var instance = new GameMap(dencity, level);
			expect(instance).to.exist;
		});

		it('can use methods inherited from QuadMap', function () {
			var instance = new GameMap(dencity, level);
			instance.row = 11;
			instance.col = 12;
			var dim = instance.getDim();
			expect(dim).to.exist;
			expect(dim.row).to.exist;
			expect(dim.col).to.exist;
			expect(dim.row).to.equal(instance.row);
			expect(dim.col).to.equal(instance.col);
		});
	});

	describe('getMostFrequentColor()', function () {
		var gameMap = Object.create(GameMap.prototype);
		// shorter names:
		//var g = enumTile.greenOne, r = enumTile.redOne, bd = enumTile.badOne;
		gameMap.row = gameMap.col = 3; // 3 x 3

		it('can find most freq color when just 2 colors', function () {
			gameMap.map = 			[ 1, 1, 1,   1, 1, 1,   2, 2, 2 ]; // colors, 3 x 3
			gameMap.tileStatus = 	[ 0, 0, 0,   0, 0, 0,   0, 0, 0];
			var mostFrequentColor = gameMap.getMostFrequentColor()
			expect(mostFrequentColor).to.equal(1);
		});

		it('can ignore color 0', function () {
			gameMap.map = 			[ 0, 0, 0,   2, 2, 2,   1, 0, 0 ]; // colors, 3 x 3
			gameMap.tileStatus = 	[ 0, 0, 0,   0, 0, 0,   0, 0, 0 ]; // all tiles should be ignored
			var mostFrequentColor = gameMap.getMostFrequentColor()
			expect(mostFrequentColor).to.equal(2);
		});

		it('can ignore used tiles', function () {
			gameMap.map = 			[ 1, 1, 1,   1, 1, 1,   2, 2, 2 ]; // colors, 3 x 3
			gameMap.tileStatus = 	[ 1, 1, 2,   2, 2, 0,   0, 0, 0 ]; // 1 and 2 means ignore 
			var mostFrequentColor = gameMap.getMostFrequentColor()
			expect(mostFrequentColor).to.equal(2);
		});

		it('can selects the lower color idx when 2 colors are equal', function () {
			gameMap.map = 			[ 1, 1, 1,   2, 2, 2,   1, 1, 1 ]; // colors, 3 x 3
			gameMap.tileStatus = 	[ 1, 1, 1,   0, 0, 0,   0, 0, 0 ];
			var mostFrequentColor = gameMap.getMostFrequentColor()
			expect(mostFrequentColor).to.equal(1);
		});

		it('will return 0 if no colors left', function () {
			gameMap.map = 			[ 1, 1, 1,   2, 2, 2,   1, 1, 1 ]; // colors, 3 x 3
			gameMap.tileStatus = 	[ 1, 1, 1,   1, 1, 2,   2, 2, 2 ]; // all tiles should be ignored
			var mostFrequentColor = gameMap.getMostFrequentColor()
			expect(mostFrequentColor).to.equal(0);
		});
	});

	describe('sortTilesByFequency()', function () {

		var gameMap = Object.create(GameMap.prototype);
		gameMap.row = gameMap.col = 3; // 3 x 3

		it('can return an array sorthed by color with highest freqency', function () {
			gameMap.map 		= [ 1, 2, 2,   2, 0, 0,  0, 0, 0 ]; // 3 x 3
			gameMap.tileStatus	= [ 0, 0, 0,   0, 0, 0,  0, 0, 0 ]; // all tiles is clickable
			var result = gameMap.sortTilesByFequency();
			// most frequent color:
			expect( result[0].color ).to.equal(2); // most frequent
			expect( result[1].color ).to.equal(1); // 2nd most frequent
			expect( result[0].count ).to.equal(3);
			expect( result[1].count ).to.equal(1);
		});

		it('can will sort arry by color if feqency is equal', function () {
			gameMap.map 		= [ 2, 2, 1,   1, 0, 0,  0, 0, 0 ]; // 3 x 3
			gameMap.tileStatus	= [ 0, 0, 0,   0, 0, 0,  0, 0, 0 ]; // all tiles is clickable
			var result = gameMap.sortTilesByFequency();
			// most frequent color:
			expect( result[0].color ).to.equal(1);
			expect( result[1].color ).to.equal(2);
			expect( result[0].count ).to.equal(2);
			expect( result[1].count ).to.equal(2);
		});
	});

	describe('createMapViewModel()', function () {
		var gameMap = Object.create(GameMap.prototype);
		gameMap.row = gameMap.col = 3; // 3 x 3
		gameMap.map 		= [ 2, 2, 1,   1, 0, 0,  0, 0, 0 ]; // 3 x 3
		gameMap.tileStatus	= [ 0, 0, 0,   0, 0, 0,  0, 0, 0 ]; // all tiles is clickable

		it('will return an object with same row- and col-value as the orginal map', function () {
			var mapViewModel = gameMap.createMapViewModel();
			expect( mapViewModel.row ).to.equal(gameMap.row);
			expect( mapViewModel.col ).to.equal(gameMap.col);
		});

		it('can convert colors to mapViewModel', function () {
			gameMap.map 		= [ 2, 1, 1,   2, 0, 0,  0, 0, 0 ]; // 3 x 3
			gameMap.tileStatus	= [ 0, 0, 0,   0, 0, 0,  0, 0, 0 ]; // all tiles is clickable
			var mapViewModel = gameMap.createMapViewModel();

			expect( mapViewModel.map[0] ).to.equal(enumTileDisplay.color2);
			expect( mapViewModel.map[1] ).to.equal(enumTileDisplay.color1);
			expect( mapViewModel.map[8] ).to.equal(enumTileDisplay.noColor); // last
		});
	});


	// describe('checkPos()', function () {
	// 	var gameMap = Object.create(GameMap.prototype);
	// 	gameMap.row = gameMap.col = 3; // 3 x 3
	// 	gameMap.map 		= [ 4, 2, 1,   1, 0, 0,  0, 0, 0 ]; // 3 x 3
	// 	gameMap.tileStatus	= [ 1, 0, 0,   0, 0, 0,  0, 0, 0 ];

	// 	it('will return an object describing that tile', function () {
	// 		var posInfo = gameMap.checkPos(0);
	// 		expect( posInfo.color ).to.equal(4);
	// 		expect( posInfo.status ).to.equal(1);
	// 	});
	// });

	describe('touchTile()', function () {
		var gameMap = Object.create(GameMap.prototype);
		var color1 = 1;
		gameMap.row = gameMap.col = 3; // 3 x 3
		gameMap.map 		= [ 4, 2, 1,   1, 0, 0,  0, 0, 0 ]; // 3 x 3
		gameMap.tileStatus	= [ 1, 0, 0,   0, 0, 0,  0, 0, 0 ]; // 

		it('can get a success result', function () {
			gameMap.map[1] = 2; // tile 1, color 2
			var tileInfo = gameMap.touchTile(1, 2); // trying to hit tile 2 with color 2
			expect( tileInfo.color ).to.equal(2);
			expect( tileInfo.status ).to.equal(enumTileStatus.correct);
			expect( tileInfo.viewColor ).to.equal(enumTileDisplay.color2);
		});

		it('can get a fail result', function () {
			gameMap.map[2] = color1; // tile 2, color 1
			var tileInfo = gameMap.touchTile(2, 5); // trying to hit tile 3 with color 5
			expect( tileInfo.color ).to.equal(color1);
			expect( tileInfo.status ).to.equal(enumTileStatus.mistake);
			expect( tileInfo.viewColor ).to.equal(enumTileDisplay.color1Error);
		});

		// it('will thow', function () {
		// 	gameMap.map[0] = color1; // tile 2, color 1
		// 	gameMap.tileStatus[0] = 1; // already touched
		// 	expect( gameMap.touchTile ).to.throw('tile already touched');
		// });


		
	});






	


	// describe('Method SetDim().', function () {
	// 	var someDencity = 0.5, level = 5;
	// 	var gameMap = new GameMap(someDencity, level);
	// 	gameMap.setDim(someDencity, level);

	// 	it('will set a value for row and col.', function () {
	// 		expect(gameMap.row > 1 && gameMap.col > 1).to.be.true;
	// 		expect(gameMap.row * gameMap.col * someDencity > level).to.be.true;
	// 	});
	// });

	// describe('Method: generateMap().', function () {
	// 	var someDencity = 0.5, level = 5;
	// 	var gm = new GameMap(someDencity, level);
	// 	var row = 5, col = 6, level = 3;
	// 	gm.generateMap(row, col, level);

	// 	it('has corrext size.', function () {
	// 		expect(gm.map.length).to.equal(row*col);
	// 	});

	// 	it("has the same number valid tils (red or green) as the level value", function () {
	// 		var countTiles = 0;
	// 		gm.map.forEach(function(item){
	// 			if(item == enumTile.greenOne || item == enumTile.redOne)
	// 				countTiles++;
	// 		});
	// 		expect(countTiles).to.equal(level);
	// 	});
	// });
});