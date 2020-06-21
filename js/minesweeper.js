
var time = 0;
var timer_id;

var rows;
var columns;
var minesNum;
var matrix;
var mines;
var firstR;
var firstC;
var start = 0;
var remain;
var remainMines;
var hidden;


function buildGrid() {

    // Fetch grid and clear out old elements.
    var grid = document.getElementById("minefield");
    grid.innerHTML = "";

    remain = document.getElementById("remain");
    remain.innerHTML = remainMines;

    // Build DOM Grid
    matrix = makeMatrix(rows, columns);
    var tile;
    for (var x = 0; x < rows; x++) {
        for (var y = 0; y < columns; y++) {
            tile = createTile(x,y);
            grid.appendChild(tile);
            matrix[x][y] = 0;
        }
    }
    var style = window.getComputedStyle(tile);

    var width = parseInt(style.width.slice(0, -2));
    var height = parseInt(style.height.slice(0, -2));
    
    grid.style.width = (columns * width) + "px";
    grid.style.height = (rows * height) + "px";
}

function buildFloor(){
    mines = generateMines(rows, columns);

    for(var i = 0; i<mines.length; i++){
        var temp_r = mines[i][0];
        var temp_c = mines[i][1];
        matrix[temp_r][temp_c] = -1;
    }
    for(var a = 0; a<rows; a++){
        for(var b = 0; b<columns; b++){
            setAround(a,b);
        }
    }
    console.log(matrix);

}

function setAround(r,c){
    var direction = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    var count = 0;
    if(matrix[r][c]==-1){
        return;
    }
    for(var i = 0; i<direction.length; i++){
        var newR = r+direction[i][0];
        var newC = c+direction[i][1];
        if(typeof(matrix[newR])!=='undefined'){
            if(typeof(matrix[newR][newC])!=='undefined'){
                if(matrix[newR][newC]==-1){
                    count++;
                }
            }
        }
    }
    var tile = document.getElementById(r+","+c);
    matrix[r][c]=count;
}

function makeMatrix(rows, columns){
    var matrix = new Array(rows);
    for(var i = 0; i<rows; i++){
        matrix[i] = new Array(columns);
    }
    return matrix;
}

function generateMines(rows, columns){
    var mines = new Array();
    var cur = 0;
    loop1:
    while(cur<minesNum){
        var r = Math.floor((Math.random() * rows) + 1);
        var c = Math.floor((Math.random() * columns) + 1);
        var temp = new Array(2);
        temp[0] = r-1;
        temp[1] = c-1;
        if(newEle(mines, temp) && (Math.abs(temp[0]-firstR)>=2 || Math.abs(temp[1]-firstC)>=2)){
            mines.push(temp);
            cur++;
        }
    }
    return mines;
}

function newEle(arr, ele){
    for(var i = 0; i<arr.length; i++){
        if(arr[i][0]==ele[0] && arr[i][1]==ele[1]){
            return false;
        }
    }
    return true;
}

function createTile(x,y) {
    var tile = document.createElement("div");

    tile.classList.add("tile");
    tile.classList.add("hidden");
    tile.classList.add("a");
    tile.dataset.x = x;
    tile.dataset.y = y;

    tile.id = x+","+y;
    
    tile.addEventListener("auxclick", function(e) { e.preventDefault(); }); // Middle Click
    tile.addEventListener("contextmenu", function(e) { e.preventDefault(); }); // Right Click
    tile.addEventListener("mouseup", handleTileClick ); // All Clicks
    tile.addEventListener("mousedown", faceLimbo);
    return tile;
}

function faceLimbo(){
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_limbo");   
}

function startGame() {
    start = 0;
    var smiley = document.getElementById("smiley");
    smiley.className= ('smiley');
    document.getElementById("result").innerHTML= '';
    setDifficulty();
    buildGrid();
    clearInterval(timer_id);
    startTimer();
    console.log(matrix);
}

function smileyDown() {
    var smiley = document.getElementById("smiley");
    smiley.classList.add("face_down");
}

function smileyUp() {
    var smiley = document.getElementById("smiley");
    smiley.classList.remove("face_down");
}

function expandBlank(x, y){
    var tile = document.getElementById(x+","+y);
    if(typeof(matrix[x])==='undefined' || typeof(matrix[x][y])==='undefined' || tile.classList.contains('hidden')===false){
        return;
    }
    if(matrix[x][y]>0){
        tile.classList.remove("hidden");
        hidden --;
        tile.classList.add("tile_"+matrix[x][y]);
        return;
    }

    if(matrix[x][y]===0){
        tile.classList.remove("hidden");
        hidden --;
    }

    var direction = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    for(var i = 0; i<direction.length; i++){
            var newX = x + direction[i][0];
            var newY = y + direction[i][1];
            expandBlank(newX, newY);
    }

}

