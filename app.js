const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      jersey_number AS jerseyNumber,
      role
    FROM
      cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//(API 2)

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const insertPlayerQuery = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES ('${playerName}', ${jerseyNumber}, '${role}');`;

  try {
    await db.run(insertPlayerQuery);
    response.send("Player Added to Team");
  } catch (e) {
    response.status(500).send("Internal Server Error");
  }
});

// (API 3)

app.get("/players/:playerId/", async (request, response) => {
  const playerId = request.params.playerId;

  const getPlayerQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      jersey_number AS jerseyNumber,
      role
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;

  try {
    const player = await db.get(getPlayerQuery);

    if (player) {
      response.send(player);
    } else {
      response.status(404).send("Player not found");
    }
  } catch (e) {
    response.status(500).send("Internal Server Error");
  }
});

// (API 4)

app.put("/players/:playerId/", async (request, response) => {
  const playerId = request.params.playerId;
  const { playerName, jerseyNumber, role } = request.body;

  const updatePlayerQuery = `
    UPDATE cricket_team
    SET
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
    WHERE
      player_id = ${playerId};`;

  try {
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (e) {
    response.status(500).send("Internal Server Error");
  }
});

// (API 5)

app.delete("/players/:playerId/", async (request, response) => {
  const playerId = request.params.playerId;

  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE
      player_id = ${playerId};`;

  try {
    await db.run(deletePlayerQuery);
    response.send("Player Removed");
  } catch (e) {
    response.status(500).send("Internal Server Error");
  }
});

module.exports = app;
