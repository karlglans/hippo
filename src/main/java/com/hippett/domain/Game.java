package com.hippett.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A Game.
 */
@Entity
@Table(name = "game")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class Game implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "descrip")
    private String descrip;

    @Column(name = "average_score")
    private Float averageScore;

    @Column(name = "stddist")
    private Float stddist;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public Game title(String title) {
        this.title = title;
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescrip() {
        return descrip;
    }

    public Game descrip(String descrip) {
        this.descrip = descrip;
        return this;
    }

    public void setDescrip(String descrip) {
        this.descrip = descrip;
    }

    public Float getAverageScore() {
        return averageScore;
    }

    public Game averageScore(Float averageScore) {
        this.averageScore = averageScore;
        return this;
    }

    public void setAverageScore(Float averageScore) {
        this.averageScore = averageScore;
    }

    public Float getStddist() {
        return stddist;
    }

    public Game stddist(Float stddist) {
        this.stddist = stddist;
        return this;
    }

    public void setStddist(Float stddist) {
        this.stddist = stddist;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Game game = (Game) o;
        if(game.id == null || id == null) {
            return false;
        }
        return Objects.equals(id, game.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Game{" +
            "id=" + id +
            ", title='" + title + "'" +
            ", descrip='" + descrip + "'" +
            ", averageScore='" + averageScore + "'" +
            ", stddist='" + stddist + "'" +
            '}';
    }
}
