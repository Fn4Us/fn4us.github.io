function Sprite(img, pos, size, speed, frames, once) {
  this.pos = pos;
  this.size = size;
  this.speed = speed;
  this._index = 0;
  this.img = img;
  this.once = once;
}

Sprite.prototype.update = function(dt) {
  this._index += this.speed*dt;
}

Sprite.prototype.render = function(ctx) {
  var frame;
  
  if (this.speed > 0) {
    var max = this.frames.length;
    var idx = Math.floor(this._index);
    frame = this.frames[idx % max];
    
    if (this.once && idx >= max) {
      this.done = true;
      return;
    }
  } else {
    frame = 0;
  }
  
  var x = this.pos[0];
  var y = this.pos[1];
  
  x += frame*this.size[0];
  
  ctx.drawImage(resources.get(this.img),
                  x, y,
                this.size[0], this.size[1],
                0,0,
                this.size[0],this.size[1]);
}