const rawBoardStrings = [
    "....................\n....................\n.........######.....\n...........A..#..B..\n.........######.....\n....................\n....................",
    ".......#............\n.....#.#............\n....#..#............\nA..#..#............B\n....#..#....#.......\n.....#..#..#........\n......#...#.........",
    "....................\n..........#.........\n.......##..#........\n......#.A#.#........\n......#.#..#........\n......#...#.........\n.......###.........B",
    "A.#.......#......#..\n#.#.#####.#.####.#..\n..#.....#.#....#....\n.##.###.######.#####\n..#.B#..#....#...#..\n#.####.##.##.#.#.##.\n...........#...#....",
    "mmmmmffffrrrrrrrrArrrrrrrrrrrrrrfffmmmmm\nmmmffffffffrrrrrrrrrrrrrrrrrrrrfffffmmmm\nmmfffffffffffffffffffffffffffrffffffmmmm\nmmfffffffffffffwwwwwfffffffffrfffffffmmm\nmfffffffffffffwwwwwwwffffffffrffffffmmmm\nmmffffffffffffwwwwwwwffrrrrrrrrrrrrrmmmm\nmmmffffffffffffwwwwwffffffffffffrffffmmm\nmmffffffffffffffffffffffffffffffrfffffmm\nmmffffffffggggggggggggggggggggggggffffmm\nmmmffffggggggggggBggggggggggggggggggffmm",
    "ffffffffffgggrgggggggrggggfffffffrrfffff\nffAffffffgggrrggggggrrggffffffffrrffffff\nffffffgggggrrggggggrrgggffffrrrrrfffffff\ngggggggggggrggggrrrrgggffffrrfffffffffff\ngggggrrrrrrrrrrrrgggggffffrrffffffffffff\nggggrrgggggrggggggggffffffrfffffffffffff\ngggrrggggggrrggggggffffrrrrrrfffffffffff\nggrrgggffgggrrrrggffrrrrfrffrrrrrfffffff\nggrggffffffffffrrrrrrffffrffffffrrffffff\nggrgfffffffffffffffffffffrffBffffrrfffff",
    "gggggggggwwwgggggmmmmmmmmmmBrrrrrrrmmmmm\ngggggggggwwwwggggmmmmmmmmmmmmmmmmmrmgggg\nggggggggggwwwwggggmmmmmmmmmmmmmmggrggggg\nffgggggggggwwwwggggmmmmmmmmmggggggrrgggg\nffggggggggggwwwwwwwwwwwwwggggggggggrrrrr\nffffggggggggggwwwwwwwwwwwwwggggggggggggg\nffffffgggggggggggggggggwwwwwwggggggmmmmm\nfAfffffffffgggggggggmmmmmmwwwwmmmmmmmmmm\nfffffffffffffffmmmmmmmmmmmmmwwwmmmmmmmmm\nffffffffffmmmmmmmmmmmmmmmmmmwwwmmmmmmmmm",
    "wwwwwggggggggggggggggggggggggggggggrrrrr\nwwwwwwwgggggggggggggggggggggwwwwwgrrgggg\nwwwwwwwwwwwgggAgggggggwwwwwwwwwwwwrwgggg\nwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwrwwwww\nwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwrwwwww\nwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwrrwwwww\nwwwwwwwwgggggBgggggwwwwwwwwwwwwwwrwwwwww\nwwwwggggggffffffgggggggggwwwwwwwwrwwwwww\nwwggggffffffffffffffggggggggggggrrgwwwww\nwgggfffrrrrrrrrrrrrrrrrrrrrrrrrrrggggggg"
];

//const boardRows = rawBoard1String1.split("\n");
const root = document.getElementById("root");
root.appendChild(dashboard());
const board = document.createElement("board");
root.appendChild(board);

let startTile = null;
let goalTile = null;
let boardRows = null;

let queue = [];
let path = [];
let algorithm = "A*";

// Just for adding classNames for styling, as "." is not a valid className
const tileTypes = {
    ".": "dot",
    "#": "hash",
    "A": "a",
    "B": "b",
    "w": "w",
    "m": "m",
    "f": "f",
    "g": "g",
    "r": "r"
};

const tileWeights = {
    ".": 1,
    "#": 1,
    "A": 1,
    "B": 1,
    "w": 100,
    "m": 50,
    "f": 10,
    "g": 5,
    "r": 1
};

