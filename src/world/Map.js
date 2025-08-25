export class TileMap {
  constructor(cols, rows, tile){
    this.cols = cols; this.rows = rows; this.tile = tile; // px
    // 1 = Wand, 0 = frei (kleines Testlayout)
    this.grid = Array.from({length:rows}, (_,y)=>Array.from({length:cols}, (_,x)=> (y===0||y===rows-1||x===0||x===cols-1?1:0)));
    // Innere Hindernisse
    for (let y=6;y<14;y++) this.grid[y][12] = 1;
  }
  isBlocked(px, py){
    const tx = Math.floor(px/this.tile), ty = Math.floor(py/this.tile);
    if (ty<0||ty>=this.rows||tx<0||tx>=this.cols) return true;
    return this.grid[ty][tx]===1;
  }
}
