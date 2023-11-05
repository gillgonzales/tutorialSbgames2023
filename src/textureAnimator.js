 //Lee Stemkoski
    //http://stemkoski.github.io/Three.js/Texture-Animation.html
    //https://github.com/stemkoski/stemkoski.github.com/blob/master/Three.js/Texture-Animation.html
    export default function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration,THREE)
    {
        // note: texture passed by reference, will be updated by the update function.

        this.tilesHorizontal = tilesHoriz;
        this.tilesVertical = tilesVert;
        // how many images does this spritesheet contain?
        //  usually equals tilesHoriz * tilesVert, but not necessarily,
        //  if there at blank tiles at the bottom of the spritesheet. 
        this.numberOfTiles = numTiles;
        this.texture = texture;
        this.texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        this.texture.repeat.set(1 / this.tilesHorizontal, 1 / this.tilesVertical);

        // how long should each image be displayed?
        this.tileDisplayDuration = tileDispDuration;

        // how long has the current image been displayed?
        this.currentDisplayTime = 0;

        // which image is currently being displayed?
        this.currentTile = 0;

        this.update = function (milliSec)
        {
            this.currentDisplayTime += milliSec;
            while (this.currentDisplayTime > this.tileDisplayDuration)
            {
                this.currentDisplayTime -= this.tileDisplayDuration;
                this.currentTile++;
                if (this.currentTile == this.numberOfTiles)
                    this.currentTile = 0;
                var currentColumn = this.currentTile % this.tilesHorizontal;
                this.texture.offset.x = currentColumn / this.tilesHorizontal;
                var currentRow = Math.floor(this.currentTile / this.tilesHorizontal);
                this.texture.offset.y = currentRow / this.tilesVertical;
            }
        };

        this.reset = function () {
            this.texture.offset.x = 0;
            this.texture.offset.y = 0;
            this.currentTile = 0;
            this.currentDisplayTime = 0;
        };
    }