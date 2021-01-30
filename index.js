const input = `7 11
###########
#T##......#
#.#.#..####
#....B....#
#.######..#
#.....S...#
###########`;
const inputArray = input.split(/\r?\n/);
const [integers, ...maze] = inputArray;
const [r, c] = integers.split(" ");
//creating matrix represntaion of maze
const mazeMatrix = [];
let targetPosition,
  startPosition,
  boxPosition,
  playerPosition = [];
for (let i = 0; i < r; i++) {
  mazeMatrix[i] = maze[i].split("");
  if (mazeMatrix[i].indexOf("T") != -1)
    targetPosition = [i, mazeMatrix[i].indexOf("T")];
  if (mazeMatrix[i].indexOf("S") != -1)
    playerPosition = [i, mazeMatrix[i].indexOf("S")];

  if (mazeMatrix[i].indexOf("B") != -1)
    boxPosition = [i, mazeMatrix[i].indexOf("B")];
}
startPosition = [...playerPosition, ...boxPosition];
//getting all possinle vertex for S
const possibleS = [];
for (let i = 0; i < r; i++) {
  for (let j = 0; j < c; j++) {
    if (mazeMatrix[i][j] !== "#") possibleS.push([i, j]);
  }
}
//all possible vertex for B will be same
const possibleB = [...possibleS];

//all possible combinations
const possibleSB = [];
for (let i = 0; i < possibleS.length; i++) {
  for (let j = 0; j < possibleB.length; j++) {
    if (possibleS[i] !== possibleB[j])
      possibleSB.push([...possibleS[i], ...possibleB[j]]);
  }
}

//creating adjList
const adjList = new Map();
for (let i = 0; i < possibleSB.length; i++) {
  adjList.set(possibleSB[i].toString(), []);
  for (let j = 0; j < possibleSB.length; j++) {
    if (i === j) continue; //if same node ignore
    diffSR = possibleSB[i][0] - possibleSB[j][0];
    diffSC = possibleSB[i][1] - possibleSB[j][1];
    diffBR = possibleSB[i][2] - possibleSB[j][2];
    diffBC = possibleSB[i][3] - possibleSB[j][3];
    totalBoxMove = Math.abs(diffBC) + Math.abs(diffBR);

    //if box or player moves two stpes ignore
    if (Math.abs(diffSC) + Math.abs(diffSR) != 1 || totalBoxMove > 1) continue;
    let pushMove = 0;
    if (totalBoxMove == 1) {
      pushMove = 1;
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

function bfs(start, target) {
  let finalWalks,
    finalPushes = 0;
  let pathsFound = 0;
  const vistedPushes = {};
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
    if ([currentArray[2], currentArray[3]].toString() == target.toString()) {
      pathsFound++;
      if (
        finalPushes == 0 ||
        finalPushes > currentObject.pushes ||
        (finalPushes == currentObject.pushes &&
          (finalWalks == 0 || finalWalks > currentObject.walks))
      ) {
        finalPushes = currentObject.pushes;
        finalWalks = currentObject.walks;
      }
    }

    const childrens = adjList.get(currentPosition);

    childrens.forEach((children) => {
      let pushes = currentPushes;
      let walks = currentWalks;
      if (isPush(currentPosition, children)) pushes++;
      else walks++;
      if (!visited.has(children) || vistedPushes[children] > pushes) {
        visited.add(children);
        vistedPushes[children] = pushes;
        queue.push({
          vertex: children,
          path: [...currentObject.path, children],
          pushes,
          walks,
        });
      }
    });
  }
  return { finalPushes, finalWalks, pathsFound };
}

const { finalPushes, finalWalks, pathsFound } = bfs(
  startPosition,
  targetPosition
);

if (pathsFound == 0) console.log(-1);
else console.log(`${finalPushes} ${finalWalks}`);

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
