const category = {
    RACE: "race",
    CLASS: "class",
    ALL: "all",
}

const raceText = "races.txt";
const classText = "classes.txt";
const titleText = "title.txt";
const personalityText = "personalities.txt";
const alignmentsText = "alignments.txt";

const sourcebooksFolder = "sourcebooks/";

const ph = "playerhandbook/";
const scag = "swordcoastadventurersguide/";
const moot = "mythicodysseysoftheros/";
const vgtm = "volosguidetomonsters/";
const egtw = "explorersguidetowildemount/";
const ggtr = "guildmasterssguidetoravnica/";
const mtof = "mordenkainenstomeoffoes/";
const tcoe = "tashascauldronofeverything/";
const eoac = "endofacycle/";

let prevCheckedRaces = [];
let prevCheckedClasses = [];

let prevPossibleRaces = [];
let prevPossibleClasses = [];

const dict = new Map([
    ['ph', ph],
    ['scag', scag],
    ['moot', moot],
    ['vgtm', vgtm],
    ['egtw', egtw],
    ['ggtr', ggtr],
    ['mtof', mtof],
    ['tcoe', tcoe],
    ['eoac', eoac],
]);

function setup() {
    console.log("Looking for sourcebook files")
    console.warn("Any \"errors\" shown here are fine, it's simply because these sourcebooks don't have the file they are looking for")
    getFiles(dict.values(), [], []);
}

async function getFiles(iterator, raceBoxes, classBoxes) {

    let current = iterator.next()

    if (current.done) {
        createCheckboxes(raceBoxes, classBoxes)
        return
    }

    let findFile = async function (file) {
        let foundRace = await (fetch(sourcebooksFolder + file + raceText).catch());
        let foundClass = await (fetch(sourcebooksFolder + file + classText).catch());

        if (foundRace.ok) {
            raceBoxes[raceBoxes.length] = file;
        }

        if (foundClass.ok) {
            classBoxes[classBoxes.length] = file;
        }

        getFiles(iterator, raceBoxes, classBoxes)
    }

    findFile(current.value)
}

function createCheckboxes(raceBoxes, classBoxes) {
    //keeps track of which line the race and class checkboxes should be on
    let checkBoxAlign = new Map();

    dict.forEach((value, key) => {
        let amount = 0;
        let belongs;

        if (raceBoxes.includes(value)) {
            amount++;
            belongs = category.RACE;
        }

        if (classBoxes.includes(value)) {
            amount++;
            belongs = category.CLASS;
        }

        if (amount >= 2) {
            belongs = category.ALL;
        }

        checkBoxAlign.set(value, belongs)
    })

    let appendRaceHTML = async function (curHTML, iterator) {
        let current = iterator.next()

        if (current.done) {
            applyHTML("raceboxes", curHTML);
            return;
        }

        switch (checkBoxAlign.get(current.value)) {
            case category.RACE:
            case category.ALL:
                curHTML += "\n" +
                    `<input type=\"checkbox\" id="${getKeyByValue(current.value)}R" checked> <br>`;
                appendRaceHTML(curHTML, iterator);
                break;
            default:

                curHTML += "\n" + "<br>";
                appendRaceHTML(curHTML, iterator);
        }
    }

    let appendClassHTML = async function (curHTML, iterator) {
        let current = iterator.next();

        if (current.done) {
            applyHTML("classboxes", curHTML);
            return;
        }

        switch (checkBoxAlign.get(current.value)) {
            case category.CLASS:
            case category.ALL:
                fetch(sourcebooksFolder + current.value + titleText)
                    .then(response => response.text())
                    .then(data => {
                        curHTML += "\n" +
                            `<input type=\"checkbox\" id="${getKeyByValue(current.value)}C" checked>` +
                            `<label for=\"${data}C\" style=\"font-size: 20px\">${data}</label><br>`;
                        appendClassHTML(curHTML, iterator);
                    })
                break;
            //labels for race are showing in the "class" section because the class is on the right column on the screen
            case category.RACE:
                fetch(sourcebooksFolder + current.value + titleText)
                    .then(response => response.text())
                    .then(data => {
                        curHTML += "\n" + `<label for=\"${getKeyByValue(current.value)}R\" style=\"font-size: 20px\"><span class=raceoffset>${data}</label><br>`;
                        appendClassHTML(curHTML, iterator);
                    })
                break;
        }
    }

    appendRaceHTML("", checkBoxAlign.keys());
    appendClassHTML("", checkBoxAlign.keys());
}

