const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
const gameModes = ["Standard", "Endless"];


//DOM functions for ease in creating menu and game display.
function createDiv(cls)
{
	let div = document.createElement("div");
	if (cls)
	{
		div.classList.add(cls);
	}
	return div;
}
function createButton(text)
{
	let btn = document.createElement("button");
	btn.innerHTML = text;
	return btn;
}

function createInput(type, min, max, value)
{
	let input = document.createElement("input")
	input.type = type;
	input.min = min;
	input.max = max;
	input.value = value;
	return input;
}

function createSpan(cls)
{
	let spn = document.createElement("span");
	if (cls)
	{
		spn.classList.add(cls);
	}
	return spn;
}

function createSelect(options)
{
	let select = document.createElement("select");
	options.forEach((o, v) =>
	{
		let newOption = document.createElement("option");
		newOption.value = v;
		newOption.innerHTML = o;
		select.appendChild(newOption);
	});
	return select;
}



//Drawing functions that draw the different state of the game and return relevent elements
function drawMenu()
{
	document.body.innerHTML = "";
	let row1 = createDiv("box")
	let rangeDiv = createDiv("fillWidth");
	let rangeLbl = createSpan("label");
	let timeDiv = createDiv("fillWidth");
	let timeLbl = createSpan("label");
	let tuningDiv = createDiv("fillWidth");
	let tuningLbl = createSpan("label");
	let minFretInput = createInput("number", 0, 10, 0);
	let maxFretInput = createInput("number", 1, 11, 11);
	let timeInput = createInput("number", 1, 30, 5);
	let startNoteInput = createSelect(notes);
	let gameModeDiv = createDiv("fillWidth");
	let gameModeLbl = createSpan("label");
	let gameModeInput = createSelect(gameModes)
	rangeLbl.innerHTML = "Fret Range:";
	rangeDiv.appendChild(rangeLbl);
	rangeDiv.appendChild(minFretInput);
	rangeDiv.appendChild(maxFretInput);
	timeLbl.innerHTML = "Time for Notes:";
	timeDiv.appendChild(timeLbl);
	timeDiv.appendChild(timeInput);
	tuningLbl.innerHTML = "String Tuning:";
	tuningDiv.appendChild(tuningLbl);
	tuningDiv.appendChild(startNoteInput);
	gameModeLbl.innerHTML = "Gamemode: "
	gameModeDiv.appendChild(gameModeLbl);
	gameModeDiv.appendChild(gameModeInput);
	row1.appendChild(rangeDiv);
	row1.appendChild(timeDiv);
	row1.appendChild(tuningDiv);
	row1.appendChild(gameModeDiv);
	let row2 = createDiv("box");
	let goButton = createButton("GO");
	row2.appendChild(goButton);
	document.body.appendChild(row1);
	document.body.appendChild(row2);
	return {
		minFretInput: minFretInput,
		maxFretInput: maxFretInput,
		timeInput: timeInput,
		startNoteInput: startNoteInput,
		gameModeInput: gameModeInput,
		goButton: goButton
	};
}

function drawCountdown()
{
	document.body.innerHTML = "";
	let container = createDiv("box");
	let circle = createDiv("circle");
	circle.classList.add("note");
	let number = createSpan();
	circle.appendChild(number);
	container.appendChild(circle);
	document.body.appendChild(container);

	return number;
}

function drawGame()
{
	document.body.innerHTML = "";
	let noteRow = createDiv("box");
	let noteLabel = createSpan("label");
	let noteContainer = createDiv("circle");
	let noteSpan = createSpan();
	noteRow.classList.add("h");
	noteLabel.innerHTML = "Note:";
	noteRow.appendChild(noteLabel);
	noteContainer.classList.add("note");
	noteContainer.appendChild(noteSpan);
	noteRow.appendChild(noteContainer);

	document.body.appendChild(noteRow);

	let fretRow = createDiv("box");
	let fretLabel = createSpan("label");
	let fretContainer = createDiv("circle");
	let fretSpan = createSpan();
	fretRow.classList.add("h");
	fretLabel.innerHTML = "Fret:";
	fretRow.appendChild(fretLabel);
	fretContainer.classList.add("fret");
	fretContainer.appendChild(fretSpan);
	fretRow.appendChild(fretContainer);

	document.body.appendChild(fretRow);

	let buttonRow = createDiv("box");
	let endButton = createButton("End");
	buttonRow.appendChild(endButton)

	document.body.appendChild(buttonRow);

	return {
		noteContainer: noteSpan,
		fretContainer: fretSpan,
		endButton: endButton
	}
}

//general purpose functions. very functional. much wow.

function delay(t)
{
	return new Promise(resolve =>
	{
		setTimeout(resolve, t);
	})
}

//Fisher-Yates array shuffle, its like a dance but not.
function shuffle(ar)
{
	for (let i = ar.length - 1; i >= 0; i--)
	{
		let j = Math.floor(Math.random() * i + 1);
		let k = ar[i];
		ar[i] = ar[j];
		ar[j] = k;
	}
	return ar;
}

//Execution functions which draw states and handle behaviour.
function startMenu()
{
	let menuInputs = drawMenu();

	menuInputs.goButton.onclick = () =>
	{
		//Messy disgusting bullshit to maintain values from the menu when the document is erased and redrawn.
		let inputs = {
			minFret: parseInt(menuInputs.minFretInput.value),
			maxFret: parseInt(menuInputs.maxFretInput.value),
			time: parseInt(menuInputs.timeInput.value),
			gameMode: parseInt(menuInputs.gameModeInput.value),
			baseNote: parseInt(menuInputs.startNoteInput.value)
		};
		launch(inputs);
	}
}

async function launch(inputs)
{
	let counter = drawCountdown();
	counter.innerHTML = 3;
	await delay(1000)
	counter.innerHTML = 2;
	await delay(1000);
	counter.innerHTML = 1;
	await delay(1000);
	startGame(inputs.minFret, inputs.maxFret, inputs.time, inputs.baseNote, inputs.gameMode);
}

async function startGame(minFret, maxFret, time, baseNote, gameMode)
{
	//begin actual game
	let gameElements = drawGame();
	gameElements.endButton.onclick = () =>
	{
		startMenu();
	}

	//create an array with each fret in selected range in ascending order contained in it
	let frets = [];
	let numFrets = maxFret - minFret + 1; //+1 is for inclusive range
	for (let f = 0; f < numFrets; f++)
	{
		frets.push(minFret + f);
	}
	
	//following loop executes once if gameMode != 1, else executes forever.
	do
	{
		frets = shuffle(frets);
		
		//note forEach not used to iterate because await is needed.
		for (let i = 0; i < frets.length; i++)
		{
			console.log("Round " + (i+1));
			let note = (frets[i] + baseNote) % 12;
			gameElements.noteContainer.innerHTML = notes[note];
			await delay(time * 1000);
			gameElements.fretContainer.innerHTML = frets[i];
			await delay(3000);
			gameElements.noteContainer.innerHTML = "";
			gameElements.fretContainer.innerHTML = "";
		}

	} while(gameMode == 1);

	//game has ended, return to menu.
	startMenu();
}

//startMenu() called to initialise menu state upon launch.
startMenu();