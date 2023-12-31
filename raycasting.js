// Data
let data = {
    screen: {
        width: 640,
        height: 480,
        halfWidth: null,
        halfHeight: null,
        scale: 4,
    },
    projection: {
        width: null,
        height: null,
        halfWidth: null,
        halfHeight: null,
        imageData: null,
        buffer: null,
    },
    render: {
        delay: 30,
    },
    rayCasting: {
        incrementAngle: null,
        precision: 64,
    },
    player: {
        fov: 60,
        halfFov: null,
        x: 2,
        y: 2,
        angle: 90,
        speed: {
            movement: 0.02,
            rotation: 0.8,
        },
        radius: 5,
    },
    map: [
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 2, 2, 0, 2, 0, 0, 2],
        [2, 0, 0, 2, 0, 0, 2, 0, 0, 2],
        [2, 0, 0, 2, 0, 0, 2, 0, 0, 2],
        [2, 0, 0, 2, 0, 2, 2, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    ],
    key: {
        up: {
            code: 'KeyW',
            active: false,
        },
        down: {
            code: 'KeyS',
            active: false,
        },
        left: {
            code: 'KeyA',
            active: false,
        },
        right: {
            code: 'KeyD',
            active: false,
        },
    },
    textures: [
        {
            width: 8,
            height: 8,
            bitmap: [
                [1, 1, 1, 1, 1, 1, 1, 1],
                [0, 0, 0, 1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [0, 1, 0, 0, 0, 1, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [0, 0, 0, 1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [0, 1, 0, 0, 0, 1, 0, 0],
            ],
            colors: ['rgb(255, 241, 232)', 'rgb(194, 195, 199)'],
        },
        {
            width: 64,
            height: 64,
            id: 'texture',
            data: null,
        },
    ],
    backgrounds: [
        {
            width: 360,
            height: 60,
            id: 'background',
            data: null,
        },
    ],
    floorTextures: [
        {
            width: 64,
            height: 64,
            id: 'floor-texture',
            data: null,
        },
    ],
};

// Calculated data
data.screen.halfWidth = data.screen.width / 2;
data.screen.halfHeight = data.screen.height / 2;
data.rayCasting.incrementAngle = data.player.fov / data.screen.width;
data.player.halfFov = data.player.fov / 2;

data.projection.width = data.screen.width / data.screen.scale;
data.projection.height = data.screen.height / data.screen.scale;
data.projection.halfWidth = data.projection.width / 2;
data.projection.halfHeight = data.projection.height / 2;
data.rayCasting.incrementAngle = data.player.fov / data.projection.width;

// Canvas
const screen = document.createElement('canvas');
screen.width = data.screen.width;
screen.height = data.screen.height;
screen.style.border = '1px solid black';
document.body.appendChild(screen);

// Canvas context
const screenContext = screen.getContext('2d');
screenContext.scale(data.screen.scale, data.screen.scale);
screenContext.translate(0.5, 0.5);
0;

// Buffer
data.projection.imageData = screenContext.createImageData(
    data.projection.width,
    data.projection.height
);
data.projection.buffer = data.projection.imageData.data;

/**
 * Cast degree to radian
 * @param {Number} degree
 */
function degreeToRadians(degree) {
    let pi = Math.PI;
    return (degree * pi) / 180;
}

/**
 * Color object
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} a
 */
function Color(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

/**
 * Draw pixel on buffer
 * @param {Number} x
 * @param {Number} y
 * @param {Color} color
 */
function drawPixel(x, y, color) {
    let offset = 4 * (Math.floor(x) + Math.floor(y) * data.projection.width);
    data.projection.buffer[offset] = color.r;
    data.projection.buffer[offset + 1] = color.g;
    data.projection.buffer[offset + 2] = color.b;
    data.projection.buffer[offset + 3] = color.a;
}

/**
 * Draw line into screen
 * @param {Number} x
 * @param {Number} y1
 * @param {Number} y2
 * @param {Color} color
 */
function drawLine(x, y1, y2, color) {
    for (let y = y1; y < y2; y++) {
        drawPixel(x, y, color);
    }
}

/**
 * Load textures
 */
function loadTextures() {
    for (let i = 0; i < data.textures.length; i++) {
        if (data.textures[i].id) {
            data.textures[i].data = getTextureData(data.textures[i]);
        }
    }
    for (let i = 0; i < data.floorTextures.length; i++) {
        if (data.floorTextures[i].id) {
            data.floorTextures[i].data = getTextureData(data.floorTextures[i]);
        }
    }
}

/**
 * Load backgrounds
 */
function loadBackgrounds() {
    for (let i = 0; i < data.backgrounds.length; i++) {
        if (data.backgrounds[i].id) {
            data.backgrounds[i].data = getTextureData(data.backgrounds[i]);
        }
    }
}

/**
 * Get texture data
 * @param {Object} texture
 */
function getTextureData(texture) {
    let image = document.getElementById(texture.id);
    let canvas = document.createElement('canvas');
    canvas.width = texture.width;
    canvas.height = texture.height;
    let canvasContext = canvas.getContext('2d');
    canvasContext.drawImage(image, 0, 0, texture.width, texture.height);
    let imageData = canvasContext.getImageData(
        0,
        0,
        texture.width,
        texture.height
    ).data;
    return parseImageData(imageData);
}

/**
 * Parse image data to a css rgb array
 * @param {array} imageData
 */
function parseImageData(imageData) {
    let colorArray = [];
    for (let i = 0; i < imageData.length; i += 4) {
        colorArray.push(
            new Color(imageData[i], imageData[i + 1], imageData[i + 2], 255)
        );
    }
    return colorArray;
}

/**
 * Draw texture
 * @param {*} x
 * @param {*} wallHeight
 * @param {*} texturePositionX
 * @param {*} texture
 */
function drawTexture(x, wallHeight, texturePositionX, texture) {
    let yIncrementer = (wallHeight * 2) / texture.height;
    let y = data.projection.halfHeight - wallHeight;

    let color = null;
    for (let i = 0; i < texture.height; i++) {
        if (texture.id) {
            color = texture.data[texturePositionX + i * texture.width];
        } else {
            color = texture.colors[texture.bitmap[i][texturePositionX]];
        }
        drawLine(x, y, Math.floor(y + (yIncrementer + 2)), color);
        y += yIncrementer;
    }
}

/**
 * Draw the background
 * @param {number} x
 * @param {number} y1
 * @param {number} y2
 * @param {Object} background
 */
function drawBackground(x, y1, y2, background) {
    let offset = x;
    for (let y = y1; y < y2; y++) {
        let textureX = Math.floor(offset % background.width);
        let textureY = Math.floor(y % background.height);
        let color = background.data[textureX + textureY * background.width];
        drawPixel(x, y, color);
    }
}

/**
 * Render buffer
 */
function renderBuffer() {
    let canvas = document.createElement('canvas');
    canvas.width = data.projection.width;
    canvas.height = data.projection.height;
    canvas.getContext('2d').putImageData(data.projection.imageData, 0, 0);
    screenContext.drawImage(canvas, 0, 0);
}

/**
 * Floorcasting
 * @param {*} x1
 * @param {*} wallHeight
 * @param {*} rayAngle
 */
function drawFloor(x1, wallHeight, rayAngle) {
    start = data.projection.halfHeight + wallHeight + 1;
    directionCos = Math.cos(degreeToRadians(rayAngle));
    directionSin = Math.sin(degreeToRadians(rayAngle));
    for (y = start; y < data.projection.height; y++) {
        // Create distance and calculate it
        distance = data.projection.height / (2 * y - data.projection.height);
        distance =
            distance /
            Math.cos(
                degreeToRadians(data.player.angle) - degreeToRadians(rayAngle)
            );

        // Get the tile position
        tilex = distance * directionCos;
        tiley = distance * directionSin;
        tilex += data.player.x;
        tiley += data.player.y;
        tile = data.map[Math.floor(tiley)][Math.floor(tilex)];

        // Get texture
        texture = data.floorTextures[tile];
        if (!texture) {
            continue;
        }

        // Define texture coords
        texture_x = Math.floor(tilex * texture.width) % texture.width;
        texture_y = Math.floor(tiley * texture.height) % texture.height;

        // Get pixel color
        color = texture.data[texture_x + texture_y * texture.width];
        drawPixel(x1, y, color);
    }
}

screenContext.imageSmoothingEnabled = false;

// Start
window.onload = function () {
    loadTextures();
    loadBackgrounds();
    main();
};

// Main loop
let mainLoop = null;

/**
 * Main loop
 */
function main() {
    mainLoop = setInterval(function () {
        clearScreen();
        movePlayer();
        rayCasting();
        renderBuffer();
    }, data.render.dalay);
}

/**
 * Window focus lost event
 */
window.addEventListener('blur', function (event) {
    if (mainLoop != null) {
        clearInterval(mainLoop);
        mainLoop = null;
        renderFocusLost();
    }
});

/**
 * Window focus
 */
screen.onclick = function () {
    if (!mainLoop) {
        main();
    }
};

/**
 * Render focus lost
 */
function renderFocusLost() {
    screenContext.fillStyle = 'rgba(0,0,0,0.5)';
    screenContext.fillRect(0, 0, data.projection.width, data.projection.height);
    screenContext.fillStyle = 'white';
    screenContext.font = '10px Lucida Console';
    screenContext.fillText('CLICK TO FOCUS', 37, data.projection.halfHeight);
}

/**
 * Raycasting logic
 */
function rayCasting() {
    let rayAngle = data.player.angle - data.player.halfFov;
    for (let rayCount = 0; rayCount < data.projection.width; rayCount++) {
        // Ray data
        let ray = {
            x: data.player.x,
            y: data.player.y,
        };

        // Ray path incrementers
        let rayCos =
            Math.cos(degreeToRadians(rayAngle)) / data.rayCasting.precision;
        let raySin =
            Math.sin(degreeToRadians(rayAngle)) / data.rayCasting.precision;

        // Wall finder
        let wall = 0;
        while (wall == 0) {
            ray.x += rayCos;
            ray.y += raySin;
            wall = data.map[Math.floor(ray.y)][Math.floor(ray.x)];
        }

        // Pythagoras theorem
        let distance = Math.sqrt(
            Math.pow(data.player.x - ray.x, 2) +
                Math.pow(data.player.y - ray.y, 2)
        );

        // Fish eye fix
        distance =
            distance * Math.cos(degreeToRadians(rayAngle - data.player.angle));

        // Wall height
        let wallHeight = Math.floor(data.projection.halfHeight / distance);

        // Get texture
        let texture = data.textures[wall - 1];

        // Calculate texture position
        let texturePositionX = Math.floor(
            (texture.width * (ray.x + ray.y)) % texture.width
        );

        // Draw
        drawBackground(
            rayCount,
            0,
            data.projection.halfHeight - wallHeight,
            data.backgrounds[0]
        );
        drawTexture(rayCount, wallHeight, texturePositionX, texture);
        drawFloor(rayCount, wallHeight, rayAngle);

        // Increment
        rayAngle += data.rayCasting.incrementAngle;
    }
}

/**
 * Clear screen
 */
function clearScreen() {
    screenContext.clearRect(
        0,
        0,
        data.projection.width,
        data.projection.height
    );
}

/**
 * Key down check
 */
document.addEventListener('keydown', (event) => {
    let keyCode = event.code;

    if (keyCode === data.key.up.code) {
        data.key.up.active = true;
    }
    if (keyCode === data.key.down.code) {
        data.key.down.active = true;
    }
    if (keyCode === data.key.left.code) {
        data.key.left.active = true;
    }
    if (keyCode === data.key.right.code) {
        data.key.right.active = true;
    }
});

/**
 * Key up check
 */
document.addEventListener('keyup', (event) => {
    let keyCode = event.code;

    if (keyCode === data.key.up.code) {
        data.key.up.active = false;
    }
    if (keyCode === data.key.down.code) {
        data.key.down.active = false;
    }
    if (keyCode === data.key.left.code) {
        data.key.left.active = false;
    }
    if (keyCode === data.key.right.code) {
        data.key.right.active = false;
    }
});

/**
 * Movement
 */
function movePlayer() {
    if (data.key.up.active) {
        let playerCos =
            Math.cos(degreeToRadians(data.player.angle)) *
            data.player.speed.movement;
        let playerSin =
            Math.sin(degreeToRadians(data.player.angle)) *
            data.player.speed.movement;
        let newX = data.player.x + playerCos;
        let newY = data.player.y + playerSin;
        let checkX = Math.floor(newX + playerCos * data.player.radius);
        let checkY = Math.floor(newY + playerSin * data.player.radius);

        // Collision detection
        if (data.map[checkY][Math.floor(data.player.x)] == 0) {
            data.player.y = newY;
        }
        if (data.map[Math.floor(data.player.y)][checkX] == 0) {
            data.player.x = newX;
        }
    }
    if (data.key.down.active) {
        let playerCos =
            Math.cos(degreeToRadians(data.player.angle)) *
            data.player.speed.movement;
        let playerSin =
            Math.sin(degreeToRadians(data.player.angle)) *
            data.player.speed.movement;
        let newX = data.player.x - playerCos;
        let newY = data.player.y - playerSin;
        let checkX = Math.floor(newX - playerCos * data.player.radius);
        let checkY = Math.floor(newY - playerSin * data.player.radius);

        // Collision detection
        if (data.map[checkY][Math.floor(data.player.x)] == 0) {
            data.player.y = newY;
        }
        if (data.map[Math.floor(data.player.y)][checkX] == 0) {
            data.player.x = newX;
        }
    }
    if (data.key.left.active) {
        data.player.angle -= data.player.speed.rotation;
        data.player.angle %= 360;
    }
    if (data.key.right.active) {
        data.player.angle += data.player.speed.rotation;
        data.player.angle %= 360;
    }
}
