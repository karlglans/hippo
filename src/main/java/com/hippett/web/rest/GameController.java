package com.hippett.web.rest;

import java.net.URISyntaxException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hippett.service.GameService;
import com.hippett.service.GameService.CurrResults;
import com.hippett.service.GameService.GameInfoForUser;
import com.hippett.service.GameService.RegisterResultsRet;
import com.hippett.service.GameService.Status;
import com.hippett.web.rest.vm.GameResultsVM;
import com.hippett.web.rest.vm.GameStatsVM;

@RestController
@RequestMapping("/api/v1/game")
public class GameController {
    private final Logger log = LoggerFactory.getLogger(GameController.class);

    @Inject
	private GameService gameService; 
    
    @PostMapping("/start/{gameId}") // fix: did return 500 with wrong gameId
    public ResponseEntity<Map<String, Integer>> startGame(@PathVariable Integer gameId) throws URISyntaxException {
    	int key = gameService.registerStart(gameId);
    	//int code = gameService.generateGameToken(gameId, pgs.getnGamesPlayed());
    	Map<String, Integer> json = new LinkedHashMap<String, Integer>();
    	json.put("key", key);
    	ResponseEntity<Map<String, Integer>> resp = new ResponseEntity<>(json, HttpStatus.OK);
    	return resp;
    }
    
    @PostMapping("/register/{gameId}") 
    public ResponseEntity<Map<String, Integer>> registerGame(@PathVariable Integer gameId, @Valid @RequestBody GameResultsVM payload) throws URISyntaxException {
    	log.info("REGISTER GAME: " + gameId + ", endLevel = " +  payload.getEndLevel());
    	RegisterResultsRet ret = gameService.registerResults(gameId, payload.getEndLevel(), payload.getScore(), payload.getKey());
    	
    	if (ret.status == Status.KEY_ERROR || ret.status == Status.GAMESTATUS_ERROR) {
    		return new ResponseEntity<>(null, HttpStatus.FORBIDDEN);
    	}
    	
    	Map<String, Integer> json = new LinkedHashMap<String, Integer>();
    	json.put("rating", ret.rating);
    	json.put("played", ret.nGamesPlayed);
    	ResponseEntity<Map<String, Integer>> resp = new ResponseEntity<>(json, HttpStatus.OK);
    	return resp;
    }

	@GetMapping("/stats/{gameId}")
    public ResponseEntity<GameStatsVM> getGameStats(@PathVariable Integer gameId) throws URISyntaxException {

    	CurrResults curResults = gameService.getResults(gameId);
    	GameStatsVM gsVM = new GameStatsVM("Rutor", gameId, curResults.rating, curResults.nGamesPlayed, curResults.endLevel);
    	
    	// var gamelist = {gamelist: [{gameid: 1, title : "game 1", rating : 1602, played : 101, level:4, score: 22}] }
    	ResponseEntity<GameStatsVM> resp = new ResponseEntity<>(gsVM, HttpStatus.OK);
    	return resp;
    }
	
	@GetMapping("/list")
	public ResponseEntity<?> getGameList() throws URISyntaxException {
		//String list = "[{gameid: 1, title:rutor}]";
		List<GameInfoForUser> userGameList = gameService.getGameListForUser();
    	ResponseEntity<?> resp = new ResponseEntity<>(userGameList, HttpStatus.OK);
    	return resp;
    }
}

