const datafilename = "data.json";

const defaultRaces = ["phb"];
const defaultClasses = ["phb"];

let data;
let control = {};
let dataPromise = new Promise((resolve) => {
    fetch(datafilename)
        .then(response => response.json())
        .then((json) => {
            data = json;
            resolve();
        });
});

window.onload = async () => {
    await dataPromise;
    let sources = document.getElementById("sources");
    let numtraits = document.getElementById("numtraits");
    
    control.traits = numtraits;

    let bookcontrol = {};
    console.log(data);
    console.log(data.source);
    data.source.forEach(book => {
        let row = sources.insertRow(-1);
        let checkrace = row.insertCell(0);
        let checkclass = row.insertCell(1);
        row.insertCell(2).innerHTML = book.title;

        let controlinstance = {
            "cr" : null,
            "cc" : null,
            "races" : [],
            "classes" : []
        };

        if (book.races.length > 0) {
            let checkbox = createCheckBox(defaultRaces.includes(book.symbol));
            checkrace.appendChild(checkbox);

            controlinstance.cr = checkbox;
            controlinstance.races = book.races;
        }

        if (book.classes.length > 0) {
            let checkbox = createCheckBox(defaultClasses.includes(book.symbol));
            checkclass.appendChild(checkbox);

            controlinstance.cc = checkbox;
            controlinstance.classes = book.classes;
        }

        bookcontrol[book.symbol] = controlinstance;
    });

    console.log(bookcontrol);
    control.books = bookcontrol;

    document.getElementById("generate").onclick = () => {
        let outrace = document.getElementById("race");
        let outclass = document.getElementById("class");
        let outalign = document.getElementById("alignment");
        let outtraits = document.getElementById("traits");

        let races = [];
        let classes = [];
        
        Object.keys(control.books).forEach((symbol) => {
            let book = control.books[symbol];
            console.log(book);
            if (book.cr != null && book.cr.checked) {
                races.push(...book.races);
            }
            if (book.cc != null && book.cc.checked) {
                classes.push(...book.classes);
            }
        });

        outrace.innerHTML = races[Math.floor(Math.random() * races.length)];
        outclass.innerHTML = classes[Math.floor(Math.random() * classes.length)];
        outalign.innerHTML = data.alignments[Math.floor(Math.random() * data.alignments.length)]
        outtraits.innerHTML = "";

        data.traits = data.traits
            .map((value) => ({value, sort: Math.random()}))
            .sort((a,b) => a.sort - b.sort)
            .map(({value}) => value);
        
        for(let i = 0; i < parseInt(control.traits.value); i++) {
            let trait = document.createElement('div');
            trait.innerHTML = data.traits[i];
            trait.setAttribute("class", "trait");
            outtraits.appendChild(trait);
        }
    };
}

function createCheckBox(checked) {
    let checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    return checkbox;
}