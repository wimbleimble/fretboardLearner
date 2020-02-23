/*----------------------> GLOBAL VARIABLES <----------------------*/
const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",];
let temp = [];
for(let i = 0; i <= 8; i++)
{
	noteNames.forEach(v =>
	{
		temp.push(v + i);
	});
}
const notes = temp.slice(9);
const A4 = 440;
const gameModes = ["Standard", "Endless"];
let currentDelay; //bad practice
const instruments = ["Guitar", "Bass", "Ukulele"];
const guitarTunings = 
[
	{
		name: "Standard",
		notes: ["E", "A", "D", "G", "B", "e"],
		values: [notes.indexOf("E2"), notes.indexOf("A2"), notes.indexOf("D3"),
				 notes.indexOf("G3"), notes.indexOf("B3"), notes.indexOf("E4")]
	},
	{
		name: "Drop D",
		notes: ["D", "A", "d", "G", "B", "e"],
		values: [notes.indexOf("D2"), notes.indexOf("A2"), notes.indexOf("D3"),
				 notes.indexOf("G3"), notes.indexOf("B3"), notes.indexOf("E4")]
	},
	{
		name: "DADGAD",
		notes: ["D", "A", "D", "G", "A", "d"],
		values: [notes.indexOf("D2"), notes.indexOf("A2"), notes.indexOf("D3"),
				 notes.indexOf("G3"), notes.indexOf("A3"), notes.indexOf("D4")]
	},
	{
		name: "SAD (FACGCE)",
		notes: ["F", "A", "C", "G", "d", "E"],
		values: [notes.indexOf("F2"), notes.indexOf("A2"), notes.indexOf("C3"),
				 notes.indexOf("G3"), notes.indexOf("C4"), notes.indexOf("E4")]
	},
	{
		name: "SADDER (CGDGBD)",
		notes: ["C", "G", "D", "g", "B", "d"],
		values: [notes.indexOf("C1"), notes.indexOf("G2"), notes.indexOf("D3"),
				 notes.indexOf("G3"), notes.indexOf("B3"), notes.indexOf("D4")]
	}
]
const bassTunings = 
[
	{
		name: "Standard",
		notes: ["E", "A", "D", "G"],
		values: [notes.indexOf("E1"), notes.indexOf("A1"), notes.indexOf("D2"),
				 notes.indexOf("G2")]
	},
	{
		name: "5-String",
		notes: ["B", "E", "A", "D", "G"],
		values: [notes.indexOf("B0"), notes.indexOf("E1"), notes.indexOf("A1"),
				 notes.indexOf("D2"), notes.indexOf("G2")]
	},
	{
		name: "Drop D",
		notes: ["D", "A", "D", "G"],
		values: [notes.indexOf("D1"), notes.indexOf("A1"), notes.indexOf("D2"),
				 notes.indexOf("G2")]
	}
]
const ukuleleTunings =
[
	{
		name: "High G",
		notes: ["G", "C", "E", "A"],
		values: [notes.indexOf("G4"), notes.indexOf("C4"), notes.indexOf("E4"),
				 notes.indexOf("A4")]
	},
	{
		name: "Low G",
		notes: ["G", "C", "E", "A"],
		values: [notes.indexOf("G3"), notes.indexOf("C4"), notes.indexOf("E4"),
				 notes.indexOf("A4")]
	}
]
const instrumentLookup = [guitarTunings, bassTunings, ukuleleTunings];
let audioCxt;
let oscillator;

class Oscillator
{
	constructor(context, rootNote, type = "sine", cutoff = 20000)
	{
		this._ctx = context;
		this._sustain = false;
		this._filterEnvelope = true;
		this._osc = this._ctx.createOscillator();
		this._osc.type = type;
		this._osc.frequency.setValueAtTime(rootNote, this._ctx.currentTime);
		this._gain = this._ctx.createGain();
		this._filter = this._ctx.createBiquadFilter();
		this._filter.frequency.value = cutoff;
		this._osc.connect(this._filter);
		this._filter.connect(this._gain);
		this._gain.connect(this._ctx.destination);
		this._gain.gain.value = 0;
		this._a = 0.05;
		this._d = 3;
		this._s = 0.4;
		this._st = 3;
		this._r = 1;
		this._level = 0.8;
		this._osc.start();
	}
	play()
	{
		let now = this._ctx.currentTime;
		this._gain.gain.cancelScheduledValues(0);
		this._gain.gain.setValueAtTime(0, now);
		this._gain.gain.linearRampToValueAtTime(this._level, now + this._a);
		if(this._sustain)
		{
			this._gain.gain.exponentialRampToValueAtTime(this._level * this._s , now + this._d + this._a);
		}
		else
		{
			setTimeout(() =>
			{
				this._gain.gain.exponentialRampToValueAtTime(0.001 , now + this._d + this._a + this._st);
				this._gain.gain.setValueAtTime(0, now + this._d + this._a + this._st);
			}, this._st);
		}
		
	}
	stop()
	{
		this._gain.gain.cancelScheduledValues(0);
		this._gain.gain.exponentialRampToValueAtTime(0.0001, this._ctx.currentTime + this._r);
		this._gain.gain.setValueAtTime(0, this._ctx.currentTime + this._r);
	}
	tune(cents)
	{
		this._osc.detune.setValueAtTime(cents, this._ctx.currentTime);
	}
}

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

