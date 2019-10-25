
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



//Canvas
let canvas = document.getElementById("game");
let ctx = canvas.getContext("2d");

//Movement directions
const left = 0;
const right = 1;
const up = 2;
const down = 3;
let bgImage = new Image();
let playerImage = new Image();
let pumpkinImage = new Image();
let candyImage = new Image();
let jsImage = new Image();
let phpImage = new Image();
let reactImage = new Image();



//Made by matras!!
playerImage.src = 'img/BlueGhost.png';
bgImage.src = 'img/bg.png';
pumpkinImage.src = 'img/pumpkin.png';
candyImage.src = 'img/candy.png';
jsImage.src = 'img/js.png';
phpImage.src = 'img/php.png';
reactImage.src = 'img/react.png';




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
    {x: 1123, y: 400}
];
let startPos = corners[0];
let totalWidth = canvas.width;
let totalHeight = canvas.height;
let hp = 100;
let FPS = 120;
let theAnimation = setInterval(update, 1000/FPS);//Mitt Drawgrej
let spawnMinions;
let activeMinions = 0;
let waveAmount = 8;
let wave = 0;
let minionHp = 20;

//Cash and buying turrets
let cash = 100;
let turretBought;
var buyables = [];
let turret1 = {
    attackType: "projectile",
    dmg: 10,
    range: 100,
    rof: 80,
    cost: 100,
    img: phpImage,
    projectileImg: pumpkinImage
}

let turret2 = {
    attackType: "projectile",
    dmg: 25,
    range: 200,
    rof: 40,
    cost: 500,
    img: reactImage,
    projectileImg: candyImage
}

let turret3 = {
    attackType: "shockwave",
    dmg: 25,
    range: 70,
    rof: 40,
    cost: 2500,
    img: jsImage,
    projectileImg: candyImage
}

let turrets = [];
let turretId = 1;
let shooting = false;
let fire;
let shockwaves = [[]];
let projectiles = [];
let minions = [];

var rect = canvas.getBoundingClientRect();

var mouse = {
    x: 0,
    y: 0,
};

var mouse_on_canvas = {
    x: mouse.x - rect.left,
    y: mouse.y - rect.top,
};

function clearScreen()//Clearar skärmen
{
  ctx.clearRect(0, 0, totalWidth, totalHeight);
}

//Makes circle
function circle(x, y, r, color)
{
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.stroke();

}
function circleFill(x, y, r, color)
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
    buyables = [];

    //Clears the screen
    clearScreen();
    
    ctx.drawImage(bgImage, 0, 0);

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
        circleFill(map.x, map.y, 15, '#875D2D');

        oldCoord = {x: map.x, y: map.y};
    });

    //Draws Turrets
    turrets.forEach(turret => {
        ctx.drawImage(turret.img, turret.posX - turret.width / 2, turret.posY - turret.height / 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "green";
    });

    // Draws minions
    minions.forEach(minion => {
        ctx.drawImage(playerImage, minion.posX-16, minion.posY-16);
    });

    // Draws projectiles
    projectiles.forEach(projectile => {
    ctx.drawImage(projectile.img, projectile.posX-9, projectile.posY-9);
    });
    shockwaves.forEach(shockwave => {
        circle(shockwave.posX, shockwave.posY, shockwave.r, shockwave.color);
    });

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Hp: " + hp, 920, 470);
    ctx.fillText("Cash: " + cash, 920, 520);
    ctx.fillText("Wave: " + wave, 10, 850);
    ctx.fillText("BuyMenu: " , 200, 850)

    // BuyMenu
    if(cash >= 100){
        let rec = {
            x: 400,
            y: 820,
            width: 40,
            height: 40,
            color: "red",
            turret: turret1
        };
        ctx.drawImage(rec.turret.img, rec.x, rec.y);

        // rectangle(400, 820, 40, 40 ,"red");
        buyables.push(rec);
    }
    if(cash >= 500){
        let rec = {
            x: 450,
            y: 820,
            width: 40,
            height: 40,
            color: "red",
            turret: turret2
        };
        ctx.drawImage(rec.turret.img, rec.x, rec.y);

        // rectangle(450, 820, 40, 40 ,"blue");
        buyables.push(rec);
    }
    if(cash >= 2500){
        let rec = {
            x: 500,
            y: 820,
            width: 40,
            height: 40,
            color: "red",
            turret: turret3
        };
        ctx.drawImage(rec.turret.img, rec.x, rec.y);

        buyables.push(rec);
    }
    
    if(turretBought){
        ctx.drawImage(turretBought.img, mouse_on_canvas.x - 20, mouse_on_canvas.y - 20);
        ctx.beginPath();
        ctx.arc(mouse_on_canvas.x, mouse_on_canvas.y, turretBought.range, 0, 2 * Math.PI);
        ctx.stroke();
    }
    window.requestAnimationFrame(draw);
    if (hp <= 0){
        ctx.fillStyle = "red";
        ctx.font = "200px Arial";
        ctx.fillText("You died", 180, 450);
        clearInterval(theAnimation);
    }
}

