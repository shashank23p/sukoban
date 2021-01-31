import { sukoban } from "./sukoban.js";
const timeOuts = [];
//load button listner
$("#loadInputBtn").click(function () {
  $("#output").text("");
  const input = $("#input").val();
  const sukobanData = sukoban(input);
  var mazeMatrix = sukobanData.mazeMatrix;
  if (sukobanData.error)
    return $("#output").html(
      `<p style=color:red>Error: ${sukobanData.error}<p>`
    );
  else if (sukobanData.pathsFound == 0) {
    updateMaze(mazeMatrix, sukobanData.startPosition.toString());
    return $("#output").text(-1);
  } else $("#output").text(`${sukobanData.pushes} ${sukobanData.walks}`);

  sukobanData.bestPath.forEach((nextMove, index) => {
    timeOuts.push(
      setTimeout(function () {
        updateMaze(mazeMatrix, nextMove);
      }, index * 1000)
    );
  });
});

//back button listner
$("#backBtn").click(function () {
  $("#level-div").hide();
  $("#input-div").show();
  $("#output").html("");
  //clearing timeouts
  while (timeOuts.length > 0) {
    clearTimeout(timeOuts.pop());
  }
});

function getRederedMaze(mazeMatrix, nextMove) {
  let levelHtml = "";
  for (let i = 0; i < mazeMatrix.length; i++) {
    levelHtml += `<div class="mazeRow">`;
    for (let j = 0; j < mazeMatrix[i].length; j++) {
      if (i == nextMove[0] && j == nextMove[1])
        levelHtml += `<div class="player"></div>`;
      else if (i == nextMove[2] && j == nextMove[3])
        levelHtml += `<div class="box"></div>`;
      else if (mazeMatrix[i][j] == "T")
        levelHtml += `<div class="target"></div>`;
      else if (mazeMatrix[i][j] == "#") levelHtml += `<div class="wall"></div>`;
      else levelHtml += `<div class="empty"></div>`;
    }
    levelHtml += `</div>`;
  }
  return levelHtml;
}

function updateMaze(mazeMatrix, nextMove) {
  $("#level-div").show();
  $("#input-div").hide();
  $("#level").html("");
  nextMove = nextMove.split(",");
  const levelHtml = getRederedMaze(mazeMatrix, nextMove);
  $("#level").html(levelHtml);
}
