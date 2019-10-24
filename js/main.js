
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
let startPos = corners[0];
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
 * Renders all components in the game
 */
function draw(){

    clearScreen();
    
    //Clears the screen
    rectangle(0,0,totalWidth,totalHeight,"grey");

    //Sets linewidth for the road
    ctx.lineWidth = 30;

    //Draws the map
    let oldCoord = map[startPos.mapIndex];

    map.forEach(map => {
        ctx.beginPath();
        ctx.moveTo(oldCoord.x, oldCoord.y);
        ctx.lineTo(map.x, map.y);

        ctx.strokeStyle = '#875D2D';
        ctx.stroke();
        circle(map.x, map.y, 15, '#875D2D');

        oldCoord = {x: map.x, y: map.y};    
    });

    //Draws Turrets
    turrets.forEach(map => {
        rectangle(map.posX, map.posY, 40, 40, 'red');
    });

    minions.forEach(minion => {
        ctx.drawImage(playerImg, minion.posX-16, minion.posY-16);
    });
    
    window.requestAnimationFrame(draw);
}

/**
 * Runs 60 times per second
 * Kinda like a main()
 */
function update(){
    //If no minions, create new minionwave
    if(minions.length == 0){

        spawnWave();
        spawnMinions = setInterval(spawnWave, 500);
    }
    if(activeMinions >= 10){
        clearInterval(spawnMinions);
        activeMinions = 0
    }

    if(turrets-length == 0){
        spawnTurret(675, 705, 5, 80, 100);
        spawnTurret(265, 305, 5, 80, 100);

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
        
    for(let i = 0; i < projectiles.length; i++){
        let currentProjectile = projectiles[i].goalId;
        for(let i= 0; i < minions.length; i++){
            if(currentProjectile == minions[i].id){
                var minion = minions[i];
            }
        }
        if(minion){
            projectiles[i].goalX = minion.posX;
            projectiles[i].goalY = minion.posY; 
        }else{
            projectiles.splice(projectiles.indexOf(projectiles[i]));
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
        rof: 60000/rof,
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
        console.log(turret.id, "shooting");
        spawnProjectile(turret, minion);
        candy();
    }
    setTimeout(stopFire, turret.rof, turret);
}

function candy(){
    projectiles.forEach(projectile => {
        dx = projectile.goalX - projectile.posX;
        dy = projectile.goalY - projectile.posY;
        angle = Math.atan2(dy, dx);
        console.log(angle);
    });
}

function spawnProjectile(turret, minion){
    let projectile = {
        posX: turret.posX,
        posY: turret.posY,
        goalId: minion.id,
        goalX: minion.posX,
        goalY: minion.posY,
        speed: 5
    }
    projectiles.push(projectile);
}

function stopFire(turret){
    clearInterval(fire);
    turret.shooting = false;
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
                turret.shooting = true;            
                fire = setInterval(shoot(turret, minion), turret.rof);
            }
        }

    });
}
window.requestAnimationFrame(draw);