function applyHTML(id, HTML) {
    document.getElementById(id).innerHTML = HTML;
}

function generateRace(result) {
    document.getElementById("race").innerHTML = result;
}

function generateClass(result) {
    document.getElementById("class").innerHTML = result;
}

function generatePersonality(result) {

    let amount = parseInt(document.getElementById("traits").value)
    document.getElementById("trait1").innerHTML = result[0];
    document.getElementById("trait2").innerHTML = (amount < 2) ? "" : result[1];
    document.getElementById("trait3").innerHTML = (amount < 3) ? "" : result[2];
}

function generateAlignment(result) {
    document.getElementById("alignment").innerHTML = result;
}

function startGenerate() {
    races = [];
    classes = [];

    dict.forEach((value, key) => {
        if (document.getElementById(key + "R") && document.getElementById(key + "R").checked) {
            races[races.length] = key;
        }

        if (document.getElementById(key + "C") && document.getElementById(key + "C").checked) {
            classes[classes.length] = key;
        }
    });

    if (arraysEqual(races, prevCheckedRaces)) {
        generate(generateRace, prevPossibleRaces);
    } else {
        prevCheckedRaces = races;
        appendPossibilitiesAndGenerate([], races, sourcebooksFolder, raceText, 0, generateRace);
    }

    if (arraysEqual(classes, prevCheckedClasses)) {
        generate(generateClass, prevPossibleClasses);
    } else {
        prevCheckedClasses = classes;
        appendPossibilitiesAndGenerate([], classes, sourcebooksFolder, classText, 0, generateClass);
    }
    generateMultipleRandomFromFile(generatePersonality, personalityText, 3);
    generateRandomFromFile(generateAlignment, alignmentsText);
}

function appendPossibilitiesAndGenerate(array, checked, prefix, suffix, index, func) {
    if (index >= checked.length) {
        generate(func, array);

        if (suffix == raceText) {
            prevPossibleRaces = array;
            console.log("Race list changed, new list is: " + array);
        } else if (suffix == classText) {
            prevPossibleClasses = array;
            console.log("Class list changed, new list is: " + array);
        }
        return;
    }

    fetch(prefix + dict.get(checked[index]) + suffix)
        .then(response => response.text())
        .then(data => {
            dataArray = data.split(/\r?\n/);

            Array.prototype.push.apply(array, dataArray);
            appendPossibilitiesAndGenerate(array, checked, prefix, suffix, index + 1, func);
        });
}

function generateRandomFromFile(func, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            dataArray = data.split(/\r?\n/);
            generate(func, dataArray);
        });
}

function generateMultipleRandomFromFile(func, file, amount) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            dataArray = data.split(/\r?\n/);
            generateMultiple(func, dataArray, amount);
        });
}

function generate(func, array) {
    //'python -m http.server' while testing locally
    func(array[randomInt(array.length)]);
}

function generateMultiple(func, array, amount) {
    results = randomInts(array.length, amount);

    for (let i = 0; i < amount; i++) {
        results[i] = array[results[i]];
    }

    func(results);
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function randomInts(max, amount) {
    if (amount == 0 || amount > max) {
        return;
    }

    nums = [];
    nums[0] = randomInt(max);

    for (let i = 1; i < amount; i++) {
        num = randomInt(max);

        if (nums.includes(num)) {
            i--;
        }
        else {
            nums[i] = num;
        }
    }

    return nums;
}

function arraysEqual(a1, a2) {
    return JSON.stringify(a1) == JSON.stringify(a2);
}

function getKeyByValue(searchValue) {
    for (let [key, value] of dict.entries()) {
        if (value === searchValue)
            return key;
    }
}