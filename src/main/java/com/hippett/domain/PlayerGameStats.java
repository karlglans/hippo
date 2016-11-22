package com.hippett.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A PlayerGameStats.
 */
@Entity
@Table(name = "player_game_stats")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class PlayerGameStats implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "n_games_played")
    private Integer nGamesPlayed;

    @Column(name = "score")
    private Integer score;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "start_level")
    private Integer startLevel;

    @ManyToOne
    private User player;

    @ManyToOne
    private Game game;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getnGamesPlayed() {
        return nGamesPlayed;
    }

    public PlayerGameStats nGamesPlayed(Integer nGamesPlayed) {
        this.nGamesPlayed = nGamesPlayed;
        return this;
    }

    public void setnGamesPlayed(Integer nGamesPlayed) {
        this.nGamesPlayed = nGamesPlayed;
    }

    public Integer getScore() {
        return score;
    }

    public PlayerGameStats score(Integer score) {
        this.score = score;
        return this;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getRating() {
        return rating;
    }

    public PlayerGameStats rating(Integer rating) {
        this.rating = rating;
        return this;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Integer getStartLevel() {
        return startLevel;
    }

    public PlayerGameStats startLevel(Integer startLevel) {
        this.startLevel = startLevel;
        return this;
    }

    public void setStartLevel(Integer startLevel) {
        this.startLevel = startLevel;
    }

    public User getPlayer() {
        return player;
    }

    public PlayerGameStats player(User user) {
        this.player = user;
        return this;
    }

    public void setPlayer(User user) {
        this.player = user;
    }

    public Game getGame() {
        return game;
    }

    public PlayerGameStats game(Game game) {
        this.game = game;
        return this;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        PlayerGameStats playerGameStats = (PlayerGameStats) o;
        if(playerGameStats.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, playerGameStats.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "PlayerGameStats{" +
            "id=" + id +
            ", nGamesPlayed='" + nGamesPlayed + "'" +
            ", score='" + score + "'" +
            ", rating='" + rating + "'" +
            ", startLevel='" + startLevel + "'" +
            '}';
    }
}
