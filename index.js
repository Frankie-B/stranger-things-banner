// Use of GSAP timeline for sequential animations
let tl = gsap.timeline();
/**
 * NOTE: I chose a simple easing in animation since the splitText plugin (which i thin is the actual effect being use/created on the Netflix logo) is a paid for plugin.
 */

 // Animations
window.onload = tl.to('.preloader', { duration: 1, rotate: 360, repeat: 0.4 }) // spinning preloader 
tl.fromTo('.loader-wrapper', {opacity: 1}, {duration: 0.4, opacity: 0}, '-=0.1') // preloader fade out animation
tl.fromTo('.banner-img', {opacity: 0, scale: 1}, { duration: 3, opacity: 1,  scale: 0.5 }) // shrinking the title down with the scale method
tl.fromTo('.cta', { x: 0, opacity: 0 }, { duration: 1.5, ease: "expo.out", x: 140, opacity: 1 }, '-=0.5') // cta come in from the left relative position half second after previous tween starts
tl.fromTo('.logo-1', { opacity: 0 }, { duration: 0.3, opacity: 1, ease: "expo.in"}, '<') // First part of the Netflix logo
tl.fromTo('.logo-2', { x: -150, opacity: 0 }, {  duration: 1.7, ease: "power3.out", x: 2, opacity: 1}, ) // Opacity change for Netflix logo part 2
tl.fromTo('.logo-2', {  opacity: 0 }, { duration: 1.3, ease: "sine.out", opacity: 1 }, '<') // Chained  ease in from the left to opacity full absolute position of 5seconds

/**
 * NOTE: Fireworks animation is Canvas Fireworks by Pascal Mathis  https://codepen.io/ppmathis/pen/LGfHJ.
 * I modified the code a little for my uses.
 */

 // Canvas fireworks animation

 // Local variables
var fireworks = [];
var particles = [];
var mouse = {down: false, x: 0, y: 0};
var currentHue = 120;
var clickLimiterTotal = 10;
var clickLimiterTick = 0;
var timerTotal = 80;
var timerTick = 0;

// Helper function for canvas animations
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(cb) {
      window.setTimeout(callback, 1000 / 60);
    }
})();

// Helper function to return random numbers within a specified range
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Helper function to calculate the distance between 2 points
function calculateDistance(p1x, p1y, p2x, p2y) {
  var xDistance = p1x - p2x;
  var yDistance = p1y - p2y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// Setup some basic variables
var canvas = document.getElementById('canvas');
var canvasCtx = canvas.getContext('2d');
var canvasWidth = window.innerWidth;
var canvasHeight = window.innerHeight;

// Resize canvas
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Firework class
function Firework(sx, sy, tx, ty) {
  // Set coordinates (x/y = actual, sx/sy = starting, tx/ty = target)
  this.x = this.sx = sx;
  this.y = this.sy = sy;
  this.tx = tx; this.ty = ty;
  
  // Calculate distance between starting and target point
  this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
  this.distanceTraveled = 0;

  // To simulate a trail effect, the last few coordinates will be stored
  this.coordinates = [];
  this.coordinateCount = 3;
  
  // Populate coordinate array with initial data
  while(this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  
  // Some settings, you can adjust them if you'd like to do so.
  this.angle = Math.atan2(ty - sy, tx - sx);
  this.speed = 2;
  this.acceleration = 1.03;
  this.brightness = random(50, 80);
  this.targetRadius = 1;
  this.targetDirection = false;  // false = Radius is getting bigger, true = Radius is getting smaller
};

// This method should be called each frame to update the firework
Firework.prototype.update = function(index) {
  // Update the coordinates array
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);
  
  // Cycle the target radius (used for the pulsing target circle)
  if(!this.targetDirection) {
    if(this.targetRadius < 8)
      this.targetRadius += 0.15;
    else
      this.targetDirection = true;  
  } else {
    if(this.targetRadius > 1)
      this.targetRadius -= 0.15;
    else
      this.targetDirection = false;
  }
  
  // Speed up the firework (could possibly travel faster than the speed of light) 
  this.speed *= this.acceleration;
  
  // Calculate the distance the firework has travelled so far (based on velocities)
  var vx = Math.cos(this.angle) * this.speed;
  var vy = Math.sin(this.angle) * this.speed;
  this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);
  
  // If the distance traveled (including velocities) is greater than the initial distance
  // to the target, then the target has been reached. If that's not the case, keep traveling.
  if(this.distanceTraveled >= this.distanceToTarget) {
    createParticles(this.tx, this.ty);
    fireworks.splice(index, 1);
  } else {
    this.x += vx;
    this.y += vy;
  }
};

