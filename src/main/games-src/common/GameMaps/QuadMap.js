function QuadMap(dencity, level) {
	if (!dencity || !level)
		throw "missing params";
	this.row = this.col = 0;
	this.map = undefined;
	this.setDim(dencity, level); // 2016-12-10 setDim(dencity, level);
}

QuadMap.prototype.setDim = function(dencity, level){
	var u =  1, v = 1;
	var safe = 0;
	while (true){
		if( u * v * dencity > level )
			break;
		if( u == v ) 
			v++; // increase v before u
		else 
			u++;
		if(safe++ > 1000) 
			throw "too big somehow"; // TODO remove
	}
	this.row = u;
	this.col = v;
}

QuadMap.prototype.getDim = function() {
	return {row: this.row, col: this.col};
}

QuadMap.prototype.getIdx = function(x, y){
	if(x > this.col || y > this.row)
		throw("param too big");
	return y*this.col + x; 
}

QuadMap.prototype.checkPos = function(idx){
	return this.map[idx];
}
QuadMap.prototype.setPos = function(idx, value){
	console.log('setPos', idx, value);
	this.map[idx] = value;
}

module.exports = {
	QuadMap : QuadMap
};