
//Colors-------------------------
red       = "rgb(255, 0, 0)";
green     = "rgb(0, 255, 0)";
blue      = "rgb(0, 0, 255)";
yellow    = "rgb(255, 255, 0)";
pink      = "rgb(255, 192, 203)";
violet    = "rgb(238, 130, 238)";
indigo    = "rgb(75, 0, 130)";
turquoise = "rgb(0, 245, 255)";
cyan      = "rgb(0, 255, 255)";
orange    = "rgb(255, 165, 0)";
white     = "rgb(255, 255, 255)";
black     = "rgb(0, 0, 0)";

//Movement directions
const left = 0;
const right = 1;
const up = 2;
const down = 3;

let playerImg = new Image();
//Made by matras!!
playerImg.src = 'img/BlueGhost.png';


//When arriving to corner(mapCoords), change direction
const corners = [
    {mapIndex: 0, dir: right},
    {mapIndex: 1, dir: up},
    {mapIndex: 2, dir: left},
    {mapIndex: 3, dir: up},
    {mapIndex: 4, dir: right},
    {mapIndex: 5, dir: up},
    {mapIndex: 6, dir: left},
    {mapIndex: 7, dir: up},
    {mapIndex: 8, dir: right},
    {mapIndex: 9, dir: down},
    {mapIndex: 10, dir: right},
    {mapIndex: 11, dir: left}
];

let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

//My map, Coords for every corner
let map = [ //12 st
    {x: 0, y: 800},
    {x: 750, y: 800},
    {x: 750, y: 650},
    {x: 150, y: 650},
    {x: 150, y: 400},
    {x: 350, y: 400},
    {x: 350, y: 250},
    {x: 50, y: 250},
    {x: 50, y: 50},
    {x: 600, y: 50},
    {x: 600, y: 400},
    {x: 900, y: 400}
];

let totalWidth = canvas.width;
let totalHeight = canvas.height;
let pi = Math.PI;
let FPS = 120;
let theAnimation = setInterval(update, 1000/FPS);//Mitt Drawgrej
let spawnMinions;
var activeMinions = 0;

let turrets = [];
let turretId = 1;
let shooting = false;
let fire;
let projectiles = [];
let minions = [];
let startPos = corners[0];

function clearScreen()//Clearar skärmen
{
  ctx.clearRect(0, 0, totalWidth, totalHeight);
}

//Makes circle
function circle(x, y, r, color) 
{
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

//Makes rectangele
function rectangle(x, y, width, height, color) 
{
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

/**
 * Runs 60 times per second
 * Kinda like a main()
 */
function update(){
    let oldCoord = map[startPos.mapIndex];

    //Clears the screen
    clearScreen();

    //Sets linewidth for the road
    ctx.lineWidth = 30;
    
    //Draws the map
    rectangle(0,0,totalWidth,totalHeight,"grey");
    map.forEach(element => {
        ctx.beginPath();
        ctx.moveTo(oldCoord.x, oldCoord.y);
        ctx.lineTo(element.x, element.y);

        ctx.strokeStyle = '#875D2D';
        ctx.stroke();
        circle(element.x, element.y, 15, '#875D2D');

        oldCoord = {x: element.x, y: element.y};    
    });

    //Draws Turrets
    turrets.forEach(element => {
        rectangle(element.posX, element.posY, 40, 40, 'red');
    })

    if(turrets-length == 0){
        spawnTurret(675, 705, 5, 30, 100);
        spawnTurret(265, 305, 5, 30, 100);

    }
    //If no minions, create new minionwave
    if(minions.length == 0){

        spawnWave();
        spawnMinions = setInterval(spawnWave, 500);
    }
    if(activeMinions >= 10){
        clearInterval(spawnMinions);
        activeMinions = 0
    }

    //Calls Movefunc for each minion
    for(let i = 0; i < minions.length; i++){
        let minion = minionsMove(minions[i], i);
        minions[i] = minion;
        if(minion.goal == 12 && minion.from == 11){
            index = minions.indexOf(minion)
            splice(minion);
        }
    }
}

/**
 * Spawns turret
 * @param {Int} x X-position of the turret
 * @param {Int} y Y-position of the turret
 * @param {Int} dmg How much damage it does 
 * @param {Int} rof Rate of fire, (Rounds Per Minute)
 * @param {Int} range Attack range
 */
function spawnTurret(x, y, dmg, rof, range){
    let turret = {
        id: turretId,
        posX: x,
        posY: y,
        dmg: dmg,
        rof: rof,
        range: range,
        shooting: shooting
    }
    turrets.push(turret);
    turretId += 1;
}

/**
 * Spawns a minion and pushes it into a array of minions
 */
function spawnWave(){ // Starts a minionwave
        let minion = {
            id: activeMinions += 1,
            posX: map[startPos.mapIndex].x,
            posY: map[startPos.mapIndex].y,
            dir: startPos.dir,
            from: 0,
            goal: 1,
            hp: 20
        }
    minions.push(minion);
}
    
/**
 * Calculates movement of a minion based on direction (dir)
 * if minion reaches end, deletes it.
 * @param {Object} minion 
 */
function minionsMove(minion, i){
    distanceFromTurret(minion);
    switch(minion.dir){
        case left:
            minion.posX -= 2;
            break;
        case right:
            minion.posX += 2;
            break;
        case up:
            minion.posY -= 2;
            break;
        case down: 
            minion.posY += 2;
            break;
        default:
            minion.posX = minion.posX;
            minion.posY = minion.posY;
            break;    
    }
    if(minion.posX == map[minion.goal].x && minion.posY == map[minion.goal].y){
        changeDir(minion);
        
    }
    ctx.drawImage(playerImg, minion.posX-16, minion.posY-16);
    return minion;
}

function changeDir(minion){
    minion.goal++;
    minion.from++;
    minion.dir = corners[minion.from].dir;
}

function splice(minion){
    let index = minions.indexOf(minion);
    if(index == 0){
        minions.splice(0, 1);
    }else{
        minions.splice(index, 1);
    }
}

function shoot(turret, minion){
    distance = getDistance(turret, minion);
    if(distance < turret.range){
        console.log("shooting");
        let projectile = {
            posX: turret.posX,
            posY: turret.posY,
            goalX: minion.posX,
            goalY: minion.posY,
            speed: 5
        }
        projectiles.push(projectile);
    }

    setTimeout(turret.shooting = false, 500);
    setTimeout(clearInterval(fire), 500);
}

function getDistance(turret, minion){
    let deltaX = turret.posX - minion.posX;
    let deltaY = turret.posY - minion.posY;
    let distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    return distance;
}

function distanceFromTurret(minion){
    turrets.forEach(turret => {
        distance = getDistance(turret, minion);
        if(distance < turret.range){
            if(!turret.shooting){
                console.log(turret.shooting);   
                turret.shooting = true;
                console.log(turret.shooting);   
                fire = setInterval(shoot(turret, minion), 500);
                console.log(turret.shooting);   
            }
        }

    });
}