function createSelect(options, values)
{
	let select = document.createElement("select");
	let op = createOptions(options, values);
	op.forEach(o =>
	{
		select.appendChild(o);
	});
	return select;
}

function createOptions(options, values)
{
	let op = [];
	options.forEach((o, v) =>
	{
		let newOption = document.createElement("option");
		if(values)
		{
			newOption.value = values[v];
		}
		else
		{
			newOption.value = v;
		}
		newOption.innerHTML = o;
		op.push(newOption);
	});
	return op;
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

	//creating range control
	let rangeDiv = createDiv("fillWidth");
	let rangeLbl = createSpan("label");
	let minFretInput = createInput("number", 0, 10, 0);
	let maxFretInput = createInput("number", 1, 11, 11);
	rangeLbl.innerHTML = "Fret Range:";
	rangeDiv.appendChild(rangeLbl);
	rangeDiv.appendChild(minFretInput);
	rangeDiv.appendChild(maxFretInput);

	//creating time control
	let timeDiv = createDiv("fillWidth");
	let timeLbl = createSpan("label");
	let timeInput = createInput("number", 1, 30, 5);
	timeLbl.innerHTML = "Time for Notes:";
	timeDiv.appendChild(timeLbl);
	timeDiv.appendChild(timeInput);

	//tuning control
	let tuningDiv = createDiv("subTabMasterContainer");
	//--tabs and label
	let tuningSubTabDiv = createDiv("fillWidth");
	tuningSubTabDiv.classList.add("flx-btm");
	let tuningLbl = createSpan("label");
	tuningLbl.innerHTML = "String Tuning:";
	let tuningSubTabContainer = createDiv("subTabContainer");
	tuningSubTabContainer.classList.add("flx-end");
	let presetsTab = createButton("Presets");
	presetsTab.classList.add("tab", "active");
	let customTab = createButton("Custom");
	customTab.classList.add("tab");
	tuningSubTabContainer.appendChild(presetsTab);
	tuningSubTabContainer.appendChild(customTab);
	
	tuningSubTabDiv.appendChild(tuningLbl);
	tuningSubTabDiv.appendChild(tuningSubTabContainer);
	//--tab selection bar done

	//------tab content:
	let tuningTabContentsDiv = createDiv("fillWidth");

	//------preset tab
	let presetTabContents = createDiv("subTabContents");
	presetTabContents.classList.add("h");
	presetTabContents.classList.add("activeCont");
	
	//----------Instrument Control
	let instrumentSelectContainer = createDiv("clm");
	let instrumentSelect = createSelect(instruments);
	let instrumentLabel = createSpan("label");
	instrumentLabel.innerHTML = "Instrument:";
	instrumentLabel.classList.add("smallText");
	instrumentSelectContainer.appendChild(instrumentLabel);
	instrumentSelectContainer.appendChild(instrumentSelect);
	presetTabContents.appendChild(instrumentSelectContainer);

	//----------Tuning Control
	let tuningSelectContainer = createDiv("clm");
	let tuningsArray = [];
	for(t in guitarTunings)
	{
		tuningsArray.push(guitarTunings[t].name);
	}
	let tuningSelect = createSelect(tuningsArray);
	let tuningLabel = createSpan("label");
	tuningLabel.innerHTML = "Tuning:";
	tuningLabel.classList.add("smallText");
	tuningSelectContainer.appendChild(tuningLabel);
	tuningSelectContainer.appendChild(tuningSelect);
	presetTabContents.appendChild(tuningSelectContainer);

	
	//----------String Control
	let stringSelectContainer = createDiv("clm");
	let stringSelect = createSelect(guitarTunings[0].notes, guitarTunings[0].values);
	let stringLabel = createSpan("label");
	stringLabel.innerHTML = "String:";
	stringLabel.classList.add("smallText");
	stringSelectContainer.appendChild(stringLabel);
	stringSelectContainer.appendChild(stringSelect);
	presetTabContents.appendChild(stringSelectContainer);

	//------custom tab
	let customTabContents = createDiv("subTabContents");
	let customNote = createSelect(notes.slice(0, -11));
	let customLabel = createSpan("label");
	customLabel.classList.add("smallText");
	customLabel.innerHTML = "Open String Tuning";
	customTabContents.appendChild(customLabel);
	customTabContents.appendChild(customNote);
	
	//------append tab contents to tab contents container
	tuningTabContentsDiv.appendChild(presetTabContents);
	tuningTabContentsDiv.appendChild(customTabContents);

	//--appending tuning control div to master container
	tuningDiv.appendChild(tuningSubTabDiv);
	tuningDiv.appendChild(tuningTabContentsDiv);
	//--tab content done

	//gamemode control
	let gameModeDiv = createDiv("fillWidth");
	let gameModeLbl = createSpan("label");
	let gameModeInput = createSelect(gameModes)
	gameModeLbl.innerHTML = "Gamemode: "
	gameModeDiv.appendChild(gameModeLbl);
	gameModeDiv.appendChild(gameModeInput);
	
	
	
	
	//appending all controls to container for settings tab
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
		gameModeInput: gameModeInput,
		goButton: goButton,
		tabs: tabContainer.childNodes,
		tabContent: row1.childNodes,
		tuningTabs: tuningSubTabContainer.childNodes,
		tuningTabsContent: tuningTabContentsDiv.childNodes,
		presetTabControls:
		{
			instrument: instrumentSelect,
			tuning: tuningSelect,
			string: stringSelect,
		},
		customStringControl: customNote
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
		//working out base note
		let baseNote;
		let activeTuningTabId;
		menuInputs.tuningTabs.forEach((t, i) =>
		{
			if(t.classList.contains("active"))
			{
				activeTuningTabId = i;
			}
		});
		switch(activeTuningTabId)
		{
			case 0:
				baseNote = menuInputs.presetTabControls.string.value;
				break
			case 1:
				baseNote = menuInputs.customStringControl.value;
		}

		//Messy disgusting bullshit to maintain values from the menu when the document is erased and redrawn.
		let inputs = {
			minFret: parseInt(menuInputs.minFretInput.value),
			maxFret: parseInt(menuInputs.maxFretInput.value),
			time: parseInt(menuInputs.timeInput.value),
			gameMode: parseInt(menuInputs.gameModeInput.value),
			baseNote: parseInt(baseNote)
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
	menuInputs.tuningTabs.forEach((t, i) =>
	{
		t.onclick = () =>
		{
			if(!t.classList.contains("active"))
			{
				swapTab(i, menuInputs.tuningTabs, menuInputs.tuningTabsContent);
			}
		}
	});
	menuInputs.presetTabControls.instrument.addEventListener("change", () =>
	{
		//lookup object based on select
		let inst = instrumentLookup[menuInputs.presetTabControls.instrument.value];
		//change tuning options for instrument
		menuInputs.presetTabControls.tuning.innerHTML = "";
		let tuningNames = [];
		inst.forEach(i =>
		{
			tuningNames.push(i.name);
		});
		let tuningOptions = createOptions(tuningNames);
		tuningOptions.forEach(o =>
		{
			menuInputs.presetTabControls.tuning.appendChild(o);
		});
		//change string options per instrument
		menuInputs.presetTabControls.string.innerHTML = "";
		let stringOptions = createOptions(inst[0].notes, inst[0].values);
		stringOptions.forEach(o =>
		{
			menuInputs.presetTabControls.string.appendChild(o);
		});
	});
	menuInputs.presetTabControls.tuning.addEventListener("change", () =>
	{
		let val = menuInputs.presetTabControls.tuning.value;
		//lookup object based on select
		let inst = instrumentLookup[menuInputs.presetTabControls.instrument.value];
		//change string options to tuning
		menuInputs.presetTabControls.string.innerHTML = "";
		let stringOptions = createOptions(inst[val].notes, inst[val].values);
		stringOptions.forEach(o =>
		{
			menuInputs.presetTabControls.string.appendChild(o);
		});
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
	audioCxt = new (window.AudioContext || window.webkitAudioContext)();
	oscillator = new Oscillator(audioCxt, A4);
	let halt = false; //when true, game stops.

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
		
		//note forEach not used to iterate because await is needed.
		for (let i = 0; i < frets.length; i++)
		{
			let note = (frets[i] + baseNote);
			console.log(note)
			gameElements.noteContainer.innerHTML = notes[note].slice(0, -1);
			if(halt){break;}
			await delay(time * 1000);
			if(halt){break;}
			gameElements.fretContainer.innerHTML = frets[i];
			oscillator.tune((note - notes.indexOf("A4")) * 100);
			oscillator.play();
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