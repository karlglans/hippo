'use strict';

var CtrlModule = require('./controller.js');
var viewModule = require('./view.js');
var HostConnector = require('../../common/HostConnector.js'); //require('../common/HostConnector.js');
var hostConnector, view, ctrl;

function startGameScript(level) {
	console.log('startGameScript(), level: ', level);
	ctrl.createNewGame(view, level);
}

window.onload = function(){
	var gameId = 2;
	hostConnector = new HostConnector(gameId, startGameScript, window);
	ctrl = new CtrlModule.Controller(hostConnector);
	view = new viewModule.View(ctrl);
	view.setup('gamescreen', 550, 550);
}