package com.hippett.service;

import org.junit.*;
import org.junit.runner.*;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.*;
import org.springframework.boot.test.mock.mockito.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.social.connect.ConnectionRepository;
import org.springframework.social.connect.UsersConnectionRepository;
import org.springframework.test.context.junit4.*;
import org.springframework.test.util.ReflectionTestUtils;

import com.hippett.HippoApp;
import com.hippett.domain.PlayerGameStats;
import com.hippett.repository.AuthorityRepository;
import com.hippett.repository.PlayerGameStatsRepository;
import com.hippett.repository.UserRepository;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

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
    	GameService gameService = Mockito.spy(new GameService(pgsRepository));
    	PlayerGameStats somePlayerGameStats =  new PlayerGameStats();
    		somePlayerGameStats.setStarted(true); //important. last game was started
    		somePlayerGameStats.rating(1600);
    	List<PlayerGameStats> gameStats = new ArrayList<PlayerGameStats>();
    	gameStats.add(somePlayerGameStats);
    	Long someGameId = 1L;
    	given(this.pgsRepository.findByPlayerIsCurrentUserAndGameId(someGameId)).willReturn(gameStats);
    	// Exercise
    	boolean result = gameService.registerStart(someGameId);
    	Mockito.verify(gameService, Mockito.times(1)).punishRating(somePlayerGameStats);
        assertThat(result).isEqualTo(true);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testCreateSocialUserShouldThrowExceptionIfConnectionIsNull() {
    	Long illigalGameId = 1000L;
    	GameService gameService = new GameService(pgsRepository);
        // Exercise
    	gameService.registerStart(illigalGameId);
    }

}