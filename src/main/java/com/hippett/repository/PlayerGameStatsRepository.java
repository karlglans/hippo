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

    @Query("select playerGameStats from PlayerGameStats playerGameStats where playerGameStats.player.login = ?#{principal.username}")
    List<PlayerGameStats> findByPlayerIsCurrentUser();
    
    @Query("select playerGameStats from PlayerGameStats playerGameStats where playerGameStats.player.login = ?#{principal.username} and playerGameStats.game.id = :gameId" )
    List<PlayerGameStats> findByGameIdAndPlayerIsCurrentUser(@Param("gameId") Long gameId);

}
