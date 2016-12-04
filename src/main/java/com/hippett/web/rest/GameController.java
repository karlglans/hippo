package com.hippett.web.rest;

import java.net.URISyntaxException;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.inject.Inject;
import javax.validation.Valid;

import org.apache.commons.lang3.mutable.MutableInt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import com.hippett.domain.PlayerGameStats;
import com.hippett.service.GameService;
import com.hippett.service.GameService.RegisterResultsRet;
import com.hippett.web.rest.vm.GameResultsVM;

@RestController
@RequestMapping("/api/v1/game")
public class GameController {
    private final Logger log = LoggerFactory.getLogger(GameController.class);

    @Inject
	private GameService gameService;
    
    @PostMapping("/start/{gameId}")
    public Map<String, String> startGame(@PathVariable Integer gameId) throws URISyntaxException {
    	int key = gameService.registerStart(gameId);
    	//int code = gameService.generateGameToken(gameId, pgs.getnGamesPlayed());
    	Map<String, String> json = new LinkedHashMap<String, String>();
    	json.put("key", "" + key);
    	return json;
    }
    
    @PostMapping("/register/{gameId}")
    public Map<String, String> registerGame(@PathVariable Integer gameId, @Valid @RequestBody GameResultsVM payload) throws URISyntaxException {
    	RegisterResultsRet ret = gameService.registerResults(gameId, payload.getEndLevel(), payload.getScore(), payload.getKey());
    	Map<String, String> json = new LinkedHashMap<String, String>();
    	json.put("rating", Integer.toString(ret.rating));
    	json.put("games", Integer.toString(ret.nGamesPlayed));
    	return json;
    }
}

