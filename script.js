/*----------------------> GLOBAL VARIABLES <----------------------*/
const notes = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
const gameModes = ["Standard", "Endless"];
let currentDelay; //bad practice

/*----------------------> DOM FUNCTIONS <----------------------*/
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


/*----------------------> UI DRAWING FUNCTIONS <----------------------*/
function drawMenu()
{
	document.body.innerHTML = "";

	//create master container that contains settings/help and tabs
	let masterContainer = createDiv("masterContainer");

	let row1 = createDiv("box")

	//create settings content
	let settingsCont = createSpan("tabContent");
	settingsCont.classList.add("activeCont");
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
	settingsCont.appendChild(rangeDiv);
	settingsCont.appendChild(timeDiv);
	settingsCont.appendChild(tuningDiv);
	settingsCont.appendChild(gameModeDiv);

	//create help screen
	let helpCont = createSpan("tabContent");
	helpCont.classList.add("help")
	helpCont.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;Press go, and a note name will appear on screen." 
						+ " Play the corresponing note on the selected string, "
						+ "and shortly after the correct fret will display and "
						+ " the note will play. Then a new note will be displayed. "
						+ "Use the settings to change the string you want to focus on, "
						+ "and the time between notes. </br>&nbsp;&nbsp;&nbsp;&nbsp;The 'normal' gamemode goes"
						+ " through each note on the strings in the fret"
						+ " range in turn, whereas endless mode will play until you say stop."

	//Bundling tab dialogues into row 1 and appending
	row1.appendChild(settingsCont);
	row1.appendChild(helpCont);
	masterContainer.appendChild(row1);

	//Create tab dialogue.
	let tabContainer = createDiv("tabContainer");
	let settingsTab = createButton("Settings");
	let helpTab = createButton("Help");
	settingsTab.classList.add("tab", "active");
	helpTab.classList.add("tab");
	tabContainer.appendChild(settingsTab);
	tabContainer.appendChild(helpTab);
	masterContainer.appendChild(tabContainer);

	//create Go button.
	let row2 = createDiv("box");
	let goButton = createButton("GO");
	row2.appendChild(goButton);	

	//append everything to body.
	document.body.appendChild(masterContainer);
	document.body.appendChild(row2);
	return {
		minFretInput: minFretInput,
		maxFretInput: maxFretInput,
		timeInput: timeInput,
		startNoteInput: startNoteInput,
		gameModeInput: gameModeInput,
		goButton: goButton,
		tabs: tabContainer.childNodes,
		tabContent: row1.childNodes
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

	//create note display dialoge
	let noteRow = createDiv("box");
	noteRow.classList.add("margin5px");
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

	//create fret display dialogue
	let fretRow = createDiv("box");
	fretRow.classList.add("margin5px");
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

	//endButton creation
	let buttonRow = createDiv("box");
	buttonRow.classList.add("margin5px");
	
	let endButton = createButton("End");
	buttonRow.appendChild(endButton)

	document.body.appendChild(buttonRow);

	return {
		noteContainer: noteSpan,
		fretContainer: fretSpan,
		endButton: endButton
	}
}
/*----------------------> GENERAL FUNCTIONS <----------------------*/
//very functional. much wow. (update 08/02/2020: no longer very function. none wow :-( ))

//returns a promise that resolves after t ms. Also writes promise to currentDelay so it can be canceled from anywhere.
//just dont have more than one running at once i guess???
function delay(t)
{
	let timer;
	let res;
	let p = new Promise((resolve) =>
		{
			timer = setTimeout(resolve, t);
			res = resolve;
			
		});
	p.cancel = () =>
	{
		clearTimeout(timer);
		res();
	}
	currentDelay = p;
	return p;
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

//swaps the active tab and active content
function swapTab(index, tabs, content)
{
	tabs.forEach(t =>
	{
		t.classList.remove("active");
	});
	content.forEach(t =>
	{
		t.classList.remove("activeCont");
	})
	tabs[index].classList.add("active");
	content[index].classList.add("activeCont");
}

/*----------------------> MAIN EXECUTION FUNCTIONS <----------------------*/
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
	menuInputs.tabs.forEach((t, i) =>
	{
		t.onclick = () =>
		{
			if(!t.classList.contains("active"))
			{
				swapTab(i, menuInputs.tabs, menuInputs.tabContent);
			}
		}
	});
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
	let halt = false; //when variable = true, game stops.

	gameElements.endButton.onclick = () =>
	{
		halt = true;
		currentDelay.cancel();
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
		console.log(frets);
		
		//note forEach not used to iterate because await is needed.
		for (let i = 0; i < frets.length; i++)
		{
			let note = (frets[i] + baseNote) % 12;
			gameElements.noteContainer.innerHTML = notes[note];
			if(halt){break;}
			await delay(time * 1000);
			if(halt){break;}
			gameElements.fretContainer.innerHTML = frets[i];
			await delay(3000);
			if(halt){break;}
			gameElements.noteContainer.innerHTML = "";
			gameElements.fretContainer.innerHTML = "";
		}

	} while(gameMode == 1 && !halt);

	//game has ended, return to menu.
	startMenu();
}

/*----------------------> ENTRY POINT <----------------------*/
startMenu();