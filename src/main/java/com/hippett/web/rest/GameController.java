package com.hippett.web.rest;

import java.net.URISyntaxException;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import com.hippett.service.GameService;

@RestController
@RequestMapping("/api/v1/game")
public class GameController {
    private final Logger log = LoggerFactory.getLogger(GameController.class);

    @Inject
	private GameService gameService;

    
    @PostMapping("/start/{gameId}")
    public void startGame(@PathVariable Integer gameId) throws URISyntaxException {

    	log.info("/api/v1/game/start 1" + gameId);
    	
    	gameService.registerStart(gameId);
    	
    	log.info("/api/v1/game/start " + gameId);
    }
}