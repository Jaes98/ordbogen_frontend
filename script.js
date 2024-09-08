window.addEventListener("load", start);

const url = "http://localhost:8080/ordbogen";

let min;
let max;

async function start() {
  document
    .querySelector("#input-form")
    .addEventListener("submit", searchClicked);
    
  startFetch();
}

async function startFetch() {
  const response = await fetch(url);
  const result = await response.json();
  min = result.min;
  max = result.max;

  console.log("basemin, basemax", min, max);
}

async function searchClicked(event) {
  event.preventDefault();
  console.log("search clicked");
  const query = event.target.input.value;
  const searchTerm = query.trim().toLowerCase();
  console.log(searchTerm);

  const word = await findWord(searchTerm);
  console.log(word);
  if (word === -1) {
    document.querySelector("#results").insertAdjacentHTML(
      "afterbegin",
      /*html*/ `
    <div class="result">Prøv igen, kunne ikke finde ${query}</div>
    `
    );
  } else {
    document.querySelector("#results").insertAdjacentHTML(
      "afterbegin",
      /*html*/ `
    <div class="result">
        <h2>Headword: ${word.headword}</h2>
        <div>Id: ${word.id}</div>
        <div>Homograph: ${word.homograph}</div>
        <div>Inflected: ${word.inflected}</div>
        <div>Part of speech: ${word.partofspeech}</div>
    </div>
    `
    );
  }
}

async function findWord(query) {
  let middle;
  let localMax = max;
  let localMin = min;
  let iterations = 0;

  let startTime = performance.now();

  while (localMin <= localMax) {

    iterations++;

    middle = Math.floor((localMax + localMin) / 2);

    const entry = await findEntryAt(middle);

    const totalTime = performance.now() - startTime;
    document.querySelector("#iterations").innerHTML = iterations;
    document.querySelector("#time").innerHTML = (totalTime / 1000).toFixed(2);


    const comparison = compare(query, entry.inflected);

  
    if (comparison == 0) {
      return entry;
    } else if (comparison == 1) {
      localMin = middle + 1;
    } else {
      localMax = middle - 1;
    }
  }
  return -1;
}

function compare(value1, value2) {
  return value1.localeCompare(value2);
}

async function findEntryAt(index) {
  const entry = await fetch(`${url}/${index}`).then((response) =>
    response.json()
  );
  return entry;
}
