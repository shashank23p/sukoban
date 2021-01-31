"use strict";
const WALL_CHAR = "#";
const BLANK_CHAR = ".";
const PLAYER_CHAR = "S";
const BOX_CHAR = "B";
const TARGET_CHAR = "T";
const sukoban = (input) => {
  const inputArray = input.split(/\r?\n/);
  const [integers, ...maze] = inputArray;
  const [r, c] = integers.split(" ");
  if (!r || !c)
    return {
      error:
        "Line 1 of Input should be two integers seprated by space, Represention number of rows and coloums of maze",
    };
  //creating matrix represntaion of maze
  const {
    mazeMatrix,
    targetPosition,
    playerPosition,
    boxPosition,
    mazeMatrixError,
  } = getMatixMaze(maze, r, c);
  if (mazeMatrixError) return { error: mazeMatrixError };
  if (!mazeMatrix) return { error: "Input is not valid" };
  const startPosition = [...playerPosition, ...boxPosition];

  //getting all possinle vertex for S
  //player can be anywhere where there is no #
  const possibleS = [];
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      if (mazeMatrix[i][j] !== WALL_CHAR) possibleS.push([i, j]);
    }
  }
  //all possible vertex for B will be same
  const possibleB = [...possibleS];

  //creating array of all vertices of graph
  const vertices = [];
  for (let i = 0; i < possibleS.length; i++) {
    for (let j = 0; j < possibleB.length; j++) {
      if (possibleS[i] !== possibleB[j])
        vertices.push([...possibleS[i], ...possibleB[j]]);
    }
  }

  //creating graph represntaion all vertices and possibles moves
  //from vertex to another vertex as edge
  const adjList = getAdjecentListGraph(vertices);

  //getting optimal solution with minimum pushes using bfs
  const { finalPushes, finalWalks, pathsFound, bestPath } = bfs(
    adjList,
    startPosition,
    targetPosition
  );

  //outputing
  return {
    pushes: finalPushes,
    walks: finalWalks,
    pathsFound,
    bestPath,
    mazeMatrix,
    startPosition,
  };
};
//function to create matrix representation of maze
function getMatixMaze(maze, r, c) {
  try {
    if (maze.length != r)
      return {
        mazeMatrixError: `Invalid number of rows, Maze have ${maze.length} rows while inputed row count is ${r}`,
      };
    let targetPosition, boxPosition, playerPosition;
    const mazeMatrix = [];
    for (let i = 0; i < r; i++) {
      mazeMatrix[i] = maze[i].split("");
      if (mazeMatrix[i].length != c)
        return { mazeMatrixError: "Invalid number of Colums at row:" + i };
      if (mazeMatrix[i].indexOf(TARGET_CHAR) != -1)
        targetPosition = [i, mazeMatrix[i].indexOf(TARGET_CHAR)];
      if (mazeMatrix[i].indexOf(PLAYER_CHAR) != -1)
        playerPosition = [i, mazeMatrix[i].indexOf(PLAYER_CHAR)];

      if (mazeMatrix[i].indexOf(BOX_CHAR) != -1)
        boxPosition = [i, mazeMatrix[i].indexOf(BOX_CHAR)];
    }
    if (!targetPosition)
      return { mazeMatrixError: `Missing Target ${TARGET_CHAR}` };
    if (!playerPosition)
      return { mazeMatrixError: `Missing Player Position ${PLAYER_CHAR}` };
    if (!boxPosition)
      return { mazeMatrixError: `Missing Box Position ${BOX_CHAR}` };
    return { mazeMatrix, targetPosition, playerPosition, boxPosition };
  } catch (error) {
    console.error(error);
    return { mazeMatrixError: "Invalid Input" };
  }
}
function getAdjecentListGraph(vertices) {
  const adjList = new Map();
  for (let i = 0; i < vertices.length; i++) {
    adjList.set(vertices[i].toString(), []);
    for (let j = 0; j < vertices.length; j++) {
      if (i === j) continue; //if same node ignore
      const playerRowMoves = vertices[i][0] - vertices[j][0];
      const playerColumnMoves = vertices[i][1] - vertices[j][1];
      const boxRowMoves = vertices[i][2] - vertices[j][2];
      const boxColumnMoves = vertices[i][3] - vertices[j][3];

      //count of moves in both rows and colums combaine
      const totalPlayerMoves =
        Math.abs(playerColumnMoves) + Math.abs(playerRowMoves);
      const totalBoxMoves = Math.abs(boxColumnMoves) + Math.abs(boxRowMoves);

      //if box or player moves two stpes ignore
      if (totalPlayerMoves != 1 || totalBoxMoves > 1) continue;
      if (totalBoxMoves == 1) {
        //boxMoved: for push player current position should be boxed previos postion
        if (
          vertices[j][0] != vertices[i][2] ||
          vertices[j][1] != vertices[i][3]
        )
          continue;
        //check if player and boxed move in same direction otherwise ignore
        if (
          playerRowMoves != boxRowMoves ||
          playerColumnMoves != boxColumnMoves
        )
          continue;
      }
      adjList.get(vertices[i].toString()).push(vertices[j].toString());
    }
  }
  return adjList;
}

function bfs(adjList, start, target) {
  let finalWalks = -1;
  let finalPushes = -1;
  let pathsFound = 0;
  let bestPath = [];
  const vistedPushesWalks = {};
  const queue = [
    { vertex: start.toString(), path: [start.toString()], pushes: 0, walks: 0 },
  ];
  const visited = new Set();
  while (queue.length > 0) {
    const currentObject = queue.shift();
    const currentPosition = currentObject.vertex;
    const currentWalks = currentObject.walks;
    const currentPushes = currentObject.pushes;
    let currentArray = currentPosition.split(",");

    //cheking if target is reached
    if ([currentArray[2], currentArray[3]].toString() == target.toString()) {
      pathsFound++;
      if (
        finalPushes == -1 ||
        finalPushes > currentObject.pushes ||
        (finalPushes == currentObject.pushes &&
          (finalWalks == -1 || finalWalks > currentObject.walks))
      ) {
        finalPushes = currentObject.pushes;
        finalWalks = currentObject.walks;
        bestPath = [...currentObject.path];
      }
    }

    const childrens = adjList.get(currentPosition);

    childrens.forEach((children) => {
      let pushes = currentPushes;
      let walks = currentWalks;
      //increment push if its push move
      if (isPush(currentPosition, children)) pushes++;
      else walks++; //else increment walk

      //cheaking if node is not visited or visted with more pushes and walks
      if (
        !visited.has(children) ||
        vistedPushesWalks[children].pushes > pushes ||
        (vistedPushesWalks[children].pushes == pushes &&
          vistedPushesWalks[children].walks > walks)
      ) {
        visited.add(children);
        vistedPushesWalks[children] = { pushes, walks };
        queue.push({
          vertex: children,
          path: [...currentObject.path, children],
          pushes,
          walks,
        });
      }
    });
  }

  return { finalPushes, finalWalks, pathsFound, bestPath };
}

//function to change if move is push move
function isPush(lastPosition, currentPosition) {
  const currentArray = currentPosition.split(",");
  const lastArray = lastPosition.split(",");
  if (
    currentArray[2] - lastArray[2] == 0 &&
    currentArray[3] - lastArray[3] == 0
  )
    return false;
  return true;
}
export { sukoban };
