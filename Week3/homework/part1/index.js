"use strict";

const repoUrl = "https://api.github.com/orgs/HackYourFuture/repos?per_page=100";

function createAndAppend(name, parent, options = {}) {
  const elem = document.createElement(name);
  parent.appendChild(elem);
  Object.keys(options).forEach(key => {
    const value = options[key];
    if (key === "text") {
      elem.innerText = value;
    } else {
      elem.setAttribute(key, value);
    }
  });
  return elem;
}

//Function for creating an error page - passing one parameter for xhrRequest variable:

function createErrorPage(xhrRequest) {
  let root = document.getElementById("root");
  let errorDiv1 = createAndAppend("div", root, { id: "notfound" });
  let errorDiv2 = createAndAppend("div", errorDiv1, { id: "notfound1" });
  let errorDiv3 = createAndAppend("div", errorDiv2, {
    id: "notfound-404"
  });
  createAndAppend("div", errorDiv3);
  let errorStat = createAndAppend("h1", errorDiv3);
  errorStat.innerHTML = xhrRequest.status;
  console.log(xhrRequest.status);
  let errorMsg = createAndAppend("h2", errorDiv2, { id: "errorMsg" });
  errorMsg.innerHTML = "Error: " + xhrRequest.statusText;
  console.log(xhrRequest.statusText);
}

//Function for designing the page by using DOM manipulation :

function createPage() {
  //Create heading part of the page:
  let root = document.getElementById("root");
  let heading = createAndAppend("header", root, {
    class: "header"
  });
  let paragCont = createAndAppend("div", heading);
  paragCont.className = "paragCont";
  let headParag = createAndAppend("p", paragCont, {
    text: "HYF | Github Repositories"
  });
  headParag.id = "headParag";
  let comboCont = createAndAppend("div", heading);
  comboCont.className = "comboCont";
  let comboBox = createAndAppend("select", comboCont);
  comboBox.id = "comboMenu";

  createAndAppend("hr", root, { class: "headHr" });

  //Create body part:
  let mainContainer = createAndAppend("div", root);
  mainContainer.id = "container";

  //Left side of the page:
  let leftSide = createAndAppend("div", mainContainer);
  leftSide.id = "leftSide";
  let leftHeader = createAndAppend("h3", leftSide, { text: "Repo Details" });
  leftHeader.className = "leftHeader";
  createAndAppend("hr", leftSide);
  let leftTable = createAndAppend("table", leftSide);
  let tBody = createAndAppend("tbody", leftTable);
  tBody.id = "tableBud";

  //Right side of the page:
  let rightSide = createAndAppend("div", mainContainer, { class: "rightSide" });
  let rightHeading = createAndAppend("h3", rightSide, { text: "Contributors" });
  rightHeading.className = "rightHeading";
  createAndAppend("hr", rightSide);
  let contributorList = createAndAppend("ul", rightSide);
  contributorList.id = "contributorList";
}

// Making a request to the API endpoint:

function apiCall(url) {
  return new Promise((resolve, reject) => {
    let requestIt = new XMLHttpRequest();
    requestIt.open("GET", url);
    requestIt.onload = function() {
      if (requestIt.status < 400) {
        resolve(requestIt.responseText);
      } else {
        // If request is not successful, create an error page:
        createErrorPage(requestIt);
        reject(new Error(requestIt.status, requestIt.statusText));
      }
    };
    requestIt.send();
  });
}

// Handling the data:

function dataHandler(data) {
  //Parsing the data and assign it to a variable:
  let dataParsed = JSON.parse(data);
  createPage();

  //Passing parsed values with resolved promises:
  const fillCombo = Promise.resolve(dataParsed);
  fillCombo.then(data => fillCombobox(data));
  const comboChange = Promise.resolve(dataParsed);
  comboChange.then(data => comboChangeListener(data));
  const dataRend = Promise.resolve(dataParsed);
  dataRend.then(data => dataRender(data));
}

// Filling the combobox:

function fillCombobox(obj) {
  let selector = document.getElementById("comboMenu");
  obj.sort((a, b) => a.name.localeCompare(b.name));
  obj.map(i => {
    let comOpt = document.createElement("option");
    comOpt.text = i.name;
    comOpt.value = i.id;
    selector.appendChild(comOpt);
  });
}

// Control select element and fill the datas accordingly:

