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
	
	public void registerStart(long gameID) {
		//Game game = gameRepo.
		
		//Long aaa = gameID;
		
		//long ffff = 222;
		
		gameID = 1;
		
		//Optional<PlayerGameStats> gameStats = pgsRepo.findByPlayerIsCurrent();
		//List<PlayerGameStats> findByPlayerIsCurrentUser
		//List<PlayerGameStats> gameStats = pgsRepo.findByPlayerIsCurrentUser();
		List<PlayerGameStats> gameStats = pgsRepo.findByGameIdAndPlayerIsCurrentUser(gameID);
		
		gameID = 111;
		
		//int siiize = gameStats.size();
		
		
		//PlayerGameStats dddd = gameStats.get();
		
		if(gameStats == null) {
			log.info("!!! GameService::registerStart() gamestarts is null");
			return;
		}
	
	
		
		log.info("GameService::GameService() size = " +  gameStats.size());
	}
	
	public void registerResult() {
		
	}
}