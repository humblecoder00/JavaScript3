'use strict';

function main() {
  console.log('I am working!');
  const repoUrl = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';
  apiCall(repoUrl, dataHandler);
}

//1 - Making a request to the API endpoint:

function apiCall(url, callback) {

  let requestIt = new XMLHttpRequest();
  requestIt.onreadystatechange = function () {
    if (requestIt.readyState == 4 && requestIt.status == 200) {
      callback(requestIt.responseText);
    }
  };

  requestIt.open('GET', url);
  requestIt.send();
  manipulateDom();
}

//2 - Design the page by using DOM manipulation :

function manipulateDom() {
  //Create heading part of the page:
  let root = document.getElementById('root');
  let heading = root.appendChild(document.createElement('header'));
  heading.className = "header";
  heading.appendChild(document.createTextNode('Hack Your Future | Github Repositories'));
  let comboBox = heading.appendChild(document.createElement('select'));
  comboBox.id = "comboMenu";

  //Create body part: 
  let mainContainer = root.appendChild(document.createElement('div'));
  mainContainer.className = "container";

  //Left side of the page:
  let leftSide = mainContainer.appendChild(document.createElement('div'));
  leftSide.id = "leftSide";
  let leftHeader = leftSide.appendChild(document.createElement('h3'));
  leftHeader.className = "leftHeader";
  leftHeader.appendChild(document.createTextNode('Repo Details'));

  //Right side of the page:
  let rightSide = mainContainer.appendChild(document.createElement('div'));
  rightSide.className = "rightSide";
  let rightHeader = mainContainer.appendChild(document.createElement('h2'));
  rightHeader.className = "rightHeader";
  rightHeader.appendChild(document.createTextNode('Contributors'));
}


//3 - Handling the data:

function dataHandler(data) {
  //Parsing the data and assign it to a variable:
  let dataParsed = JSON.parse(data);
  fillCombobox(dataParsed);
  comboChangeListener(dataParsed);
}

//4 - Filling the combobox:

function fillCombobox(obj) {
  let selector = document.getElementById('comboMenu');
  obj.forEach(key => {
    let comOpt = document.createElement('option');
    comOpt.text = key.name;
    comOpt.value = key.id;
    selector.appendChild(comOpt);
  });
}

//To be continued-----


window.onload = main();
