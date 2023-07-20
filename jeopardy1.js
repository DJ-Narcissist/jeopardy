let categories = [
  {
    title: "Math",
    clues: [
      { question: "2 + 2", answer: "4", showing: null },
      { question: "1 + 1", answer: "2", showing: null },
      { question: "3 x 5", answer: "15", showing: null },
      { question:"6 - 3 X 6", answer:"-12", showing: null},
      { question:"22 / 6", answer:"3.67", showing: null},
      { question:"33 + 3 / 11", answer:"33.27", showing: null},
    ]
  },
  {
    title: "Literature",
    clues: [
      { question: "To be or not to be?", answer: "To be", showing: null },
      { question: "Who wrote 'Romeo and Juliet'?", answer: "Shakespeare", showing: null },
      { question: "What novel is set in the fictional town of Maycomb, Alabama?", answer: "To Kill a Mockingbird", showing: null },
      { question:"Who is the author of 'To Kill a Mockingbird'?", answer: "Harper Lee", showing:null},
      { question: "Which novel by Jane Austen follows the life of Elizabeth Bennet?", answer:"Pride and Prejudice", showing: null},
      { question:"Who is the author of the fantasy series 'Harry Potter'?", answer:"J.K. Rowling", showing: null},
      ]
  },
  {
    title: "Forex",
    clues: [
      { question:"What is the currency of Japan?", answer:"Yen", showing: null},
      { question:"What is the term used to describe the rate at which one currency can be exchanged for another?", answer:" The Foreign Exchange rate", showing: null},
      { question:"What does the acronym 'USD' stand for in the context of currency?", answer:"United States Dollar", showing: null},
      { question:"What is a Pip?", answer:" The unit of measurement to the change in value between two currencies", showing: null},
      { question:"What are the four major time sessions?", answer:"New York, London, Sydney, Japan,", showing: null},
    ]
  },
  {
    title: "NBA Hall of Fame",  
    clues: [
      { question:"Who is the NBA's all-time leading scorer?", answer:" Lebron James", showing: null},
      { question:"Which player has won the most NBA championships in history?", answer:" Bill Russell", showing: null},
      { question:"Who is the only player to have scored 100 points in a single NBA game?", answer:"Wilt Chamberlain", showing: null},
      { question:"Who was the first person inducted into the hall of fame?", answer:"Dr. James Naismith", showing: null},
      { question:"Which NBA team has the most championships in history?", answer:" Boston Celtics", showing: null},
    ]
  },
  {
    title: "Caribbean Islands",
    clues: [
      { question:"What is the largest island in the Caribbean?", answer:"Cuba", showing: null},
      { question:"Which Caribbean island is known as the 'Nature Island'?", answer:"Dominica", showing: null},
      { question:"What is the official language of Jamaica?", answer:"English", showing: null},
      { question:"How many islands does the Bahamas consist of?", answer:"700 islands", showing: null},
      { question:"How many twin island countries are there in the Caribbean?", answer:"3", showing: null},
    ]
  },

];

$(document).ready(() => {
  setupAndStart();
});

/** Get NUM_CATEGORIES random category IDs from API.
 *
 * Returns array of category IDs
 */
async function getCategoryIds() {
  const NUM_CATEGORIES = 6;
  const response = await axios.get("http://jservice.io/api/categories", {
    params: {
      count: 100, // Fetch a larger number of categories to ensure enough options
    },
  });
  const allCategoryIds = response.data.map((category) => category.id);
  const categoryIds = _.sampleSize(allCategoryIds, NUM_CATEGORIES);
  return categoryIds;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  const response = await axios.get(`http://jservice.io/api/categories?id=${catId}`);
  const category = response.data;
  const clues = category.clues.map((clue) => ({
    question: clue.question,
    answer: clue.answer,
    showing: null,
  }));
  return {
    title: category.title,
    clues: clues,
  };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled with a <tr>, and a <th> for each category
 * - The <tbody> should be filled with NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initially, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
  const table = $('#jeopardy');
  table.empty();

  const thread = $('<thead></thead>');
  const headerRow = $('<tr></tr>');

  for (const category of categories) {
    headerRow.append($('<th></th>').text(category.title));
  }

  thread.append(headerRow);
  table.append(thread);

  const tbody = $('<tbody></tbody>');

  for (let i = 0; i < 5; i++) {
    const row = $('<tr></tr>');

    for (let j = 0; j < categories.length; j++) {
      const clue = categories[j].clues[i];
      const cell = $('<td></td>');

      if (clue.showing === 'question') {
        cell.text(clue.question);
      } else if (clue.showing === 'answer') {
        cell.text(clue.answer);
      } else {
        cell.text('?');
      }

      cell.attr('data-category', j);
      cell.attr('data-clue', i);
      cell.on('click', handleClick);

      row.append(cell);
    }

    tbody.append(row);
  }

  table.append(tbody);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 */
function handleClick(evt) {
  const cell = $(evt.target);
  const categoryIdx = parseInt(cell.attr('data-category'));
  const clueIdx = parseInt(cell.attr('data-clue'));
  const clue = categories[categoryIdx].clues[clueIdx];

  if (!clue.showing) {
    clue.showing = 'question';
    cell.text(clue.question);
  } else if (clue.showing === 'question') {
    clue.showing = 'answer';
    cell.text(clue.answer);
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  const loadingSpinner = $('<div class="spinner"></div>');
  $('#jeopardy').replaceWith(loadingSpinner);
  $('#restart-btn').text('Loading...').prop('disabled', true);
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
  $('#restart-btn').text('Restart').prop('disabled', false);
}

/** Start game:
 *
 * - get random category IDs
 * - get data for each category
 * - create HTML table
 */
async function setupAndStart() {
  showLoadingView();

  const categoryIds = await getCategoryIds();
  categories = await Promise.all(categoryIds.map(getCategory));

  fillTable();
  hideLoadingView();
}

$('#restart-btn').on('click', setupAndStart);

// Initialize the game on page load
setupAndStart();