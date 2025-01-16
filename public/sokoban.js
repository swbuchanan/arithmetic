var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var levels = [
    [
        '#####....',
        '#...#####',
        '#.#....G#',
        '#...#.###',
        '##....#.',
        ' #B##.#.',
        ' #....#.',
        ' #@.###.',
        ' ####...',
    ],
    [
        '..#################  ',
        '.#G...............#..',
        '..#.#.#.#.#########..',
        '..#...#.#.......#....',
        '..#.#.#.#.#.#.#.#....',
        '.####.#.#.#.#.#.###..',
        '.#......#.#.#.B...#..',
        '.#..###...#..@###.###',
        '.##.#.###.#.###.....#',
        '..#.....#.......###.#',
        '..#.#.#.#.#######...#',
        '..#.#.#...........###',
        '..#...#.#########.#..',
        '..###.............#..',
        '....#.##.##########..',
        '....#....#...........',
        '....######...........'
    ],
    [
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '......................####...........................................',
        '......................#..###.........................................',
        '.....................##..............................................',
        '...............#######..#######......................................',
        '...............#........#G...........................................',
        '...............#.######.#######......................................',
        '...............#..#.........#........................................',
        '...............##.#..##.###.#........................................',
        '...............#..##..B@#...#........................................',
        '...............#.##...#.#...#........................................',
        '.............###....###.###.#........................................',
        '.............#...####.#.###.#........................................',
        '.............#..............#........................................',
        '.............#..#.###.#.#.#.#........................................',
        '.............####...#.....#..........................................',
        '....................#######..........................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................',
        '.....................................................................'
    ],
    [
        '.....................',
        '........#####........',
        '........#.B.#........',
        '........#..@#........',
        '........#####........',
    ]
];
// Find the maximum width and height over all levels
var maxLevelWidth = 0;
var maxLevelHeight = 0;
for (var i = 0; i < levels.length; i++) {
    if (levels[i].length > maxLevelHeight) {
        maxLevelHeight = levels[i].length;
    }
    for (var j = 0; j < levels[i].length; j++) {
        if (levels[i][j].length > maxLevelWidth) {
            maxLevelWidth = levels[i][j].length;
        }
    }
}
// Make sure that the grid is square and fits every level
var gameHeight = Math.round(windowHeight * .9);
var gameWidth = Math.round(windowWidth * .9);
var tileWidth = Math.round(Math.min(gameWidth / maxLevelWidth, gameHeight / maxLevelHeight));
var tileHeight = tileWidth;
var currentLevel = 0;
var drawnObject = /** @class */ (function () {
    function drawnObject(gridx, gridy, width, height, color, pushable, isGoal) {
        if (isGoal === void 0) { isGoal = false; }
        this.gridx = gridx;
        this.gridy = gridy;
        this.x = gridx * tileWidth;
        this.y = gridy * tileHeight;
        this.width = width;
        this.height = height;
        this.color = color;
        this.pushable = pushable;
        this.isGoal = isGoal;
    }
    drawnObject.prototype.newGridPos = function (newx, newy) {
        this.gridx = newx;
        this.gridy = newy;
        this.x = newx * tileWidth;
        this.y = newy * tileHeight;
    };
    drawnObject.prototype.draw = function (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    return drawnObject;
}());
var Game = /** @class */ (function () {
    function Game(grid) {
        this.grid = grid;
        this.player = new drawnObject(this.findPlayerPosition().x, this.findPlayerPosition().y, tileWidth, tileHeight, 'blue', false);
        console.log(this.player);
        this.obstacles = [];
        this.findObstacles();
        console.log(this.obstacles);
        this.currentLevel = 0;
        // Create canvas element and context
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = gameWidth;
        this.canvas.height = gameHeight;
        document.body.appendChild(this.canvas);
        // Add event listener for player input
        window.addEventListener('keydown', this.handleInput.bind(this));
        window.addEventListener('click', this.handleMouseInput.bind(this));
    }
    Game.prototype.findObstacles = function () {
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] === '#') {
                    this.obstacles.push(new drawnObject(x, y, tileWidth, tileHeight, 'gray', false));
                }
                if (this.grid[y][x] === 'B') {
                    this.obstacles.push(new drawnObject(x, y, tileWidth, tileHeight, 'brown', true));
                }
                if (this.grid[y][x] === 'G') {
                    this.obstacles.push(new drawnObject(x, y, tileWidth, tileHeight, 'green', true, true));
                }
            }
        }
    };
    // Use the arrow keys to move
    Game.prototype.handleInput = function (event) {
        switch (event.key) {
            case 'ArrowLeft':
                this.movePlayer(-1, 0);
                break;
            case 'ArrowRight':
                this.movePlayer(1, 0);
                break;
            case 'ArrowUp':
                this.movePlayer(0, -1);
                break;
            case 'ArrowDown':
                this.movePlayer(0, 1);
                break;
            default:
                break;
        }
    };
    // Use the mouse to edit a level
    Game.prototype.handleMouseInput = function (event) {
    };
    Game.prototype.getObstacleAtPosition = function (x, y) {
        for (var _i = 0, _a = this.obstacles; _i < _a.length; _i++) {
            var obstacle = _a[_i];
            if (obstacle.gridx === x && obstacle.gridy === y) {
                return obstacle;
            }
        }
        return null;
    };
    Game.prototype.findPlayerPosition = function () {
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] === '@') {
                    console.log("hi");
                    return { x: x, y: y };
                }
            }
        }
        throw new Error("Player not found in grid.");
    };
    Game.prototype.pushObject = function (thing, dx, dy) {
        var newPosition = { x: thing.gridx + dx, y: thing.gridy + dy };
        // Can't move through walls or out of bounds
        if (this.isOutOfBounds(newPosition) || this.isWall(newPosition)) {
            return false;
        }
        // Can't push an object into another object, unless that object is the goal
        if (this.getObstacleAtPosition(newPosition.x, newPosition.y) !== null) {
            if (this.getObstacleAtPosition(newPosition.x, newPosition.y).isGoal) {
                this.currentLevel++;
                this.changeLevel(levels[this.currentLevel]);
            }
            return false;
        }
        // Update the grid
        this.grid[newPosition.y][newPosition.x] = this.grid[thing.gridy][thing.gridx];
        this.printGrid();
        // Move the thing
        thing.newGridPos(newPosition.x, newPosition.y);
        return true;
    };
    Game.prototype.movePlayer = function (dx, dy) {
        var newPosition = { x: this.player.gridx + dx, y: this.player.gridy + dy };
        // Can't move through walls or out of bounds
        if (this.isOutOfBounds(newPosition) || this.isWall(newPosition)) {
            return;
        }
        // Check if we are moving into an object
        var obstacle = this.getObstacleAtPosition(newPosition.x, newPosition.y);
        if (obstacle !== null) {
            // Try to push the object
            if (!this.pushObject(obstacle, dx, dy)) {
                return;
            }
        }
        // Update the state array
        this.grid[this.player.gridy][this.player.gridx] = '.';
        this.grid[newPosition.y][newPosition.x] = '@';
        // Update the player's position
        this.player.newGridPos(newPosition.x, newPosition.y);
    };
    Game.prototype.isOutOfBounds = function (position) {
        return position.x < 0 || position.x >= this.grid[0].length || position.y < 0 || position.y >= this.grid.length;
    };
    Game.prototype.isWall = function (position) {
        return this.grid[position.y][position.x] === '#';
    };
    Game.prototype.changeLevel = function (level) {
        this.grid = [];
        for (var _i = 0, level_1 = level; _i < level_1.length; _i++) {
            var str = level_1[_i];
            this.grid.push(str.split(''));
        }
        this.updateGrid();
    };
    Game.prototype.updateGrid = function () {
        this.obstacles = [];
        this.findObstacles();
        this.player.newGridPos(this.findPlayerPosition().x, this.findPlayerPosition().y);
    };
    Game.prototype.printGrid = function () {
        for (var _i = 0, _a = this.grid; _i < _a.length; _i++) {
            var row = _a[_i];
            console.log(row.join(''));
        }
    };
    Game.prototype.gameLoop = function () {
        var _this = this;
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw the player
        this.player.draw(this.ctx);
        // Draw the obstacles
        for (var _i = 0, _a = this.obstacles; _i < _a.length; _i++) {
            var obstacle = _a[_i];
            obstacle.draw(this.ctx);
        }
        // Request the next animation frame
        requestAnimationFrame(function () { return _this.gameLoop(); });
    };
    return Game;
}());
var grid = levels[0];
var grid1 = [];
for (var _i = 0, grid_1 = grid; _i < grid_1.length; _i++) {
    var str = grid_1[_i];
    grid1.push(str.split(''));
}
var game = new Game(grid1);
game.printGrid(); // prints the initial grid
game.gameLoop();
