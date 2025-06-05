## 📋 Project Info

This is a real-time Pokémon PVP game built with **Node.js**. Users can select their Pokémon and battle other players in interactive multiplayer rooms.

📌 **Note**: This project was completed in **2020**, during my **3rd year at the University of Saskatchewan**.

- **Youtube demo link**: https://youtu.be/n0op8SBGiAo

- **Github code link**: https://github.com/EvanHuang7/nodeJsPokemon

## 🛠️ Tech Stack

Node.js, JavaScript, socket.io and mySQL

## ⚙️ Start Project

1. Start mySql server with command line `sudo /usr/local/mysql/support-files/mysql.server start` in mac terminal.

2. Open **MYSQLWorkbench** app and create a new connection called `pokemon` and set password to `123456789`.

3. Click into `pokemon` connection, create a new schema called `pokemon` and set it to default schema.

4. Copy all `CREATE TABLE` queries in `mysql.text` file and run them in the query tab of `pokemon` schema.

5. After creating all mySql tables, we can run `npx nodemon app.js` command line to start project.
    - **Note**: Remember to install all necessary modules by running `npm install` command line first

6. After project is running, we go to `http://localhost:8080/` page and register 2 accounts first, so that we can run the rest of `INSERT` queries in `mysql.text` file to add pokemons for these 2 users latter.

7. After 2 users are registered, copy all the rest of `INSERT` queries in `mysql.text` file and run them in the query tab of `pokemon` schema.

8. After creating pokemons for these 2 users, we can create a PVP room and 2 users select same PVP room to start a PVP game.

9. Now, it's time for a PVP pokemon fight!!

10. After project is done, Remeber to shut down mySql server with command line `sudo /usr/local/mysql/support-files/mysql.server stop` in mac terminal.
