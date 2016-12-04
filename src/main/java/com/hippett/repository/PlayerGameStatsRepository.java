package com.hippett.repository;

import com.hippett.domain.PlayerGameStats;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the PlayerGameStats entity.
 */
@SuppressWarnings("unused")
public interface PlayerGameStatsRepository extends JpaRepository<PlayerGameStats,Long> {
    @Query("select playerGameStats from PlayerGameStats playerGameStats where playerGameStats.game.id = :gameID and playerGameStats.player.login = ?#{principal.username}")
    List<PlayerGameStats> findByPlayerIsCurrentUserAndGameId(@Param("gameID") Long gameid);
}