function comboChangeListener(obj) {
  let comboMenu = document.getElementById("comboMenu");
  let repoInfo = document.getElementById("tableBud");

  comboMenu.addEventListener("change", indexFunc);

  function indexFunc() {
    while (repoInfo.hasChildNodes()) {
      repoInfo.removeChild(repoInfo.firstChild);
    }

    let comboValue = comboMenu.options[comboMenu.selectedIndex].text;

    for (let key in obj) {
      if (obj[key].name === comboValue) {
        //Repository part:

        let repHead = createAndAppend("tr", repoInfo);
        let repHeadLabel = createAndAppend("td", repHead, {
          text: "Repository: "
        });
        repHeadLabel.className = "labels";
        let repHeadInfo = createAndAppend("td", repHead);
        let repLink = createAndAppend("a", repHeadInfo);
        repLink.setAttribute("target", "_blank");
        repLink.href = obj[key].html_url;
        repLink.innerText = obj[key].name;

        //Description part:

        let descHead = createAndAppend("tr", repoInfo);
        let descHeadLabel = createAndAppend("td", descHead, {
          text: "Description: "
        });
        descHeadLabel.className = "descLabel";
        let descHeadInfo = createAndAppend("td", descHead, {
          class: "descInfo"
        });
        descHeadInfo.innerText = obj[key].description;

        //Forks part:

        let forkHead = createAndAppend("tr", repoInfo);
        let forkHeadLabel = createAndAppend("td", forkHead, {
          text: "Forks: "
        });
        forkHeadLabel.className = "labels";
        let forkHeadInfo = createAndAppend("td", forkHead);
        forkHeadInfo.innerText = obj[key].forks;

        //Updated part:

        let updateHead = createAndAppend("tr", repoInfo);
        let updateHeadLabel = createAndAppend("td", updateHead, {
          text: "Updated: "
        });
        updateHeadLabel.className = "labels";
        let updateHeadInfo = createAndAppend("td", updateHead);
        let date = new Date(obj[key].updated_at);
        date = date.toUTCString();
        updateHeadInfo.innerText = date;

        //Passing contributor url data to the function with promise:
        let contrUrl = obj[key].contributors_url;
        apiCall(contrUrl).then(data => getContributors(data));
      }
    }
  }
  console.log(obj);
}

// Function displays the data from contributor url:

function getContributors(contData) {
  let parsedContr = JSON.parse(contData);
  console.log(parsedContr);

  let contrList = document.getElementById("contributorList");
  while (contrList.hasChildNodes()) {
    contrList.removeChild(contrList.firstChild);
  }

  parsedContr.forEach(contributor => {
    //List element:
    let contrCard = createAndAppend("li", contrList, {
      class: "contributorCard"
    });

    //Picture:
    let contrPicBox = createAndAppend("div", contrCard, {
      class: "contrPicBox"
    });
    let contrPic = createAndAppend("img", contrPicBox, {
      class: "contributorPic"
    });
    contrPic.src = contributor.avatar_url;

    //Contributor name with link to the profile:
    let contrLinkBox = createAndAppend("div", contrCard, {
      class: "contrLinkBox"
    });
    let contrProfileLink = createAndAppend("a", contrLinkBox, {
      id: "contributorName"
    });
    contrProfileLink.setAttribute("target", "_blank");
    contrProfileLink.href = contributor.html_url;
    contrProfileLink.innerText = contributor.login;

    //Contributor badges:
    let contrBadgeBox = createAndAppend("div", contrCard, {
      class: "contrBadgeBox"
    });
    let contrBadge = createAndAppend("p", contrBadgeBox, {
      class: "contributorBadge"
    });
    contrBadge.innerText = contributor.contributions;
  });
}

//This function triggers after the page load to show the information of first selected repository :

function dataRender(obj) {
  let comboMenu = document.getElementById("comboMenu");
  let repoInfo = document.getElementById("tableBud");

  for (let key in obj) {
    if (obj[key].name === comboMenu.options[comboMenu.selectedIndex].text) {
      //Repository part:

      let repHead = createAndAppend("tr", repoInfo);
      let repHeadLabel = createAndAppend("td", repHead, {
        text: "Repository: "
      });
      repHeadLabel.className = "labels";
      let repHeadInfo = createAndAppend("td", repHead);
      let repLink = createAndAppend("a", repHeadInfo);
      repLink.setAttribute("target", "_blank");
      repLink.href = obj[key].html_url;
      repLink.innerText = obj[key].name;

      //Description part:

      let descHead = createAndAppend("tr", repoInfo);
      let descHeadLabel = createAndAppend("td", descHead, {
        text: "Description: "
      });
      descHeadLabel.className = "descLabel";
      let descHeadInfo = createAndAppend("td", descHead, { class: "descInfo" });
      descHeadInfo.innerText = obj[key].description;

      //Forks part:

      let forkHead = createAndAppend("tr", repoInfo);
      let forkHeadLabel = createAndAppend("td", forkHead, { text: "Forks: " });
      forkHeadLabel.className = "labels";
      let forkHeadInfo = createAndAppend("td", forkHead);
      forkHeadInfo.innerText = obj[key].forks;

      //Updated part:

      let updateHead = createAndAppend("tr", repoInfo);
      let updateHeadLabel = createAndAppend("td", updateHead, {
        text: "Updated: "
      });
      updateHeadLabel.className = "labels";
      let updateHeadInfo = createAndAppend("td", updateHead);
      let date = new Date(obj[key].updated_at);
      date = date.toUTCString();
      updateHeadInfo.innerText = date;

      //Passing contributor url data to the function with promise:
      let contrUrl = obj[key].contributors_url;
      apiCall(contrUrl).then(data => getContributors(data));
    }
  }
}

// Async main function that controls the process:

async function main() {
  try {
    await apiCall(repoUrl).then(data => dataHandler(data));
  } catch (err) {
    alert(err);
  }
}

window.onload = main();
