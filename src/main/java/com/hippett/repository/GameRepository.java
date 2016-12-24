package com.hippett.repository;

import com.hippett.domain.Game;
import com.hippett.domain.PlayerGameStats;

import org.springframework.data.jpa.repository.*;

import java.util.List;

/**
 * Spring Data JPA repository for the Game entity.
 */
@SuppressWarnings("unused")
public interface GameRepository extends JpaRepository<Game,Long> {
	Game findOneById(long id);
	List<Game> findAll();
}
