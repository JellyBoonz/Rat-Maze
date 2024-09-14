const axios = require('axios');

const API_BASE_URL = 'http://api.milabs.xyz/v1/rat';
const MAZE_ID = 'Practice1';
const options = {
    headers: {
        'X-API-KEY': '3B539A2AC8A34CFB',
        'Content-Type': 'application/json'
    }
};

async function getSurroundings() {
    try {
        const response = await axios.get(`${API_BASE_URL}/${MAZE_ID}/surroundings`, options);
        return response.data.surroundings;
    } catch (error) {
        console.error('Error in getSurroundings:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

async function move(direction) {
    try {
        const payload = {
            mazeId: MAZE_ID,
            direction: direction.toUpperCase()
        };
        const response = await axios.post(`${API_BASE_URL}/move`, payload, options);
        return response.data;
    } catch (error) {
        console.error(`Error in move (${direction}):`, error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

async function dfs() {
    const visited = new Set();
    const stack = [{ x: 0, y: 0, path: [] }];

    while (stack.length > 0) {
        const { x, y, path } = stack.pop();
        const key = `${x},${y}`;

        if (visited.has(key)) continue;
        visited.add(key);

        let surroundings;
        try {
            surroundings = await getSurroundings();
        } catch (error) {
            console.error('Failed to get surroundings, retrying...');
            continue;
        }

        for (const [direction, status] of Object.entries(surroundings)) {
            if (status === 'Exit') {
                console.log('Found the exit!');
                return [...path, direction];
            }

            if (status === 'Open' || status === 'Cheese') {
                let newX = x, newY = y;
                switch (direction) {
                    case 'north': newY--; break;
                    case 'south': newY++; break;
                    case 'east': newX++; break;
                    case 'west': newX--; break;
                }

                stack.push({
                    x: newX,
                    y: newY,
                    path: [...path, direction]
                });
            }
        }

        if (path.length > 0) {
            try {
                await move(path[path.length - 1]);
            } catch (error) {
                console.error('Failed to move, retrying...');
                continue;
            }
        }
    }

    console.log('No path to exit found');
    return null;
}

async function navigateMaze() {
    try {
        const path = await dfs();
        if (path) {
            console.log('Path to exit:', path);
            for (const direction of path) {
                await move(direction);
            }
            console.log('Reached the exit!');
        }
    } catch (error) {
        console.error('Error in navigateMaze:', error.message);
    }
}

navigateMaze().catch(console.error);