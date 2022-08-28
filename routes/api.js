var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

function generateRandomNumber()
{
    return Math.floor(Math.random() * 1000); 
}

function generateQuestion()
{
    const first = generateRandomNumber();
    const second = generateRandomNumber();
    const [bigger, smaller] = (first > second ? [first, second] :  [second, first]);
    const answer = bigger - smaller;
    const questionText = `${bigger} - ${smaller} =`;
    return {"startTime": new Date().getTime(),
	    "endTime": null,
	    "bigger": bigger,
	    "smaller": smaller,
	    "correctAnswer": answer,
	    "answer": null,
	    "questionText": questionText,};
}

router.get('/quiz/start', function(req, res, next){
    req.session.regenerate(function(err) {
	req.session.quiz = {
	    "started": new Date().getTime(),
	    "currentQuestion": -1,
	    "questions": [],
	    active: true,
	    results: {}
	};
	res.json({"status": "ok"});
    });
})

router.get('/quiz/question/:id', function(req, res, next) {
    const id = Number.parseInt(req.params.id);
    
    if(!req.session.quiz){
	res.json({"status": "error", "error":"Found no active test for this user."});
	return;
    }
    
    if(id == undefined || id < 0){
	res.json({"status": "error", "error": "Provided faulty ID."});
	return;
    }
    
    if(id <= req.session.quiz.currentQuestion){
	/*
	const question = req.session.quiz.questions[id];
	res.json({"question": question.questionText,
		  "currentQuestion": req.session.quiz.currentQuestion,
		  "status": "ok"});
	*/
	res.json({"status": "error", "error": "Requested question does not exist."});
	return
    }

    if(id - req.session.quiz.currentQuestion !== 1){
	res.json({"status": "error", "error": "Requested question does not exist."});
	return;
    }

    const question = generateQuestion();
    
    req.session.quiz.currentQuestion++;
    req.session.quiz.questions.push(question);
    console.log(question);
    res.json({"question": question.questionText,
	      "currentQuestion": req.session.quiz.currentQuestion,
	      "status": "ok"});
});

router.post('/quiz/question/:id', jsonParser, function(req, res, next) {
    const id = Number.parseInt(req.params.id);
    const answer = Number.parseInt(req.body.answer);
    if(!req.session.quiz){
	res.json({"status": "error", "error":"Found no active test for this user."});
	return;
    }

    if(!(id == undefined || id < 0) && id === req.session.quiz.currentQuestion){
	const question = req.session.quiz.questions[id];
	//if(question.questionText === req.body.questionText){
	    question.answer = answer
	    question.endTime = new Date().getTime();
	    res.json({"correct": (question.correctAnswer === answer),
		      "status": "ok"});
	    return;
	//}
    }
    res.status(400).json({"status": "error", "error": "Provided faulty ID."});
})

router.get('/quiz/end', function(req, res, next) {
    if(!req.session.quiz){
	res.json({"status": "error", "error":"Found no active test for this user."});
	return;
    }

    if(req.session.quiz.active === true){
	req.session.quiz.active = false;
	req.session.quiz.results = {
	    correct: req.session.quiz.questions.reduce((acc, question) => (acc + (question.answer === question.correctAnswer ? 1 : 0)), 0),
	    incorrect: req.session.quiz.questions.reduce((acc, question) => (acc + (question.answer !== question.correctAnswer ? 1 : 0)), 0)
	}
	req.session.quiz.ended = new Date().getTime();
    }

    res.json({"results": req.session.quiz.results, "questions": req.session.quiz.questions})
});

module.exports = router;