/**
 * Runs 60 times per second
 * Kinda like a main()
 */
function update(){
    mouse_on_canvas = {
        x: mouse.x - rect.left,
        y: mouse.y - rect.top,
    };

    //If no minions, create new minionwave
    if(minions.length == 0){
        wave++;
        if(wave % 5 == 0){
            minionHp += 3;
        }
        spawnMinion();
        spawnMinions = setInterval(spawnMinion, 500);
    }
    if(activeMinions >= waveAmount){
        clearInterval(spawnMinions);
        activeMinions = 0
        waveAmount++;

    }

    if(turrets-length == 0){
        spawnTurret(700, 705, turret1);
        spawnTurret(300, 305, turret2);
        spawnTurret(550, 100, turret1);


    }

    //Calls Movefunc for each minion
    for(let i = 0; i < minions.length; i++){
        let minion = minionsMove(minions[i], i);
        minions[i] = minion;
        if(minion.goal == 12 && minion.from == 11){
            index = minions.indexOf(minion)
            splice(minion);
            hp -= 10;
        }
    }
        
    for(let i = 0; i < projectiles.length; i++){
        let currentTarget = projectiles[i].goalId;
        let minion = findCurrentTarget(currentTarget);

        if(minion){
            let inRange = getDistanceToMinion(projectiles[i], minion, 15);
            if (inRange){
                targetHit(projectiles[i], minion);
            }else{
                projectilesMove(projectiles[i], minion);
    
            }
        }else{
            projectiles.splice(projectiles.indexOf(projectiles[i]), 1);
        }
    }
    for(let i = 0; i < shockwaves.length; i++){
        for(let j = 0; j < minions.length; j++){
            
            let inRange = getDistanceToMinion(shockwaves[i], minions[j], 9 + shockwaves[i].r);
            
            if (inRange && !shockwaves[i].minionsHit.includes(minions[j])){
                minions[j].hp -= shockwaves[i].dmg
                checkMiniondeath(minions[j]);
                if(minions[j]){
                    shockwaves[i].minionsHit.push(minions[j]);
                }
            }
        }

        shockwaves[i].r += 2;
        if(shockwaves[i].r >= shockwaves[i].range){
            turrets[shockwaves[i].turretIndex].shooting = false;
  
            shockwaves.splice(shockwaves.indexOf(shockwaves[i]), 1);
            
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
function spawnTurret(x, y, turretType){
    let turret = {
        id: turretId,
        width: 40,
        height: 40,
        posX: x - 20,
        posY: y + 20,
        attackType: turretType.attackType,
        dmg: turretType.dmg,
        rof: 60000/turretType.rof,
        range: turretType.range,
        shooting: shooting,
        img: turretType.img,
        projectileImg: turretType.projectileImg
    }
    turrets.push(turret);
    turretId += 1;
}

/**
 * Spawns a minion and pushes it into a array of minions
 */
function spawnMinion(){ // Starts a minionwave
        let minion = {
            id: activeMinions += 1,
            posX: map[startPos.mapIndex].x,
            posY: map[startPos.mapIndex].y,
            dir: startPos.dir,
            speed: 2,
            from: 0,
            goal: 1,
            hp: minionHp
        }
    minions.push(minion);
}
    
/**
 * Calculates movement of a minion based on direction (dir)
 * if minion reaches end, deletes it.
 * @param {Object} minion 
 */
function minionsMove(minion, i){
    inTurretRange(minion);
    switch(minion.dir){
        case left:
            minion.posX -= minion.speed;
            break;
        case right:
            minion.posX += minion.speed;
            break;
        case up:
            minion.posY -= minion.speed;
            break;
        case down: 
            minion.posY += minion.speed;
            break;
        default:
            minion.posX = minion.posX;
            minion.posY = minion.posY;
            break;    
    }
    if (map[minion.goal].x - 2 <= minion.posX && minion.posX <= map[minion.goal].x + 2 
        && map[minion.goal].y - 2 <= minion.posY && minion.posY <= map[minion.goal].y + 2
        ){
        changeDir(minion);
        
    }
    return minion;
}

function changeDir(minion){
    minion.posX = map[minion.goal].x;
    minion.posY = map[minion.goal].y;
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

function inTurretRange(minion){
    turrets.forEach(turret => {
        let inRange = getDistanceToMinion(turret, minion, turret.range);
        if(turret.attackType == "projectile"){
            if(inRange){
                if(!turret.shooting){   
                    turret.shooting = true;
                    fire = setInterval(shoot(turret, minion), turret.rof);
                }
            }
        }else if (turret.attackType == "shockwave" && !turret.shooting){
            turret.shooting = true;
            startShockwave(turret);
        }

    });
}

function startShockwave(turret){
    spawnShockwave(turret);
    circle(turret.posX, turret.posY, 1, "yellow");
}

function spawnShockwave(turret) {
    let shockwave = {
        turretIndex: turrets.indexOf(turret),
        posX: turret.posX,
        posY: turret.posY,
        dmg: 4,
        range: turret.range,
        r: 1,
        color: "red",
        minionsHit: []
    }

    shockwaves.push(shockwave);
}

function shoot(turret, minion){
    inRange = getDistanceToMinion(turret, minion, turret.range);
    if(inRange){
        spawnProjectile(turret, minion);
    }
    setTimeout(stopFire, turret.rof, turret);
}

function stopFire(turret){
    clearInterval(fire);
    turret.shooting = false;
}

function spawnProjectile(turret, minion){
    let projectile = {
        posX: turret.posX,
        posY: turret.posY,
        goalId: minion.id,
        goalX: minion.posX,
        goalY: minion.posY,
        dmg: turret.dmg,
        speed: 3,
        img: turret.projectileImg
    }
    projectiles.push(projectile);
}

function projectilesMove(projectile, minion){
    projectile.goalX = minion.posX;
    projectile.goalY = minion.posY;
    angle = getAngle(projectile);

    xVelocity = projectile.speed * Math.cos(angle);
    yVelocity = projectile.speed * Math.sin(angle);
    projectile.posX += xVelocity;
    projectile.posY += yVelocity;
}

function getDistanceToMinion(object, minion, range){
    let deltaX = object.posX - minion.posX;
    let deltaY = object.posY - minion.posY;
    let distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    if(distance <= range){
        return true;
    }else{
        return false;
    }
}

function getAngle(projectile){
    dx = projectile.goalX - projectile.posX;
    dy = projectile.goalY - projectile.posY;
    angle = Math.atan2(dy, dx);
    return angle;
}

function findCurrentTarget(currentProjectile){
    for(let j = 0; j < minions.length; j++){
        if(currentProjectile == minions[j].id){
            var minion = minions[j];
        }
    }
    return minion;
}

function checkMiniondeath(minion){
    if(minion.hp <= 0){
        killMinion(minion)
    }
}

function targetHit(projectile, minion){
    minion.hp -= projectile.dmg;         
    projectiles.splice(projectiles.indexOf(projectile), 1);
    checkMiniondeath(minion);
}
function killMinion(minion){
    splice(minion);
    cash += (9 + wave);
}


document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

document.addEventListener('mouseup', e => {      
    if(turretBought){
        spawnTurret(mouse_on_canvas.x + 20, mouse_on_canvas.y -20, turretBought);
        cash -= turretBought.cost;
        turretBought = null;
    }
});
canvas.addEventListener('mousedown', function(event) {
    var x = mouse_on_canvas.x,
        y = mouse_on_canvas.y;

    // Collision detection between clicked offset and element.
    buyables.forEach(function(turret) {
        if (y > turret.y && y < turret.y + turret.height 
            && x > turret.x && x < turret.x + turret.width) {
            turretBought = turret.turret;
        }
    });

}, false);

window.requestAnimationFrame(draw);