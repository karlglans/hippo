package com.hippett.service;
import java.util.List;
import java.util.Optional;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.hippett.domain.PlayerGameStats;
import com.hippett.repository.PlayerGameStatsRepository;

@Service
public class GameService {
	@Inject
	private PlayerGameStatsRepository pgsRepo;
	
	private final Logger log = LoggerFactory.getLogger(GameService.class);
	
	GameService(PlayerGameStatsRepository pgsRepo){
		this.pgsRepo = pgsRepo;
	}
	
	public void punishRating(PlayerGameStats stats){
		stats.setScore(1);
	}
	
	/**
     * Will affect database. If a game is already started then rating will be decreased.
     */
	public boolean registerStart(long gameID) {
		List<PlayerGameStats> gameStatsList = pgsRepo.findByPlayerIsCurrentUserAndGameId(gameID); 
		if(gameStatsList == null || gameStatsList.isEmpty()) {
			throw new IllegalArgumentException("No stats for that gameId ");
		}
		PlayerGameStats pgs = gameStatsList.get(0);
		if(pgs.isStarted()) {
			this.punishRating(pgs);
		}
		pgs.setStarted(true);
		return true;
	}
	
	public void registerResult() {
		
	}
}