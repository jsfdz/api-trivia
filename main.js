console.log('🤓 hi erik, the following console logs, are just for testing in evaluation');

const d = document,
    start = d.getElementById('start'),
    game = d.getElementById('game'),
    end = d.getElementById('end'),
    btnStart = d.getElementById('btn-start')

btnStart.addEventListener('click', () => {
    getQuestions()
})

const question = d.getElementById('question'),
    answersContent = d.getElementById('answers-container'),
    progressText = d.getElementById('progress-text'),
    scoreNumber = d.getElementById('score'),
    progressBar = d.getElementById('progress-bar')

let currentQuestion = {},
    acceptingAnswers = true,
    score = 0,
    questionCounter = 0,
    avaiilableQuestion = []

const SCORE_POINTS = 100
let MAX_QUESTIONS = 0

getCategories = () => {
    fetch('https://opentdb.com/api_category.php')
        .then(res => res.json())
        .then(data => renderCategories(data))
}

renderCategories = data => {
    const categories = d.getElementById('categories')

    let html = ''

    for (const cat of data.trivia_categories) {
        html += `<option value="${cat.id}">${cat.name}</option>`
    }

    categories.innerHTML += html
}

getCategories()

getQuestions = () => {
    const TOTAL_QUESTIONS = d.getElementById('totalQuestions').value,
        CATEGORIES = d.getElementById('categories').value,
        DIFFICULTY = d.getElementById('difficulty').value,
        TYPE = d.getElementById('type').value

    MAX_QUESTIONS = TOTAL_QUESTIONS

    fetch(`https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&category=${CATEGORIES}&difficulty=${DIFFICULTY}&type=${TYPE}`)
        .then(res => res.json())
        .then(data => data.response_code === 1 ? alert('🤔 insufficient questions for that selection') : startGame(data.results))
}

startGame = questions => {
    console.log('🚀 FETCH API:');
    console.log(questions);
    questionCounter = 0
    score = 0
    avaiilableQuestion = [...questions]
    game.classList.remove('hidden')
    start.classList.add('hidden')
    getNewQuestion()
}


getNewQuestion = () => {
    if (avaiilableQuestion.length === 0 || questionCounter > MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score)

        game.classList.add('hidden')
        end.classList.remove('hidden')

        const username = d.getElementById('username'),
            saveScoreBtn = d.getElementById('saveScoreBtn'),
            finalScore = d.getElementById('finalScore'),
            mostRecentScore = localStorage.getItem('mostRecentScore')

        const highScores = JSON.parse(localStorage.getItem('highScores')) || []

        finalScore.innerHTML = mostRecentScore

        username.addEventListener('keyup', () => {
            saveScoreBtn.disabled = !username.value
        })

        saveHighScore = e => {
            e.preventDefault()

            const score = {
                score: mostRecentScore,
                name: username.value
            }

            highScores.push(score)

            highScores.sort((a, b) => {
                return b.score - a.score
            })

            highScores.splice(10)

            localStorage.setItem('highScores', JSON.stringify(highScores))

            d.location.reload()
        }
    }

    questionCounter++
    progressText.innerText = `Question ${questionCounter} of ${MAX_QUESTIONS}`
    progressBar.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`

    const questionsIndex = avaiilableQuestion.length - 1
    currentQuestion = avaiilableQuestion[questionsIndex]
    question.innerHTML = currentQuestion.question

    console.log('📢 Question:');
    console.log(currentQuestion.question);

    const answers = []
    currentQuestion.incorrect_answers.forEach(answer => answers.push(answer))
    answers.push(currentQuestion.correct_answer)
    answers.sort(() => Math.random() - 0.5)

    console.log('💡 Correct Answer:');
    console.log(currentQuestion.correct_answer);

    let html = ''
    answers.forEach((answer, i) => {
        html += `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${answer}" id="flexCheckDefault${i}">
                <label class="form-check-label" for="flexCheckDefault${i}">
                    ${answer}
                </label>
        </div>
        `
    })

    html += `<div class="hidden"><span>${currentQuestion.correct_answer}</span></div>`

    answersContent.innerHTML = html

    avaiilableQuestion.splice(questionsIndex, 1)
    acceptingAnswers = true
}

d.addEventListener('click', e => {
    if (e.target.matches('#answers-container .form-check input')) {
        if (!acceptingAnswers) return

        acceptingAnswers = false
        const selectChoise = e.target,
            selectAnswer = selectChoise.value,
            correctAnswer = d.querySelector('.hidden span').textContent

        let classToApply = selectAnswer == correctAnswer ? 'correct' : 'incorrect'

        if (classToApply === 'correct') {
            incrementScore(SCORE_POINTS)
        }

        selectChoise.parentElement.classList.add(classToApply)
        setTimeout(() => {
            selectChoise.parentElement.classList.remove(classToApply)
            getNewQuestion()
        }, 1000)
    }
})

incrementScore = num => {
    score += num
    scoreNumber.innerHTML = score
}

const highScoresList = d.getElementById('highsSoresList')
highScores = JSON.parse(localStorage.getItem('highScores')) || []

highScoresList.innerHTML = highScores.map(score => {
    return `<li class="high-score list-group-item d-flex justify-content-between align-items-center">${score.name} <span class="badge bg-info rounded-pill">${score.score}</span></li>`
}).join('')