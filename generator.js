const raceListLoc = "races.txt";
const classListLoc = "classes.txt";
const personalityListLoc = "personalities.txt";
const alignmentsLoc = "alignments.txt";

function generateRace(result) {
    document.getElementById("race").innerHTML =

    result;
}

function generateClass(result) {
    document.getElementById("class").innerHTML = result;
}

function generatePersonality(result) {


    document.getElementById("trait1").innerHTML = result[0];
    document.getElementById("trait2").innerHTML = result[1];
    document.getElementById("trait3").innerHTML = result[2];
}

function generateAlignment(result) {
    document.getElementById("alignment").innerHTML = result;
}
function startGenerate() {
    generate(generateRace, raceListLoc);
    generate(generateClass, classListLoc);
    generateMultiple(generatePersonality, personalityListLoc, 3);
    generate(generateAlignment, alignmentsLoc);
}

async function generate(func, file) {
    //'python -m http.server' while testing locally

    fetch(file)
        .then(response => response.text())
        .then(data => {

            dataArray = data.split(/\r?\n/);
            func(dataArray[randomInt(dataArray.length)]);
        });
}

async function generateMultiple(func, file, amount) {

    fetch(file)
        .then(response => response.text())
        .then(data => {

            dataArray = data.split(/\r?\n/);

            results = randomInts(dataArray.length, amount);


            for (let i = 0; i < amount; i++) {
                results[i] = dataArray[results[i]];
            }

            func(results);
        });
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function randomInts(max, amount) {

    if (amount == 0) {
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