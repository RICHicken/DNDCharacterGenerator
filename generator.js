const raceText = "races.txt";
const classText = "classes.txt";
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
  ])

function generateRace(result) {
    document.getElementById("race").innerHTML =

        result;
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
    }else {
        prevCheckedRaces = races;
        appendPossibilitiesAndGenerate([], races, sourcebooksFolder, raceText, 0, generateRace);
    }

    if (arraysEqual(classes, prevCheckedClasses)) {
        generate(generateClass, prevPossibleClasses);
    }else {
        prevCheckedClasses = classes;
        appendPossibilitiesAndGenerate([], classes, sourcebooksFolder, classText, 0, generateClass);
    }
    generateMultipleRandomFromFile(generatePersonality, personalityText, 3);
    generateRandomFromFile(generateAlignment, alignmentsText);
}

function appendPossibilitiesAndGenerate(array, checked, prefix, suffix, index, func) {

    if (index >= checked.length) {
        generate(func, array);

        if(suffix == raceText) {
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
            appendPossibilitiesAndGenerate(array, checked, prefix, suffix, index+1, func);
        })
}

function generateRandomFromFile(func, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            dataArray = data.split(/\r?\n/);
            generate(func, dataArray);
        })
}

function generateMultipleRandomFromFile(func, file, amount) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            dataArray = data.split(/\r?\n/);
            generateMultiple(func, dataArray, amount);
        })
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

function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}