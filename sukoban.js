"use strict";

//function to create matrix representation of maze
function getMatixMaze(maze, r, c) {
  try {
    let targetPosition, boxPosition, playerPosition;
    const mazeMatrix = [];
    for (let i = 0; i < r; i++) {
      mazeMatrix[i] = maze[i].split("");
      if (mazeMatrix[i].length != c)
        return { mazeMatrixError: "Invalid number of Colums at row:" + i };
      if (mazeMatrix[i].indexOf("T") != -1)
        targetPosition = [i, mazeMatrix[i].indexOf("T")];
      if (mazeMatrix[i].indexOf("S") != -1)
        playerPosition = [i, mazeMatrix[i].indexOf("S")];

      if (mazeMatrix[i].indexOf("B") != -1)
        boxPosition = [i, mazeMatrix[i].indexOf("B")];
    }
    if (!targetPosition) return { mazeMatrixError: "Missing Target T" };
    if (!playerPosition)
      return { mazeMatrixError: "Missing Player Position S" };
    if (!boxPosition) return { mazeMatrixError: "Missing Box Position B" };
    return { mazeMatrix, targetPosition, playerPosition, boxPosition };
  } catch (error) {
    return { mazeMatrixError: "Invalid Input" };
  }
}
function getAdjecentListGraph(possibleSB) {
  const adjList = new Map();
  for (let i = 0; i < possibleSB.length; i++) {
    adjList.set(possibleSB[i].toString(), []);
    for (let j = 0; j < possibleSB.length; j++) {
      if (i === j) continue; //if same node ignore
      const diffSR = possibleSB[i][0] - possibleSB[j][0];
      const diffSC = possibleSB[i][1] - possibleSB[j][1];
      const diffBR = possibleSB[i][2] - possibleSB[j][2];
      const diffBC = possibleSB[i][3] - possibleSB[j][3];
      const totalBoxMove = Math.abs(diffBC) + Math.abs(diffBR);

      //if box or player moves two stpes ignore
      if (Math.abs(diffSC) + Math.abs(diffSR) != 1 || totalBoxMove > 1)
        continue;
      if (totalBoxMove == 1) {
        //boxMoved: for push player current position should be boxed previos postion
        if (
          possibleSB[j][0] != possibleSB[i][2] ||
          possibleSB[j][1] != possibleSB[i][3]
        )
          continue;
        //check if player and boxed move in same direction otherwise ignore
        if (diffSR != diffBR || diffSC != diffBC) continue;
      }
      adjList.get(possibleSB[i].toString()).push(possibleSB[j].toString());
    }
  }
  return adjList;
}
const sukoban = (input) => {
  const inputArray = input.split(/\r?\n/);
  const [integers, ...maze] = inputArray;
  const [r, c] = integers.split(" ");
  if (!r || !c) return { error: "Mission Integer couts for row and coloms" };
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
      if (mazeMatrix[i][j] !== "#") possibleS.push([i, j]);
    }
  }
  //all possible vertex for B will be same
  const possibleB = [...possibleS];

  //all possible combinations of S and B
  const possibleSB = [];
  for (let i = 0; i < possibleS.length; i++) {
    for (let j = 0; j < possibleB.length; j++) {
      if (possibleS[i] !== possibleB[j])
        possibleSB.push([...possibleS[i], ...possibleB[j]]);
    }
  }

  //creating adjList graph represntaion
  const adjList = getAdjecentListGraph(possibleSB);

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
