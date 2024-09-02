# bomberman-dom

This project has been made according to the task described [here](https://github.com/01-edu/public/tree/master/subjects/bomberman-dom).

## Project Description
This is a bomberman alike game, where multiple players can join in and battle until one of them is the last man standing. There is also a live chat that enables players to talk to each other. 

Be aware of that in this project I was not allowed to use canvas, neither Web-GL nor another framework. For this project I had to use my own framework I did on the mini-framework [project](https://github.com/01-edu/public/tree/master/subjects/mini-framework).

### Game 
- **Number of Players:** The game supports 2 to 4 players.
- **Player Lives:** Each player starts with 3 lives.
- **Types of Blocks:**
  - **Walls:** Indestructible blocks placed statically on the map.
  - **Soft-Walls:** Destructible blocks generated randomly on the map.
- **Player Starting Positions:** Players start in the corners and are ensured that they have space to survive even if they place a bomb at the beginning.
- **Power-Ups:** There are three types of power ups (each time a player destroys a soft-wall, a random power up may or may not appear)
  - **Bombs:** Increases the amount of bombs dropped at a time by 1.
  - **Flames:** Increases the range of bomb explosions in four directions by 1 block.
  - **Speed:** Increases the movement speed of the player for the next 10 seconds.

## How to use
- You should have Docker installed. 
- To build images and run the container type in your terminal: bash ./docker_build_and_run.sh
- Then open localhost:3000 in your browser to visit the game.

## Author
- [Elina Tomson](https://github.com/elinatomson)
