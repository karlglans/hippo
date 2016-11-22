package com.hippett.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.hippett.domain.PlayerGameStats;

import com.hippett.repository.PlayerGameStatsRepository;
import com.hippett.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing PlayerGameStats.
 */
@RestController
@RequestMapping("/api")
public class PlayerGameStatsResource {

    private final Logger log = LoggerFactory.getLogger(PlayerGameStatsResource.class);
        
    @Inject
    private PlayerGameStatsRepository playerGameStatsRepository;

    /**
     * POST  /player-game-stats : Create a new playerGameStats.
     *
     * @param playerGameStats the playerGameStats to create
     * @return the ResponseEntity with status 201 (Created) and with body the new playerGameStats, or with status 400 (Bad Request) if the playerGameStats has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PostMapping("/player-game-stats")
    @Timed
    public ResponseEntity<PlayerGameStats> createPlayerGameStats(@RequestBody PlayerGameStats playerGameStats) throws URISyntaxException {
        log.debug("REST request to save PlayerGameStats : {}", playerGameStats);
        if (playerGameStats.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("playerGameStats", "idexists", "A new playerGameStats cannot already have an ID")).body(null);
        }
        PlayerGameStats result = playerGameStatsRepository.save(playerGameStats);
        return ResponseEntity.created(new URI("/api/player-game-stats/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("playerGameStats", result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /player-game-stats : Updates an existing playerGameStats.
     *
     * @param playerGameStats the playerGameStats to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated playerGameStats,
     * or with status 400 (Bad Request) if the playerGameStats is not valid,
     * or with status 500 (Internal Server Error) if the playerGameStats couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @PutMapping("/player-game-stats")
    @Timed
    public ResponseEntity<PlayerGameStats> updatePlayerGameStats(@RequestBody PlayerGameStats playerGameStats) throws URISyntaxException {
        log.debug("REST request to update PlayerGameStats : {}", playerGameStats);
        if (playerGameStats.getId() == null) {
            return createPlayerGameStats(playerGameStats);
        }
        PlayerGameStats result = playerGameStatsRepository.save(playerGameStats);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("playerGameStats", playerGameStats.getId().toString()))
            .body(result);
    }

    /**
     * GET  /player-game-stats : get all the playerGameStats.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of playerGameStats in body
     */
    @GetMapping("/player-game-stats")
    @Timed
    public List<PlayerGameStats> getAllPlayerGameStats() {
        log.debug("REST request to get all PlayerGameStats");
        List<PlayerGameStats> playerGameStats = playerGameStatsRepository.findAll();
        return playerGameStats;
    }

    /**
     * GET  /player-game-stats/:id : get the "id" playerGameStats.
     *
     * @param id the id of the playerGameStats to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the playerGameStats, or with status 404 (Not Found)
     */
    @GetMapping("/player-game-stats/{id}")
    @Timed
    public ResponseEntity<PlayerGameStats> getPlayerGameStats(@PathVariable Long id) {
        log.debug("REST request to get PlayerGameStats : {}", id);
        PlayerGameStats playerGameStats = playerGameStatsRepository.findOne(id);
        return Optional.ofNullable(playerGameStats)
            .map(result -> new ResponseEntity<>(
                result,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /player-game-stats/:id : delete the "id" playerGameStats.
     *
     * @param id the id of the playerGameStats to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/player-game-stats/{id}")
    @Timed
    public ResponseEntity<Void> deletePlayerGameStats(@PathVariable Long id) {
        log.debug("REST request to delete PlayerGameStats : {}", id);
        playerGameStatsRepository.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("playerGameStats", id.toString())).build();
    }

}
