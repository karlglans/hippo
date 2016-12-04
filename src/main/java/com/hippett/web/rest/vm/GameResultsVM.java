package com.hippett.web.rest.vm;

import javax.validation.constraints.NotNull;

public class GameResultsVM{
	@NotNull
	public Integer endLevel;
	
	@NotNull
	public Integer score;
	
	@NotNull
	public Integer key;
	
	public Integer getEndLevel() {
		return endLevel;
	}
	public void setEndLevel(Integer endLevel) {
		this.endLevel = endLevel;
	}
	public Integer getScore() {
		return score;
	}
	public void setScore(Integer score) {
		this.score = score;
	}
	public Integer getKey() {
		return key;
	}
	public void setKey(Integer key) {
		this.key = key;
	}
	
	@Override
	public String toString() {
		return "endLevel: " + endLevel + " , score: " + score + ",  key: " + key;
	}
}