// Draws the firework
Firework.prototype.draw = function() {
  var lastCoordinate = this.coordinates[this.coordinates.length - 1];
  
  // Draw the target (pulsing circle)
  canvasCtx.beginPath();
  canvasCtx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
  // canvasCtx.stroke();
};

// Particle class
function Particle(x, y) {
  // Set the starting point
  this.x = x;
  this.y = y;
  
  // To simulate a trail effect, the last few coordinates will be stored
  this.coordinates = [];
  this.coordinateCount = 5;
  
  // Populate coordinate array with initial data
  while(this.coordinateCount--) {
    this.coordinates.push([this.x, this.y]);
  }
  
  // Set a random angle in all possible directions (radians)
  this.angle = random(0, Math.PI * 2);
  this.speed = random(1, 10);
  
  // Add some friction and gravity to the particle
  this.friction = 0.95;
  this.gravity = 1;
  
  // Change the hue to a random number
  this.hue = random(currentHue - 20, currentHue + 20);
  this.brightness = random(50, 80);
  this.alpha = 1;
  
  // Set how fast the particles decay
  this.decay = random(0.01, 0.03);
}

// Updates the particle, should be called each frame
Particle.prototype.update = function(index) {
  // Update the coordinates array
  this.coordinates.pop();
  this.coordinates.unshift([this.x, this.y]);
  
  // Slow it down (based on friction)
  this.speed *= this.friction;
  
  // Apply velocity to the particle
  this.x += Math.cos(this.angle) * this.speed;
  this.y += Math.sin(this.angle) * this.speed + this.gravity;
  
  // Fade out the particle, and remove it if alpha is low enough
  this.alpha -= this.decay;
  if(this.alpha <= this.decay) {
    particles.splice(index, 1);
  }
}

// Draws the particle
Particle.prototype.draw = function() {
  var lastCoordinate = this.coordinates[this.coordinates.length - 1];
  
  canvasCtx.beginPath();
  canvasCtx.moveTo(lastCoordinate[0], lastCoordinate[1]);
  canvasCtx.lineTo(this.x, this.y);
  canvasCtx.strokeStyle = 'hsla(' + this.hue + ',100%,' + this.brightness + '%,' + this.alpha + ')';
  canvasCtx.stroke();
}

// Create a bunch of particles at the given position
function createParticles(x, y) {
  var particleCount = 400;
  while(particleCount--) {
    particles.push(new Particle(x, y));
  }
}

// Add an event listener to the window so we're able to react to size changes
window.addEventListener('resize', function(e) {
  canvas.width = canvasWidth = window.innerWidth;
  canvas.height = canvasHeight = window.innerHeight;
});

// Main application / script, called when the window is loaded
function gameLoop() {
  // This function will rund endlessly by using requestAnimationFrame (or fallback to setInterval)
  requestAnimFrame(gameLoop);
  
  // Increase the hue to get different colored fireworks over time
  currentHue += 0.5;
  
  // 'Clear' the canvas at a specific opacity, by using 'destination-out'. This will create a trailing effect.
  canvasCtx.globalCompositeOperation = 'destination-out';
  canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  canvasCtx.globalCompositeOperation = 'lighter';
  
  // Loop over all existing fireworks (they should be updated & drawn)
  var i = fireworks.length;
  while(i--) {
    fireworks[i].draw();
    fireworks[i].update(i);
  }
  
  // Loop over all existing particles (they should be updated & drawn)
  var i = particles.length;
  while(i--) {
    particles[i].draw();
    particles[i].update(i);
  }
  
  // Launch fireworks automatically to random coordinates, if the user does not interact with the scene
  if(timerTick >= timerTotal) {
    if(!mouse.down) {
      fireworks.push(new Firework(canvasWidth / 2, canvasHeight, random(0, canvasWidth), random(0, canvasHeight / 2)));
      timerTick = 0;
    }
  } else {
    timerTick++;
  }
  
  // Limit the rate at which fireworks can be spawned by mouse
  if(clickLimiterTick >= clickLimiterTotal) {
    if(mouse.down) {
      fireworks.push(new Firework(canvasWidth / 2, canvasHeight, mouse.x, mouse.y));
      clickLimiterTick = 0;
    }
  } else {
    clickLimiterTick++;
  }
}

document.onload = gameLoop();