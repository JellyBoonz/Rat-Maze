const axios = require("axios");

const API_BASE_URL = "http://api.milabs.xyz/v1/rat";
const MAZE_ID = "Practice6";
const options = {
    headers: {
        "X-API-KEY": "3B539A2AC8A34CFB",
        "Content-Type": "application/json",
    },
};

async function getSurroundings() {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/${MAZE_ID}/surroundings`,
            options
        );
        return response.data.surroundings;
    } catch (error) {
        console.error("Error in getSurroundings:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        throw error;
    }
}

async function exit() {
    try {
        const payload = {
            mazeId: MAZE_ID,
        };
        const response = await axios.post(
            `${API_BASE_URL}/exit`,
            payload,
            options
        );
        return response.data;
    } catch (error) {
        console.error(`Error in exit:`, error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        throw error;
    }
}

async function move(direction) {
    try {
        const payload = {
            mazeId: MAZE_ID,
            direction: direction.toUpperCase(),
        };
        const response = await axios.post(
            `${API_BASE_URL}/move`,
            payload,
            options
        );
        return response.data;
    } catch (error) {
        console.error(`Error in move (${direction}):`, error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        throw error;
    }
}

async function eat() {
    try {
        const payload = {
            mazeId: MAZE_ID,

        };
        const response = await axios.post(
            `${API_BASE_URL}/eat`,
            payload,
            options
        );
        return response.data;
    } catch (error) {
        console.error(`Error in eat:`, error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        throw error;
    }
}

// Helper function to get the opposite direction for backtracking
function getOppositeDirection(direction) {
    switch (direction) {
        case "north":
            return "south";
        case "south":
            return "north";
        case "east":
            return "west";
        case "west":
            return "east";
        default:
            return null;
    }
}

async function dfs(x, y, path, visited) {
    const key = `${x},${y}`;
    let exited = false;
    if (visited.has(key)) return false; // Skip already visited cells
    visited.add(key); // Mark cell as visited

    let surroundings;
    try {
        surroundings = await getSurroundings();
    } catch (error) {
        console.error("Failed to get surroundings, retrying...");
        return false;
    }

    // Try each direction and explore paths recursively
    for (const [direction, status] of Object.entries(surroundings)) {
        if (status === "Exit") {
            console.log("Found the exit!");
            exited = true;
            await move(direction);
            await exit();
            return [...path, direction]; // Found exit, return path to it
        }
        if (status === "Open") {
            let newX = x,
                newY = y;
            switch (direction) {
                case "north":
                    newY--;
                    break;
                case "east":
                    newX++;
                    break;
                case "south":
                    newY++;
                    break;
                case "west":
                    newX--;
                    break;
            }
            if (!exited) {
                await move(direction);
            }
            // Recursively explore the new position
            const result = await dfs(newX, newY, [...path, direction], visited);
            if (result) {
                return result; // Found exit in recursive path
            }

            // If we hit a dead end, backtrack
            const reverseDirection = getOppositeDirection(direction);
            await move(reverseDirection);
        }
    }

    // No path found, return false
    return false;
}

async function navigateMaze() {
    const visited = new Set();
    try {
        const path = await dfs(0, 0, [], visited);
        if (path) {
            console.log("Path to exit:", path);
            for (const direction of path) {
                await move(direction); // Move according to the path to exit
            }
            console.log("Reached the exit!");
        } else {
            console.log("No path to exit found");
        }
    } catch (error) {
        console.error("Error in navigateMaze:", error.message);
    }
}

navigateMaze().catch(console.error);