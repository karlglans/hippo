package com.hippett.web.rest.vm;

public class GameStatsVM{
	public String title;
	public Integer gameid;
	public Integer rating;
	public Integer played;
	public Integer level;
	
	
	
	public GameStatsVM(String title, Integer gameId, Integer rating, Integer played, Integer level) {
		 this.title = title;
		 this.gameid = gameId;
		 this.rating = rating;
		 this.played = played;
		 this.level = level;
	}
	
	
}