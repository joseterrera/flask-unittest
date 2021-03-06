class BoggleGame {
  /* make a new game at this DOM id */

  constructor(boardId, secs = 60) {
    this.secs = secs; // game length
    this.showTimer();
    this.score = 0;
    this.words = new Set();
    // this.board = $("#" + boardId);
    this.board = document.getElementById(boardId)
    console.log(this.board);

    // every 1000 msec, "tick"
    this.timer = setInterval(this.tick.bind(this), 1000);

    // $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    document.querySelector('.add-word').addEventListener('submit', this.handleSubmit.bind(this) )
  }

  /* show word in list of words */

  showWord(word) {
    // $(".words", this.board).append($("<li>", { text: word }));
    const words =  document.querySelector('.words');
    const li = document.createElement('li');
    li.innerText = word;
    words.append(li)
  }

  /* show score in html */

  showScore() {
    // $(".score", this.board).text(this.score);
    const score = document.querySelector('.score');
    score.innerText = this.score;
  }

  /* show a status message */

  showMessage(msg, cls) {
    // $(".msg", this.board)
    //   .text(msg)
    //   .removeClass()
    //   .addClass(`msg ${cls}`);
      const message = document.querySelector('.msg');
      message.innerText = msg;
      message.className = "";
      message.classList.add('msg', cls);

  }

  /* handle submission of word: if unique and valid, score & show */

  async handleSubmit(evt) {
    const input = document.querySelector('.word');
    evt.preventDefault();

    // const $word = $(".word", this.board);
    // let word = $word.val();
    let word = input.value;
    console.log(word);


    // if (!word) return;
    if(!word) return;

    if (this.words.has(word)) {
      this.showMessage(`Already found ${word}`, "err");
      return;
    }

    // check server for validity
    const resp = await axios.get("/check-word", { params: { word: word }});
    if (resp.data.result === "not-word") {
      this.showMessage(`${word} is not a valid English word`, "err");
    } else if (resp.data.result === "not-on-board") {
      this.showMessage(`${word} is not a valid word on this board`, "err");
    } else {
      this.showWord(word);
      this.score += word.length;
      this.showScore();
      this.words.add(word);
      this.showMessage(`Added: ${word}`, "ok");
    }

    // $word.val("").focus();
    input.value = "";
    input.focus();
  }

  /* Update timer in DOM */

  showTimer() {
    // $(".timer", this.board).text(this.secs);
    const timer = document.querySelector('.timer');
    timer.innerText =this.secs;
  }

  /* Tick: handle a second passing in game */

  async tick() {
    this.secs -= 1;
    this.showTimer();

    if (this.secs === 0) {
      clearInterval(this.timer);
      await this.scoreGame();
    }
  }

  /* end of game: score and update message. */

  async scoreGame() {
    // $(".add-word", this.board).hide();
    const addWord = document.querySelector('.add-word');
    addWord.style.display = "none";
    const resp = await axios.post("/post-score", { score: this.score });
    if (resp.data.brokeRecord) {
      this.showMessage(`New record: ${this.score}`, "ok");
    } else {
      this.showMessage(`Final score: ${this.score}`, "ok");
    }
  }
}
