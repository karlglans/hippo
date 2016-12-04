package com.hippett.service;

import org.apache.commons.lang3.mutable.MutableInt;
import org.junit.*;
import org.junit.runner.*;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.context.*;
import org.springframework.test.context.junit4.*;
import com.hippett.HippoApp;
import com.hippett.domain.PlayerGameStats;
import com.hippett.repository.PlayerGameStatsRepository;
import com.hippett.service.GameService.RegisterResultsRet;
import com.hippett.service.GameService.Status;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;
import java.util.ArrayList;
import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = HippoApp.class)
public class GameServiceTest {

	@Mock
    private PlayerGameStatsRepository pgsRepository;

    @Before
    public void setup() {
    	pgsRepository = Mockito.mock(PlayerGameStatsRepository.class);
    }

    @Test
    public void TestWillCallPunishIfStartedAgain() {
    	int someNumberOfPlayedGames = 13;
    	// Prepair DB mock:
    	GameService gameService = Mockito.spy(new GameService(pgsRepository));
    	PlayerGameStats somePlayerGameStats =  new PlayerGameStats();
    		somePlayerGameStats.setStarted(true); //important. last game was started
    		somePlayerGameStats.rating(1600);
    		somePlayerGameStats.setnGamesPlayed(someNumberOfPlayedGames);
    	List<PlayerGameStats> gameStats = new ArrayList<PlayerGameStats>();
    	gameStats.add(somePlayerGameStats);
    	// game results from client:
    	Long gameIdOne = 1L;
    	given(this.pgsRepository.findByPlayerIsCurrentUserAndGameId(gameIdOne)).willReturn(gameStats);
    	// Exercise
    	int key = gameService.registerStart(gameIdOne);
    	// Verify
    	Mockito.verify(gameService, Mockito.times(1)).punishRating(somePlayerGameStats);
    	Mockito.verify(pgsRepository, Mockito.times(1)).save(somePlayerGameStats);
    	//Mockito.verify(gameService, Mockito.times(1)).generateGameToken((int)(long)gameIdOne, (someNumberOfPlayedGames + 1));
    }
    
    @Test
    public void TestRegisterResultsCorrectly() {
    	int someNumberOfPlayedGames = 13; 
    	// Prepair DB mock
    	GameService gameService = Mockito.spy(new GameService(pgsRepository));
    	PlayerGameStats somePlayerGameStats =  new PlayerGameStats();
    		somePlayerGameStats.nGamesPlayed(someNumberOfPlayedGames);
    		somePlayerGameStats.setStarted(true); //important. game has to be flagged as started
    		somePlayerGameStats.rating(1600);
    	List<PlayerGameStats> gameStats = new ArrayList<PlayerGameStats>();
        gameStats.add(somePlayerGameStats);
        // game results from client:
        Long gameIdOne = 1L;
        int endLevel = 10, someScore = 112, someCorrectKey = 222;
        given(this.pgsRepository.findByPlayerIsCurrentUserAndGameId(gameIdOne)).willReturn(gameStats);
        given(gameService.validateGameToken((int)(long) gameIdOne, someNumberOfPlayedGames, someCorrectKey)).willReturn(true);
    	// Exercise
        RegisterResultsRet ret = gameService.registerResults(gameIdOne, endLevel, someScore, someCorrectKey);
    	// Verify
    	Mockito.verify(gameService, Mockito.times(1)).modifyStats(somePlayerGameStats, endLevel, someScore);
    	Mockito.verify(pgsRepository, Mockito.times(1)).save(somePlayerGameStats);
    	assertThat(ret.status).isEqualTo(Status.OK);
        assertThat(somePlayerGameStats.isStarted()).isEqualTo(false);
        assertThat(ret.rating).isEqualTo(somePlayerGameStats.getRating());
        assertThat(ret.nGamesPlayed).isEqualTo(someNumberOfPlayedGames);
    }
    
    @Test
    public void TestRegisterResultsWillDetectFalseKey() {
    	int someNumberOfPlayedGames = 13; 
    	// Prepair DB mock
    	GameService gameService = Mockito.spy(new GameService(pgsRepository));
    	PlayerGameStats somePlayerGameStats =  new PlayerGameStats();
    		somePlayerGameStats.nGamesPlayed(someNumberOfPlayedGames);
    		somePlayerGameStats.setStarted(true); //important. game has to be flagged as started
    		somePlayerGameStats.rating(1600);
    	List<PlayerGameStats> gameStats = new ArrayList<PlayerGameStats>();
        gameStats.add(somePlayerGameStats);
        // game results from client:
        Long gameIdOne = 1L;
        int endLevel = 10, someScore = 112, someFalseKey = 23;
        given(this.pgsRepository.findByPlayerIsCurrentUserAndGameId(gameIdOne)).willReturn(gameStats);
        given(gameService.validateGameToken((int)(long) gameIdOne, someNumberOfPlayedGames, someFalseKey)).willReturn(false);
    	// Exercise
        RegisterResultsRet ret = gameService.registerResults(gameIdOne, endLevel, someScore, someFalseKey);
    	// Verify
    	Mockito.verify(pgsRepository, Mockito.times(0)).save(somePlayerGameStats);
    	assertThat(ret.status).isEqualTo(Status.KEY_ERROR);
        assertThat(somePlayerGameStats.isStarted()).isEqualTo(true); // still put as started
    }
    
    /**
     * This is ment to prevent same game-key from being used twice
     */
    @Test
    public void RegisterResultsWillRetrunGAMESTATUS_ERROR_IfCalledEfterStoped() {
    	int someNumberOfPlayedGames = 13; 
    	// Prepair DB mock
    	GameService gameService = Mockito.spy(new GameService(pgsRepository));
    	PlayerGameStats somePlayerGameStats =  new PlayerGameStats();
    		somePlayerGameStats.nGamesPlayed(someNumberOfPlayedGames);
    		somePlayerGameStats.setStarted(false); //important. game can't be flagged as started
    		somePlayerGameStats.rating(1600);
    	List<PlayerGameStats> gameStats = new ArrayList<PlayerGameStats>();
        gameStats.add(somePlayerGameStats);
        // game results from client:
        Long gameIdOne = 1L;
        int endLevel = 10, someScore = 112, someCorrectKey = 23;
        given(this.pgsRepository.findByPlayerIsCurrentUserAndGameId(gameIdOne)).willReturn(gameStats);
        given(gameService.validateGameToken((int)(long) gameIdOne, someNumberOfPlayedGames, someCorrectKey)).willReturn(true);
    	// Exercise
        RegisterResultsRet ret = gameService.registerResults(gameIdOne, endLevel, someScore, someCorrectKey);
    	// Verify
    	Mockito.verify(pgsRepository, Mockito.times(0)).save(somePlayerGameStats);
    	assertThat(ret.status).isEqualTo(Status.GAMESTATUS_ERROR);
        assertThat(somePlayerGameStats.isStarted()).isEqualTo(false);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testCreateSocialUserShouldThrowExceptionIfConnectionIsNull() {
    	Long illigalGameId = 1000L;
    	GameService gameService = new GameService(pgsRepository);
        // Exercise
    	gameService.registerStart(illigalGameId);
    }

}