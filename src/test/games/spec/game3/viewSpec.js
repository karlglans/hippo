'use strict';

var ViewModule = require('./../../../../main/games-src/games/game3/view.js');

var View = ViewModule.View;

describe('View:', function () {

	describe('Constructor.', function () {
		var level = 5;

		it('can make a new View', function () {	
			var instance = new View();
			expect(instance).to.exist;
		});
	});


	describe('dimMap. ', function () {

		var view = new View();

		it('can will make one row for 6', function () {
			// 6 -> : * * * * * *
			var num_of_tiles = 6;
			var mapDimensions = view.dimMap(num_of_tiles);
			expect(mapDimensions.row).to.equal(1);
		});

		it('can will make 2 rows for 7', function () {
			// 6 -> : * * * * * *
			var num_of_tiles = 7;
			var mapDimensions = view.dimMap(num_of_tiles);
			expect(mapDimensions.row).to.equal(2);
		});

		it('can will make 2 rows for 16', function () {
			// 16 -> : 	* * * * * *
			// 			* * * * * *
			// 			* * * * 
			var num_of_tiles = 16;
			var mapDimensions = view.dimMap(num_of_tiles);
			expect(mapDimensions.row).to.equal(3);
			expect(mapDimensions.col).to.equal(6);
		});

		it('can will make 2 rows for 26', function () {
			// 26 -> : 	* * * * * * *
			// 			* * * * * * *
			// 			* * * * * * *
			// 			* * * * *
			var num_of_tiles = 26;
			var mapDimensions = view.dimMap(num_of_tiles);
			expect(mapDimensions.row).to.equal(4);
			expect(mapDimensions.col).to.equal(7);
		});
	});

});