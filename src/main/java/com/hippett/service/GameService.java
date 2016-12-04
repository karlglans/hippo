package com.hippett.service;
import java.util.List;
import java.util.Optional;

import javax.inject.Inject;

import org.apache.commons.lang3.mutable.MutableInt;
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
	
	public int modifyStats(PlayerGameStats stats, int endlLevel, int score) {
		stats.setScore(1);
		stats.setRating(1500);
		return stats.getRating();
	}
	
	/**
	 *	This method will generate a key for a game based on some parameters. This way the key don't have be be stored.
	 */
	public static int generateGameToken(int gameID, int nGames) {
		return gameID + nGames;
	}
	
	public boolean validateGameToken(int gameID, int nGames, int keyFromClient) {
		int gameKey = generateGameToken(gameID, nGames); // generate the same key we sent when game was started
		return gameKey * (gameID + 2) == keyFromClient; // the operation on the left side should have also been done on the client
	}
	
	/**
     * Will affect database. Called after a game has been started. If that game is already started then rating will be decreased.
     */
	public int registerStart(long gameID) {
		List<PlayerGameStats> gameStatsList = pgsRepo.findByPlayerIsCurrentUserAndGameId(gameID); 
		if(gameStatsList == null || gameStatsList.isEmpty()) {
			throw new IllegalArgumentException("No stats for that gameId ");
		}
		PlayerGameStats pgs = gameStatsList.get(0); // there should only be one item
		int nGamesPlayed = pgs.incGamesPlayed();
		if(pgs.isStarted()) {
			this.punishRating(pgs);
		}
		pgs.setStarted(true);
		pgsRepo.save(pgs);
		int key = this.generateGameToken((int)gameID, nGamesPlayed);
		return key;
	}
	
	public enum Status {
	    KEY_ERROR,
	    GAMESTATUS_ERROR,
	    OK
	 }
	
	public class RegisterResultsRet {
		public int rating;
		public int nGamesPlayed;
		public Status status;
		RegisterResultsRet(int rating, int nGamesPlayed, Status status) {
			this.rating = rating;
			this.nGamesPlayed = nGamesPlayed;
			this.status = status;
		}
	}
	
	/**
     * Will affect database. Called after a game has been ended.
     */
	public RegisterResultsRet registerResults(long gameID, int endLevel, int score, int key){
		List<PlayerGameStats> gameStatsList = pgsRepo.findByPlayerIsCurrentUserAndGameId(gameID);
		if(gameStatsList == null || gameStatsList.isEmpty()) {
			throw new IllegalArgumentException("No stats for that gameId ");
		}
		PlayerGameStats pgs = gameStatsList.get(0); // there should only be one item
		if( this.validateGameToken((int) gameID, pgs.getnGamesPlayed(), key) != true)
			return new RegisterResultsRet(0, 0, Status.KEY_ERROR);
		if(pgs.isStarted() == false)
			return new RegisterResultsRet(0, 0, Status.GAMESTATUS_ERROR);
		pgs.setStarted(false);
		this.modifyStats(pgs, endLevel, score);
		pgsRepo.save(pgs);
		return new RegisterResultsRet(pgs.getRating(), pgs.getnGamesPlayed(), Status.OK);
	}
	
//	public boolean registerResults(long gameID, int endLevel, int score, int key, MutableInt rating, MutableInt nGamesPlayed){
//		List<PlayerGameStats> gameStatsList = pgsRepo.findByPlayerIsCurrentUserAndGameId(gameID);
//		if(gameStatsList == null || gameStatsList.isEmpty()) {
//			throw new IllegalArgumentException("No stats for that gameId ");
//		}
//		PlayerGameStats pgs = gameStatsList.get(0); // there should only be one item
//		if( this.validateGameToken((int) gameID, pgs.getnGamesPlayed(), key) != true){
//			return false;
//		}	
//		pgs.setStarted(false);
//		this.modifyStats(pgs, endLevel, score);
//		pgsRepo.save(pgs);
//		rating.setValue(pgs.getRating());
//		nGamesPlayed.setValue(pgs.getnGamesPlayed());
//		return true;
//	}
}