function handleTileClick(event) {
    var x = parseInt(this.dataset.x);
    var y = parseInt(this.dataset.y);
    
    // Left Click
    if (event.which === 1 && this.classList.contains("hidden")) {
        if(this.classList.contains("flag")){
            return;
        }
        if(start === 0){
            start = 1;
            firstR = x;
            firstC = y;
            buildFloor();
        }
        //console.log(x+", "+y);

        if(matrix[x][y]===0){
            expandBlank(x, y);
        } else if(matrix[x][y]>0){
            this.classList.remove("hidden");
            hidden --;
            this.classList.add("tile_"+matrix[x][y]);
        }else{
            for(var i = 0; i<mines.length; i++){
                var temp_r = mines[i][0];
                var temp_c = mines[i][1];
                var tile = document.getElementById(temp_r+","+temp_c);
                tile.classList.add("mine_marked");
            }
            this.classList.remove("mine_marked");
            this.classList.add("mine_hit");
            document.getElementById('smiley').classList.add("face_lose");
            document.getElementById('result').innerHTML='Game Over!';
            for(var i = 0; i<rows; i++){
                for(j = 0; j<columns; j++){
                    var tile = document.getElementById(i+","+j);
                    tile.removeEventListener("mouseup", handleTileClick ); // All Clicks
                    tile.removeEventListener("mousedown", faceLimbo);
                }
            }
        }    
    }
    
    // Middle Click
    else if (event.which === 1) {
        var direction = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
        var count_flag = 0;
        for(var i = 0; i<direction.length; i++){
            var newX = x + direction[i][0];
            var newY = y + direction[i][1];
            if(typeof(matrix[newX])==='undefined' || typeof(matrix[newX][newY])==='undefined'){
                continue;
            }
            var flag = document.getElementById(newX+','+newY);
            if(matrix[newX][newY]===-1 && flag.classList.contains("flag")){
                count_flag++;
            }
        }
        if(count_flag === matrix[x][y]){
            //console.log("flag_count:"+count_flag);
            for(var j = 0; j<direction.length; j++){
                var newX = x + direction[j][0];
                var newY = y + direction[j][1];
                expandBlank(newX, newY);
            }
        } else {
            for(var i = 0; i<mines.length; i++){
                var temp_r = mines[i][0];
                var temp_c = mines[i][1];
                var tile = document.getElementById(temp_r+","+temp_c);
                tile.classList.add("mine_marked");
            }
            for(var j = 0; j<direction.length; j++){
                var newX = x + direction[j][0];
                var newY = y + direction[j][1];
                if(typeof(matrix[newX])==='undefined' || typeof(matrix[newX][newY])==='undefined'){
                    continue;
                }
                if(matrix[newX][newY]<0){
                    var temp = document.getElementById(newX+","+newY);
                    temp.classList.remove("mine_marked");
                    temp.classList.add("mine_hit");
                }
            }
            document.getElementById('smiley').classList.add("face_lose");
            document.getElementById('result').innerHTML='Game Over!';
            for(var i = 0; i<rows; i++){
                for(j = 0; j<columns; j++){
                    var tile = document.getElementById(i+","+j);
                    tile.removeEventListener("mouseup", handleTileClick ); // All Clicks
                    tile.removeEventListener("mousedown", faceLimbo);
                }
            }

        }
    }

    // Right Click
    else if (event.which === 3) {
        if(this.classList.contains("flag")){
            this.classList.add("hidden");
            this.classList.remove("flag");
            remainMines ++;
            remain.innerHTML=remainMines;
        } else {
            this.classList.add("flag");
            this.classList.remove("hidden");
            remainMines--;
            remain.innerHTML=remainMines;
        }
    }

    var smiley = document.getElementById("smiley");
    smiley.classList.remove("face_limbo");

    if(hidden===minesNum){
        document.getElementById('smiley').classList.add("face_win");
        document.getElementById("result").innerHTML= 'Congratulations! You win!';
        for(var i = 0; i<rows; i++){
            for(j = 0; j<columns; j++){
                var tile = document.getElementById(i+","+j);
                tile.removeEventListener("mouseup", handleTileClick ); // All Clicks
                tile.removeEventListener("mousedown", faceLimbo);
            }
        }
    }
}

function setDifficulty() {
    var difficultySelector = document.getElementById("difficulty");
    var difficulty = difficultySelector.selectedIndex;
    if(difficulty == 0){
        rows = 9;
        columns = 9;
        minesNum = 10;
    } else if (difficulty == 1){
        rows = 16;
        columns = 16;
        minesNum = 40;
    } else if (difficulty == 2){
        rows = 16;
        columns = 30;
        minesNum = 99;
    }
    remainMines = minesNum;
    hidden = rows*columns;
}

function startTimer() {
    timeValue = 0;
    timer_id = window.setInterval(onTimerTick, 1000);
}

function onTimerTick() {
    timeValue++;
    updateTimer();
}

function updateTimer() {
    document.getElementById("timer").innerHTML = timeValue;
}