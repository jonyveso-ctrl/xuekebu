// js/snake-background.js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('snake-bg-canvas');
    if (!canvas) {
        // console.warn('Snake background canvas not found.'); // Optional: for debugging
        return;
    }
    const ctx = canvas.getContext('2d');

    let width, height;
    const segmentSize = 12;
    let snakes = []; 
    let foods = []; 
    let gameSpeed = 120; 
    let lastUpdateTime = 0;
    let animationFrameId;

    // Colors for the snake and food, fitting the tech/dark theme
    const snakeColors = [
        [0, 174, 255],    // Primary Blue (from dark theme --primary-color)
        [100, 255, 218],  // Cyan/Teal Accent (from dark theme --link-hover-color)
        [0, 119, 204]     // Secondary Blue (from dark theme --secondary-color)
    ];
    const foodBaseColor = [100, 255, 218]; // Cyan/Teal
    const snakeBorderBaseColor = [100, 255, 218]; // Cyan/Teal border for segments

    let particles = [];
    const numParticles = 120;
    const gridSpacing = 40;   
    let gridOffsetX = 0;
    let gridOffsetY = 0;

    function initializeTechBackgroundElements() {
        particles = [];
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                length: Math.random() * 12 + 6,
                speedY: Math.random() * 0.7 + 0.25,
                opacity: Math.random() * 0.3 + 0.08,
                color: Math.random() > 0.5 ? [100, 255, 218] : [0, 174, 255] // Teal or Blue particles
            });
        }
    }

    function drawGrid() {
        ctx.strokeStyle = 'rgba(64, 86, 161, 0.4)'; 
        ctx.lineWidth = 0.5; 

        gridOffsetX = (gridOffsetX + 0.08) % gridSpacing;
        gridOffsetY = (gridOffsetY + 0.04) % gridSpacing;

        for (let x = gridOffsetX; x < width; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = gridOffsetY; y < height; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    function updateAndDrawParticles() {
        particles.forEach(p => {
            p.y += p.speedY;
            if (p.y > height + p.length) { 
                p.y = 0 - p.length;
                p.x = Math.random() * width;
            }
            ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.opacity})`;
            ctx.fillRect(p.x, p.y, 1.8, p.length); 
        });
    }


    function init() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        initializeTechBackgroundElements();

        snakes = [];
        for (let i = 0; i < 3; i++) {
            const initialSnakeLength = 6;
            const snake = [];
            const startX = Math.floor(width / (4 * segmentSize)) * segmentSize * (i + 1);
            const startY = Math.floor(height / (2 * segmentSize)) * segmentSize;

            for (let j = 0; j < initialSnakeLength; j++) {
                snake.push({ x: startX - j * segmentSize, y: startY });
            }
            snakes.push({
                body: snake,
                dx: segmentSize,
                dy: 0,
                color: snakeColors[i % snakeColors.length] // Use modulo for safety
            });
        }

        foods = [];
        for (let i = 0; i < 3; i++) {
            createFood();
        }
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        gameLoop();
    }

    function createFood() {
        const food = {
            x: Math.floor(Math.random() * (width / segmentSize)) * segmentSize,
            y: Math.floor(Math.random() * (height / segmentSize)) * segmentSize
        };

        for (const snake of snakes) {
            for (const segment of snake.body) {
                if (food.x === segment.x && food.y === segment.y) {
                    return createFood();
                }
            }
        }

        for (const existingFood of foods) {
            if (food.x === existingFood.x && food.y === existingFood.y) {
                return createFood();
            }
        }

        foods.push(food);
    }

    function drawSegment(segment, index, snakeColor, snakeBodyLength) { // Pass snakeBodyLength
        const isHead = index === 0;
        const baseOpacity = 0.85;
        const headOpacityFactor = isHead ? 1.2 : 1;
        // Adjust tail fade factor based on actual snake body length
        const tailFadeFactor = Math.max(0.25, 1 - (index / (snakeBodyLength + 6))); 

        const finalOpacity = baseOpacity * headOpacityFactor * tailFadeFactor;
        
        ctx.fillStyle = `rgba(${snakeColor[0]}, ${snakeColor[1]}, ${snakeColor[2]}, ${finalOpacity})`;
        ctx.fillRect(segment.x, segment.y, segmentSize, segmentSize);
        
        ctx.strokeStyle = `rgba(${snakeBorderBaseColor[0]}, ${snakeBorderBaseColor[1]}, ${snakeBorderBaseColor[2]}, ${finalOpacity * 0.8})`;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(segment.x + 0.6, segment.y + 0.6, segmentSize - 1.2, segmentSize - 1.2);
    }

    function drawSnakes() {
        for (const snake of snakes) {
            // Pass snake.body.length to drawSegment
            snake.body.forEach((segment, index) => drawSegment(segment, index, snake.color, snake.body.length));
        }
    }

    function drawFoods() {
        for (const food of foods) {
            ctx.fillStyle = `rgba(${foodBaseColor[0]}, ${foodBaseColor[1]}, ${foodBaseColor[2]}, 0.95)`;
            ctx.fillRect(food.x, food.y, segmentSize, segmentSize);
            // Use the first snake color for food border for consistency or a specific border color
            ctx.strokeStyle = `rgba(${snakeColors[0][0]}, ${snakeColors[0][1]}, ${snakeColors[0][2]}, 1)`; 
            ctx.lineWidth = 1.2;
            ctx.strokeRect(food.x + 0.6, food.y + 0.6, segmentSize - 1.2, segmentSize - 1.2);
        }
    }

    function updateSnakes() {
        for (const snake of snakes) {
            const head = { x: snake.body[0].x + snake.dx, y: snake.body[0].y + snake.dy };

            if (head.x >= width) head.x = 0;
            if (head.x < 0) head.x = Math.floor(width / segmentSize) * segmentSize - segmentSize; // Correct wrap around
            if (head.y >= height) head.y = 0;
            if (head.y < 0) head.y = Math.floor(height / segmentSize) * segmentSize - segmentSize; // Correct wrap around


            snake.body.unshift(head);

            let ateFood = false;
            for (let i = foods.length - 1; i >= 0; i--) { // Iterate backwards for safe splice
                if (head.x === foods[i].x && head.y === foods[i].y) {
                    foods.splice(i, 1);
                    createFood();
                    ateFood = true;
                    if (Math.random() < 0.45) changeDirectionRandomly(snake);
                    break;
                }
            }

            if (!ateFood) {
                snake.body.pop();
            }

            if (Math.random() < 0.02) { // Chance to change direction
                changeDirectionRandomly(snake);
            }

            // Prevent snakes from getting too long and filling the screen
            const maxSnakeLength = Math.floor((width * height * 0.0005) / segmentSize) + 10; // Dynamic max length
            if (snake.body.length > maxSnakeLength) {
                 snake.body.splice(maxSnakeLength); // Trim tail if too long
            }
        }
    }

    function changeDirectionRandomly(snake) {
        const directions = [
            { dx: segmentSize, dy: 0 },  // Right
            { dx: -segmentSize, dy: 0 }, // Left
            { dx: 0, dy: segmentSize },  // Down
            { dx: 0, dy: -segmentSize }  // Up
        ];
        
        const possibleDirections = directions.filter(dir => 
            // Allow turning back on self if snake is very short (e.g. length 1)
            (snake.body.length > 1 ? !(dir.dx === -snake.dx && dir.dy === -snake.dy) : true)
        );
        
        if (possibleDirections.length > 0) {
            const newDir = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            snake.dx = newDir.dx;
            snake.dy = newDir.dy;
        }
    }

    function gameLoop(currentTime) {
        animationFrameId = requestAnimationFrame(gameLoop);
        if (currentTime - lastUpdateTime < gameSpeed) {
            return;
        }
        lastUpdateTime = currentTime;

        const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';

        if (isDarkTheme) {
            // Use the background color from CSS variable for consistency
            const rootStyle = getComputedStyle(document.documentElement);
            const darkBgColor = rootStyle.getPropertyValue('--background-color').trim();
            ctx.clearRect(0, 0, width, height);
            
            drawGrid();
            updateAndDrawParticles();
        } else {
            ctx.clearRect(0, 0, width, height); // Clear canvas for light theme
        }
        
        // Only update and draw snakes/food if in dark theme (or always if desired)
        // For this commemorative site, it makes sense to only show them in dark mode.
        if (isDarkTheme) {
            updateSnakes();
            drawFoods();
            drawSnakes();
        }
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            init(); // Re-initialize on resize
        }, 250);
    });
    
    // Initial check for theme to start animation if dark
    // The gameLoop itself checks theme, so init can always run.
    init(); 

    // Optional: Listen for theme changes if your toggle is in another script
    // document.addEventListener('themeChanged', (e) => {
    //     if (animationFrameId) cancelAnimationFrame(animationFrameId);
    //     lastUpdateTime = 0; // Reset time to allow immediate redraw on theme change
    //     gameLoop(); // Restart loop to reflect theme
    // });
});