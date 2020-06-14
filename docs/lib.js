var points = 0;
var round = 0;
var maxrounds = 10;
var seen = [];
var data = {};
var article = "";
var currentword = "";

var sparqlQuery = '\
	SELECT ?lemma (SAMPLE(?gender) AS ?gender) WITH {\
	  SELECT DISTINCT ?lemma WHERE {\
	    VALUES ?gender { wd:Q499327 wd:Q1775415 wd:Q1775461 }\
	    ?lexeme dct:language wd:Q188;\
	            wikibase:lexicalCategory wd:Q1084;\
	            wdt:P5185 ?gender;\
	            wikibase:lemma ?lemma.\
	  }\
	  ORDER BY CONCAT(MD5(?lemma), STR(NOW()))\
	} AS %randomLemmas WHERE {\
	  INCLUDE %randomLemmas.\
	  ?lexeme wikibase:lemma ?lemma;\
	          wdt:P5185 ?gender.\
	}\
	GROUP BY ?lemma\
	HAVING(COUNT(?gender) = 1)';

	$.getJSON('https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=' + encodeURIComponent(sparqlQuery)).done(function (result) {
		data = result;

		if (data.results.bindings.length === 0) {
			$("#results").html('<p>No results.</p>');
			return;
	    }

		newRound();
		$("#results").toggle();
		// TODO loading

}).fail(function (e) {
	$("#results").html('<p>Problem, no results available.</p>');
});

$("#newgame").on("click", function (e) {
	e.preventDefault();
	newGame();
});

$("#results button").each(function (i, v) {
	$(this).on("click", function (e) {
		e.preventDefault();
		if (v.value === article) { // correct
			points = points + 1;
			$("#points").html(points);
			addAnswerToList(currentword, true);
		} else { // incorrect
			addAnswerToList(currentword, false);
		}
		newRound();
	});
});

function addAnswerToList(word, correct) {
	var image = correct ? "plus" : "minus";
	$("#previouswords ul").prepend("<li class='list " + image + "'>" + article + " " + word + "</li>");
}

function newRound () {
	round = round + 1;
	if (round > maxrounds) {
		endGame();
		return;
	}
	$("#round").html(round);

	var random = Math.floor(Math.random() * data.results.bindings.length);
	seen.push(random);
	var item = data.results.bindings[random];

	// TODO skip seen items

	//convert Qitem of gender into the article (simple version)
	switch (item.gender.value) {
		case "http://www.wikidata.org/entity/Q499327":
			article = "der";
			break;
		case "http://www.wikidata.org/entity/Q1775415":
			article = "die";
			break;
		case "http://www.wikidata.org/entity/Q1775461":
			article = "das";
			break;
	}

	currentword = item.lemma.value;
	$("#noun").html(item.lemma.value);

}

function endGame () {
	$("#finalscore").html(points);
	$("#results").toggle();
	$("#finalresult").toggle();

}

function newGame () {
	points = 0;
	round = 0;
	$("#points").html(points);
	$("#round").html(round);

	$("#previouswords").html("<ul></ul>");

	newRound();

	$("#results").toggle();
	$("#finalresult").toggle();
}
