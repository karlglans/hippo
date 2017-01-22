package com.hippett.service;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.hippett.domain.Game;
import com.hippett.domain.PlayerGameStats;
import com.hippett.domain.User;
import com.hippett.repository.GameRepository;
import com.hippett.repository.PlayerGameStatsRepository;
import com.hippett.repository.UserRepository;
import com.hippett.security.SecurityUtils;

@Service
public class GameService {
	@Inject
	private PlayerGameStatsRepository pgsRepo;
	
	@Inject
	private GameRepository gameRepo;
	
	@Inject
	private UserRepository userRepo;
	
	private final Logger log = LoggerFactory.getLogger(GameService.class);
	
	GameService(PlayerGameStatsRepository pgsRepo, GameRepository gameRepo, UserRepository userRepo){
		this.pgsRepo = pgsRepo;
		this.gameRepo = gameRepo;
		this.userRepo = userRepo;
	}
	
	public void punishRating(PlayerGameStats stats){
		stats.setScore(1);
		Integer level = stats.getStartLevel() - 1;
		if(level < 3)
			level = 3; // this number should vary from game to game
		stats.setStartLevel(level);
	}
	
	public int modifyStats(PlayerGameStats stats, int endlLevel, int score) {
		stats.setStartLevel(endlLevel);
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
			return new RegisterResultsRet(99, 99, Status.KEY_ERROR);
		if(pgs.isStarted() == false)
			return new RegisterResultsRet(88, 88, Status.GAMESTATUS_ERROR);
		pgs.setStarted(false);
		this.modifyStats(pgs, endLevel, score);
		pgsRepo.save(pgs);
		return new RegisterResultsRet(pgs.getRating(), pgs.getnGamesPlayed(), Status.OK);
	}
	
	public class CurrResults {
		public int rating;
		public int nGamesPlayed;
		public int endLevel;
		public Status status;
		CurrResults(int rating, int nGamesPlayed, Status status, int endLevel) {
			this.rating = rating;
			this.nGamesPlayed = nGamesPlayed;
			this.status = status;
			this.endLevel = endLevel;
		}
	}
	
	/**
	 * Method makes a clean PlayerGameStats entry for a game. 
	 */
	public PlayerGameStats makePlayerGameStats(long gameID) {
		Game game = gameRepo.findOneById(gameID);
		if(game == null)
			throw new IllegalArgumentException("No game for that gameId ");
		String login = SecurityUtils.getCurrentUserLogin();
		Optional<User> user = userRepo.findOneByLogin(login);
		if(!user.isPresent()){
			throw new IllegalArgumentException("cant find user " + login);
		}
		PlayerGameStats cleanGameStats = new PlayerGameStats(game, user.get());
		pgsRepo.save(cleanGameStats);
		return cleanGameStats;
	}
	
	public CurrResults getResults(long gameID){
		List<PlayerGameStats> gameStatsList = pgsRepo.findByPlayerIsCurrentUserAndGameId(gameID);
		if(gameStatsList == null || gameStatsList.isEmpty()) {
			gameStatsList = new ArrayList<PlayerGameStats>();
			PlayerGameStats cleanStats = makePlayerGameStats(gameID);
			gameStatsList.add(cleanStats);
		}
		PlayerGameStats pgs = gameStatsList.get(0); // there should only be one item
		return new CurrResults(pgs.getRating(), pgs.getnGamesPlayed(), Status.OK, pgs.getStartLevel());
	}
	
	public class GameInfoForUser {
		public GameInfoForUser(int rating, int nGamesPlayed, int endLevel, String gameTitle, int gameId) {
			super();
			this.rating = rating;
			this.nGamesPlayed = nGamesPlayed;
			this.endLevel = endLevel;
			this.gameTitle = gameTitle;
			this.gameId = gameId;
		}
		public int rating;
		public int nGamesPlayed;
		public int endLevel;
		public String gameTitle;
		public int gameId;
	}
	
	/**
	 * This method should produce a personal list of all games and game-data for the user. The list should include games the user have not played.
	 * @return
	 */
	public List<GameInfoForUser> getGameListForUser() {
		// add every game
		Map<Integer, GameInfoForUser> gameStatsToGameId = new HashMap<Integer, GameInfoForUser>();
		List<Game> games = gameRepo.findAll();
		for (int i = 0; i < games.size(); i++) {
			Game game = games.get(i);
			Integer id = game.getId().intValue();
			GameInfoForUser gifu = new GameInfoForUser(0, 0, 0, game.getTitle(), id);
			gameStatsToGameId.put(id, gifu);
		}
		// add every rated game for this user. Mapped to same game id.
		List<PlayerGameStats> gameStatsList = null;
		try {
			gameStatsList = pgsRepo.findByPlayerIsCurrentUser();
		}
		catch (Exception e) {
			gameStatsList = null;
		}
		if(gameStatsList != null) {
			for (int i = 0; i < gameStatsList.size(); i++) {
				PlayerGameStats pgs = gameStatsList.get(i);
				Game game = pgs.getGame();
				Integer id = game.getId().intValue();
				GameInfoForUser gifu = new GameInfoForUser(pgs.getRating(), pgs.getnGamesPlayed(), pgs.getStartLevel(), game.getTitle(), id);
				gameStatsToGameId.put(id, gifu);
			}
		}
		// add results from above to a list for output.
		List<GameInfoForUser> currResults = new ArrayList<GameInfoForUser>();
		Iterator it = gameStatsToGameId.entrySet().iterator();
	    while (it.hasNext()) {
	        Map.Entry pair = (Map.Entry)it.next();
	        GameInfoForUser gameInfoForUser = (GameInfoForUser) pair.getValue();
	        currResults.add(gameInfoForUser);
	        it.remove(); // avoids a ConcurrentModificationException
	    }

		return currResults;
	}

}