// Initializes the grid inside the browser
function init(rawBoard) {
    clear();
    boardRows = rawBoard.split("\n");
    for (let y = 0; y < boardRows.length; y++) {
        const row = document.createElement("row");
        for (let x = 0; x < boardRows[y].length; x++) {
            const type = boardRows[y][x];
            const tile = document.createElement("tile");
            tile.isOpen = true;
            if (type === "#") {
                tile.isOpen = false;
            } else if (type === "B") {
                goalTile = tile;
                tile.isGoal = true;
            } else if (type === "A") {
                startTile = tile;
                startTile.cost = 0;
            }
            tile.col = x;
            tile.row = y;
            tile.weight = tileWeights[type];
            tile.className = tileTypes[type];
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

function clear() {
    queue = [];
    path = [];
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }
}

// Change input to get desired board
init(rawBoardStrings[0]);

// Starts the algorithm
searchFrom(startTile);

// Recursively calls itself until it has found the shortest path
function searchFrom(tile) {
    tile.isOpen = false;
    if (tile !== startTile && tile !== goalTile) {
        tile.classList.add("closed");
        tile.classList.remove("open");
    }
    queue = queue.concat(getAdjacent(tile));
    queue = queue.filter(tile => tile.isOpen);
    queue.forEach(tile => tile.classList.add("open"));

    if (algorithm !== "BFS") {
        queue = queue.sort((x, y) => (x.cost + heuristic(x)) - (y.cost + heuristic(y)));
    }
    if (tile.isGoal) {
        console.log(tile.cost);
        getPathFrom(tile);
    } else {
        // Set timeout-param to a higher value if you want to see it in slo-mo,
        // remove setTimeout "wrapper" to get result "instantly"
        setTimeout(() => searchFrom(queue[0]), 0);
    }
}

// Finds the path back to start
function getPathFrom(tile) {
    tile.classList.add("path");
    path.push(tile);
    if (tile.parent !== undefined) {
        getPathFrom(tile.parent);
    }
}

function heuristic(tile) {
    if (algorithm === "A*") {
        return Math.abs(tile.row - goalTile.row) + Math.abs(tile.col - goalTile.col)
    }
    return 0
}

// Returns the specified tile
function getTile(row, col, parent) {
    if (row < 0 || row > boardRows.length || col < 0 || col > boardRows[0].length) {
        return {isOpen: false};
    }
    try {
        const tile = board.childNodes[row].childNodes[col];
        if (tile.cost === undefined || parent.cost + tile.weight < tile.cost) {
            tile.cost = parent.cost + tile.weight;
            tile.parent = parent;
        }
        tile.cost = parent.cost + tile.weight;
        return tile
    } catch {
        return {isOpen: false};
    }
}

// Returns a list of the adjacent tiles to the specific tile
function getAdjacent(tile) {
    let adjacent = [];
    adjacent.push(getTile(tile.row, tile.col - 1, tile));
    adjacent.push(getTile(tile.row, tile.col + 1, tile));
    adjacent.push(getTile(tile.row - 1, tile.col, tile));
    adjacent.push(getTile(tile.row + 1, tile.col, tile));
    return adjacent;
}

// Creates a dashboard for selecting algorithm and board
function dashboard() {
    const dashboard = document.createElement("dashboard");
    const buttons = document.createElement("buttons");
    for (let i = 0; i < rawBoardStrings.length; i++) {
        const button = document.createElement("button");
        button.appendChild(document.createTextNode("Board " + (i+1)));
        button.onclick = () => {
            init(rawBoardStrings[i]);
            searchFrom(startTile);
        };
        buttons.appendChild(button);
    }
    dashboard.appendChild(buttons);

    const radioGroup = document.createElement("radio-group");

    const radioButton1 = document.createElement("input");
    radioButton1.type = "radio";
    radioButton1.name = "algorithm";
    radioButton1.checked = "checked";
    radioButton1.onclick = () => algorithm = "A*";
    radioGroup.appendChild(radioButton1);
    radioGroup.appendChild(document.createTextNode("A*"));

    const radioButton2 = document.createElement("input");
    radioButton2.type = "radio";
    radioButton2.name = "algorithm";
    radioButton2.onclick = () => algorithm = "Dijkstra";
    radioGroup.appendChild(radioButton2);
    radioGroup.appendChild(document.createTextNode("Dijkstra"));

    const radioButton3 = document.createElement("input");
    radioButton3.type = "radio";
    radioButton3.name = "algorithm";
    radioButton3.onclick = () => algorithm = "BFS";
    radioGroup.appendChild(radioButton3);
    radioGroup.appendChild(document.createTextNode("BFS"));

    dashboard.appendChild(radioGroup);

    return dashboard
}
