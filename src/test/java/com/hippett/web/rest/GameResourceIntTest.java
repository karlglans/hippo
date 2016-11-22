package com.hippett.web.rest;

import com.hippett.HippoApp;

import com.hippett.domain.Game;
import com.hippett.repository.GameRepository;

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
 * Test class for the GameResource REST controller.
 *
 * @see GameResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = HippoApp.class)
public class GameResourceIntTest {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIP = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIP = "BBBBBBBBBB";

    private static final Float DEFAULT_AVERAGE_SCORE = 1F;
    private static final Float UPDATED_AVERAGE_SCORE = 2F;

    private static final Float DEFAULT_STDDIST = 1F;
    private static final Float UPDATED_STDDIST = 2F;

    @Inject
    private GameRepository gameRepository;

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Inject
    private EntityManager em;

    private MockMvc restGameMockMvc;

    private Game game;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        GameResource gameResource = new GameResource();
        ReflectionTestUtils.setField(gameResource, "gameRepository", gameRepository);
        this.restGameMockMvc = MockMvcBuilders.standaloneSetup(gameResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Game createEntity(EntityManager em) {
        Game game = new Game()
                .title(DEFAULT_TITLE)
                .descrip(DEFAULT_DESCRIP)
                .averageScore(DEFAULT_AVERAGE_SCORE)
                .stddist(DEFAULT_STDDIST);
        return game;
    }

    @Before
    public void initTest() {
        game = createEntity(em);
    }

    @Test
    @Transactional
    public void createGame() throws Exception {
        int databaseSizeBeforeCreate = gameRepository.findAll().size();

        // Create the Game

        restGameMockMvc.perform(post("/api/games")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(game)))
                .andExpect(status().isCreated());

        // Validate the Game in the database
        List<Game> games = gameRepository.findAll();
        assertThat(games).hasSize(databaseSizeBeforeCreate + 1);
        Game testGame = games.get(games.size() - 1);
        assertThat(testGame.getTitle()).isEqualTo(DEFAULT_TITLE);
        assertThat(testGame.getDescrip()).isEqualTo(DEFAULT_DESCRIP);
        assertThat(testGame.getAverageScore()).isEqualTo(DEFAULT_AVERAGE_SCORE);
        assertThat(testGame.getStddist()).isEqualTo(DEFAULT_STDDIST);
    }

    @Test
    @Transactional
    public void getAllGames() throws Exception {
        // Initialize the database
        gameRepository.saveAndFlush(game);

        // Get all the games
        restGameMockMvc.perform(get("/api/games?sort=id,desc"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.[*].id").value(hasItem(game.getId().intValue())))
                .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE.toString())))
                .andExpect(jsonPath("$.[*].descrip").value(hasItem(DEFAULT_DESCRIP.toString())))
                .andExpect(jsonPath("$.[*].averageScore").value(hasItem(DEFAULT_AVERAGE_SCORE.doubleValue())))
                .andExpect(jsonPath("$.[*].stddist").value(hasItem(DEFAULT_STDDIST.doubleValue())));
    }

    @Test
    @Transactional
    public void getGame() throws Exception {
        // Initialize the database
        gameRepository.saveAndFlush(game);

        // Get the game
        restGameMockMvc.perform(get("/api/games/{id}", game.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(game.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE.toString()))
            .andExpect(jsonPath("$.descrip").value(DEFAULT_DESCRIP.toString()))
            .andExpect(jsonPath("$.averageScore").value(DEFAULT_AVERAGE_SCORE.doubleValue()))
            .andExpect(jsonPath("$.stddist").value(DEFAULT_STDDIST.doubleValue()));
    }

    @Test
    @Transactional
    public void getNonExistingGame() throws Exception {
        // Get the game
        restGameMockMvc.perform(get("/api/games/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateGame() throws Exception {
        // Initialize the database
        gameRepository.saveAndFlush(game);
        int databaseSizeBeforeUpdate = gameRepository.findAll().size();

        // Update the game
        Game updatedGame = gameRepository.findOne(game.getId());
        updatedGame
                .title(UPDATED_TITLE)
                .descrip(UPDATED_DESCRIP)
                .averageScore(UPDATED_AVERAGE_SCORE)
                .stddist(UPDATED_STDDIST);

        restGameMockMvc.perform(put("/api/games")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(updatedGame)))
                .andExpect(status().isOk());

        // Validate the Game in the database
        List<Game> games = gameRepository.findAll();
        assertThat(games).hasSize(databaseSizeBeforeUpdate);
        Game testGame = games.get(games.size() - 1);
        assertThat(testGame.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testGame.getDescrip()).isEqualTo(UPDATED_DESCRIP);
        assertThat(testGame.getAverageScore()).isEqualTo(UPDATED_AVERAGE_SCORE);
        assertThat(testGame.getStddist()).isEqualTo(UPDATED_STDDIST);
    }

    @Test
    @Transactional
    public void deleteGame() throws Exception {
        // Initialize the database
        gameRepository.saveAndFlush(game);
        int databaseSizeBeforeDelete = gameRepository.findAll().size();

        // Get the game
        restGameMockMvc.perform(delete("/api/games/{id}", game.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<Game> games = gameRepository.findAll();
        assertThat(games).hasSize(databaseSizeBeforeDelete - 1);
    }
}
