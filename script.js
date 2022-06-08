let deckId = "";
let points = 0;
let enemyPoints = 0;
let playerCards = [];
let enemyCards = [];
let showCard = 0;
window.onload = function () {
  // Page when window loads
  document.getElementById("message").innerHTML =
    "<span class='title'>BlackJack</span><br><span class='smalltext'> The object of the game is to win money by creating card totals higher than those of the dealer's hand but not exceeding 21, or by stopping at a total in the hope that dealer will bust. <br> (EXCEPT THIS GAME IS FREE)</span>";
  document.getElementById("dealbutton").style.display = "inline";
  document.getElementById("hitbutton").style.display = "none";
  document.getElementById("standbutton").style.display = "none";
  document.getElementById("enemypts").style.display = "none";
  document.getElementById("yourpts").style.display = "none";
  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then((response) => response.json())
    .then((data) => (deckId = data.deck_id));
};

function startGame() {
  // When game starts, this will be effective
  document.getElementById("dealbutton").style.display = "none";
  document.getElementById("hitbutton").style.display = "inline";
  document.getElementById("standbutton").style.display = "inline";
  document.getElementById("enemypts").style.display = "inline";
  document.getElementById("yourpts").style.display = "inline";
  document.getElementById("message").innerHTML = "";
  points = 0;
  enemyPoints = 0;
  showCard = 0;
  playerCards = [];
  enemyCards = [];
  // fetches deck for game setup
  fetch(
    "https://deckofcardsapi.com/api/deck/" + deckId + "/shuffle/?deck_count=1"
  )
    .then((response) => response.json())
    .then((data) => setup(data)); //setup with deck data
}

function setup(data) {
  console.log(data);
  // draws 2 cards (1 for each) to start game
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=2")
    .then((response) => response.json())
    .then((data1) => update(data1, 0)) // draw card from this deck for player
    .then(() =>
      fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=2")
        .then((response) => response.json())
        .then((data2) => update(data2, 1))
    ); //draw card from this deck for enemy
} //sets up new round
function hit(side) {
  // functional for both player and dealer (Hit Button)
  fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
    .then((response) => response.json())
    .then((data) => update(data, side)); //draw card from this deck
} //draw 1 card
function update(data, side) {
  console.log(data);
  // continue hitting, updates deck
  if (data != 0) {
    for (let a = 0; a < data.cards.length; a += 1) {
      console.log(data.cards[a]);
      if (side == 0) {
        enemyCards.push(data.cards[a]); // add new card to enemy hand
        console.log(enemyCards);
      } else if (side == 1) {
        playerCards.push(data.cards[a]); // add new card to player hand
        console.log(playerCards);
      }
    }
  }
  // counts enemy points
  enemyPoints = 0;
  let totalAces = 0;
  document.getElementById("enemycards").innerHTML = "";
  for (let a = 0; a < enemyCards.length; a += 1) {
    if (a == 1 && showCard == 0) {
      document.getElementById("enemycards").innerHTML +=
        // shows back of a card
        "<img src='https://deckofcardsapi.com/static/img/back.png' alt=''>";
    } else {
      // shows the dealers card
      document.getElementById("enemycards").innerHTML +=
        "<img src='" + enemyCards[a].images.png + "' alt=''>";
    }
    // if a card has a value between 2-10, give it that value
    if (enemyCards[a].value >= 2 && enemyCards[a].value <= 10) {
      enemyPoints += parseInt(enemyCards[a].value);
    } else if (enemyCards[a].value == "ACE") {
      totalAces += 1;
    } else {
      enemyPoints += 10;
    }
  }
  // count non ace cards and # of aces
  for (let a = 0; a < totalAces; a += 1) {
    if (enemyPoints < 12 - totalAces) {
      // if theres multiple aces, it stops a bust by making aces equal to 1
      enemyPoints += 11;
    } else {
      enemyPoints += 1;
    }
  } // count aces
  // only shows points of 1 card when enemy has 2 at start
  if (showCard == 0) {
    let x = 0;
    if (enemyCards[0].value >= 2 && enemyCards[0].value <= 10) {
      x = parseInt(enemyCards[0].value);
    } else if (enemyCards[0].value == "ACE") {
      x = 11;
    } else {
      x = 10;
    }
    document.getElementById("enemypts").innerHTML =
      "<span class='smalltext'>Dealer</span> " + x; //only show second card
  } else {
    document.getElementById("enemypts").innerHTML =
      "<span class='smalltext'>Dealer</span> " + enemyPoints; //show true
  }
  console.log(enemyPoints);
  if (enemyPoints > 21) {
    endGame(1); // win
  } // bust
  //count player points
  points = 0;
  totalAces = 0;
  // counts player cards values
  document.getElementById("yourcards").innerHTML = "";
  for (let a = 0; a < playerCards.length; a += 1) {
    document.getElementById("yourcards").innerHTML +=
      "<img src='" + playerCards[a].images.png + "' alt=''>";
    if (playerCards[a].value >= 2 && playerCards[a].value <= 10) {
      points += parseInt(playerCards[a].value);
    } else if (playerCards[a].value == "ACE") {
      totalAces += 1;
    } else {
      points += 10;
    }
  } // count non ace cards and # of aces
  for (let a = 0; a < totalAces; a += 1) {
    if (points < 12 - totalAces) {
      // if theres multiple aces, it stops a bust by making aces equal to 1
      points += 11;
    } else {
      points += 1;
    }
  } //count aces
  // calculates players points
  document.getElementById("yourpts").innerHTML =
    "<span class='smalltext'>Player</span> " + points;
  console.log(points);
  if (points > 21) {
    endGame(0); // lose
  } // bust
}

function turnOver() {
  document.getElementById("hitbutton").style.display = "none";
  document.getElementById("standbutton").style.display = "none";
  showCard = 1;
  update(0, 0);
  setTimeout("autoHit(enemyPoints)", 1000);
}

function autoHit(x) {
  if (x < 18) {
    fetch("https://deckofcardsapi.com/api/deck/" + deckId + "/draw/?count=1")
      .then((response) => response.json())
      .then((data) => update(data, 0)) // draw card from this deck
      .then(() => setTimeout("autoHit(enemyPoints)", 200)); // run itself again if still < 18
  } else {
    console.log(enemyPoints);
    console.log(points);
    // compare points
    if (enemyPoints > 21) {
      endGame(1); // player win
    } else if (points > 21) {
      endGame(0); // player lose
    } else if (points > enemyPoints) {
      endGame(1); // player win
    } else if (points < enemyPoints) {
      endGame(0); // player lose
    } else {
      endGame(2); // tie
    }
  }
} // hit until over 18, then end game
function endGame(side) {
  if (side == 0) {
    document.getElementById("message").innerHTML = "YOU LOST";
  } else if (side == 1) {
    document.getElementById("message").innerHTML = "YOU WON";
  } else if (side == 2) {
    document.getElementById("message").innerHTML = "TIE";
  }
  document.getElementById("hitbutton").style.display = "none";
  document.getElementById("standbutton").style.display = "none";
  document.getElementById("dealbutton").style.display = "inline";
}
// if no internet, service worker displays message
window.addEventListener("offline", () => {
  document.getElementById("message").innerHTML =
    "The game is offline and will not work";
});
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}