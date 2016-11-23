package com.hippett.web.rest;

import com.hippett.HippoApp;

import com.hippett.domain.PlayerGameStats;
import com.hippett.repository.PlayerGameStatsRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.hamcrest.Matchers.hasItem;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the PlayerGameStatsResource REST controller.
 *
 * @see PlayerGameStatsResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = HippoApp.class)
public class PlayerGameStatsResourceIntTest {

    private static final Integer DEFAULT_N_GAMES_PLAYED = 1;
    private static final Integer UPDATED_N_GAMES_PLAYED = 2;

    private static final Integer DEFAULT_SCORE = 1;
    private static final Integer UPDATED_SCORE = 2;

    private static final Integer DEFAULT_RATING = 1;
    private static final Integer UPDATED_RATING = 2;

    private static final Integer DEFAULT_START_LEVEL = 1;
    private static final Integer UPDATED_START_LEVEL = 2;

    private static final Boolean DEFAULT_STARTED = false;
    private static final Boolean UPDATED_STARTED = true;

    @Inject
    private PlayerGameStatsRepository playerGameStatsRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restPlayerGameStatsMockMvc;

    private PlayerGameStats playerGameStats;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        PlayerGameStatsResource playerGameStatsResource = new PlayerGameStatsResource();
        ReflectionTestUtils.setField(playerGameStatsResource, "playerGameStatsRepository", playerGameStatsRepository);
        this.restPlayerGameStatsMockMvc = MockMvcBuilders.standaloneSetup(playerGameStatsResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PlayerGameStats createEntity(EntityManager em) {
        PlayerGameStats playerGameStats = new PlayerGameStats()
                .nGamesPlayed(DEFAULT_N_GAMES_PLAYED)
                .score(DEFAULT_SCORE)
                .rating(DEFAULT_RATING)
                .startLevel(DEFAULT_START_LEVEL)
                .started(DEFAULT_STARTED);
        return playerGameStats;
    }

    @Before
    public void initTest() {
        playerGameStats = createEntity(em);
    }

    @Test
    @Transactional
    public void createPlayerGameStats() throws Exception {
        int databaseSizeBeforeCreate = playerGameStatsRepository.findAll().size();

        // Create the PlayerGameStats

        restPlayerGameStatsMockMvc.perform(post("/api/player-game-stats")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(playerGameStats)))
                .andExpect(status().isCreated());

        // Validate the PlayerGameStats in the database
        List<PlayerGameStats> playerGameStats = playerGameStatsRepository.findAll();
        assertThat(playerGameStats).hasSize(databaseSizeBeforeCreate + 1);
        PlayerGameStats testPlayerGameStats = playerGameStats.get(playerGameStats.size() - 1);
        assertThat(testPlayerGameStats.getnGamesPlayed()).isEqualTo(DEFAULT_N_GAMES_PLAYED);
        assertThat(testPlayerGameStats.getScore()).isEqualTo(DEFAULT_SCORE);
        assertThat(testPlayerGameStats.getRating()).isEqualTo(DEFAULT_RATING);
        assertThat(testPlayerGameStats.getStartLevel()).isEqualTo(DEFAULT_START_LEVEL);
        assertThat(testPlayerGameStats.isStarted()).isEqualTo(DEFAULT_STARTED);
    }

    @Test
    @Transactional
    public void getAllPlayerGameStats() throws Exception {
        // Initialize the database
        playerGameStatsRepository.saveAndFlush(playerGameStats);

        // Get all the playerGameStats
        restPlayerGameStatsMockMvc.perform(get("/api/player-game-stats?sort=id,desc"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.[*].id").value(hasItem(playerGameStats.getId().intValue())))
                .andExpect(jsonPath("$.[*].nGamesPlayed").value(hasItem(DEFAULT_N_GAMES_PLAYED)))
                .andExpect(jsonPath("$.[*].score").value(hasItem(DEFAULT_SCORE)))
                .andExpect(jsonPath("$.[*].rating").value(hasItem(DEFAULT_RATING)))
                .andExpect(jsonPath("$.[*].startLevel").value(hasItem(DEFAULT_START_LEVEL)))
                .andExpect(jsonPath("$.[*].started").value(hasItem(DEFAULT_STARTED.booleanValue())));
    }

    @Test
    @Transactional
    public void getPlayerGameStats() throws Exception {
        // Initialize the database
        playerGameStatsRepository.saveAndFlush(playerGameStats);

        // Get the playerGameStats
        restPlayerGameStatsMockMvc.perform(get("/api/player-game-stats/{id}", playerGameStats.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(playerGameStats.getId().intValue()))
            .andExpect(jsonPath("$.nGamesPlayed").value(DEFAULT_N_GAMES_PLAYED))
            .andExpect(jsonPath("$.score").value(DEFAULT_SCORE))
            .andExpect(jsonPath("$.rating").value(DEFAULT_RATING))
            .andExpect(jsonPath("$.startLevel").value(DEFAULT_START_LEVEL))
            .andExpect(jsonPath("$.started").value(DEFAULT_STARTED.booleanValue()));
    }

    @Test
    @Transactional
    public void getNonExistingPlayerGameStats() throws Exception {
        // Get the playerGameStats
        restPlayerGameStatsMockMvc.perform(get("/api/player-game-stats/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updatePlayerGameStats() throws Exception {
        // Initialize the database
        playerGameStatsRepository.saveAndFlush(playerGameStats);
        int databaseSizeBeforeUpdate = playerGameStatsRepository.findAll().size();

        // Update the playerGameStats
        PlayerGameStats updatedPlayerGameStats = playerGameStatsRepository.findOne(playerGameStats.getId());
        updatedPlayerGameStats
                .nGamesPlayed(UPDATED_N_GAMES_PLAYED)
                .score(UPDATED_SCORE)
                .rating(UPDATED_RATING)
                .startLevel(UPDATED_START_LEVEL)
                .started(UPDATED_STARTED);

        restPlayerGameStatsMockMvc.perform(put("/api/player-game-stats")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(updatedPlayerGameStats)))
                .andExpect(status().isOk());

        // Validate the PlayerGameStats in the database
        List<PlayerGameStats> playerGameStats = playerGameStatsRepository.findAll();
        assertThat(playerGameStats).hasSize(databaseSizeBeforeUpdate);
        PlayerGameStats testPlayerGameStats = playerGameStats.get(playerGameStats.size() - 1);
        assertThat(testPlayerGameStats.getnGamesPlayed()).isEqualTo(UPDATED_N_GAMES_PLAYED);
        assertThat(testPlayerGameStats.getScore()).isEqualTo(UPDATED_SCORE);
        assertThat(testPlayerGameStats.getRating()).isEqualTo(UPDATED_RATING);
        assertThat(testPlayerGameStats.getStartLevel()).isEqualTo(UPDATED_START_LEVEL);
        assertThat(testPlayerGameStats.isStarted()).isEqualTo(UPDATED_STARTED);
    }

    @Test
    @Transactional
    public void deletePlayerGameStats() throws Exception {
        // Initialize the database
        playerGameStatsRepository.saveAndFlush(playerGameStats);
        int databaseSizeBeforeDelete = playerGameStatsRepository.findAll().size();

        // Get the playerGameStats
        restPlayerGameStatsMockMvc.perform(delete("/api/player-game-stats/{id}", playerGameStats.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<PlayerGameStats> playerGameStats = playerGameStatsRepository.findAll();
        assertThat(playerGameStats).hasSize(databaseSizeBeforeDelete - 1);
    }
}
