"use strict";

// eslint-disable-next-line no-unused-vars
class Util {
  static createAndAppend(name, parent, options = {}) {
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

  static fetchJSON(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "json";
      xhr.onload = () => {
        if (xhr.status < 400) {
          resolve(xhr.response);
        } else {
          Util.createErrorPage(xhr);
          reject(new Error(`Network error: ${xhr.status} - ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error("Network request failed"));
      xhr.send();
    });
  }

  static createPage() {
    //Create heading part of the page:
    let root = document.getElementById("root");
    let heading = Util.createAndAppend("header", root, {
      class: "header"
    });
    let paragCont = Util.createAndAppend("div", heading);
    paragCont.className = "paragCont";
    let headParag = Util.createAndAppend("p", paragCont, {
      text: "HYF | Github Repositories"
    });
    headParag.id = "headParag";
    let comboCont = Util.createAndAppend("div", heading);
    comboCont.className = "comboCont";
    let comboBox = Util.createAndAppend("select", comboCont);
    comboBox.id = "comboMenu";

    Util.createAndAppend("hr", root, { class: "headHr" });

    //Create body part:
    let mainContainer = Util.createAndAppend("div", root);
    mainContainer.id = "container";

    //Left side of the page:
    let leftSide = Util.createAndAppend("div", mainContainer);
    leftSide.id = "leftSide";
    let leftHeader = Util.createAndAppend("h3", leftSide, {
      text: "Repo Details"
    });
    leftHeader.className = "leftHeader";
    Util.createAndAppend("hr", leftSide);
    let leftTable = Util.createAndAppend("table", leftSide);
    let tBody = Util.createAndAppend("tbody", leftTable);
    tBody.id = "tableBud";

    //Right side of the page:
    let rightSide = Util.createAndAppend("div", mainContainer, {
      class: "rightSide"
    });
    let rightHeading = Util.createAndAppend("h3", rightSide, {
      text: "Contributors"
    });
    rightHeading.className = "rightHeading";
    Util.createAndAppend("hr", rightSide);
    let contributorList = Util.createAndAppend("ul", rightSide);
    contributorList.id = "contributorList";
  }

  static createErrorPage(xhrRequest) {
    let root = document.getElementById("root");

    while (root.hasChildNodes()) {
      root.removeChild(root.firstChild);
    }

    let errorDiv1 = Util.createAndAppend("div", root, { id: "notfound" });
    let errorDiv2 = Util.createAndAppend("div", errorDiv1, { id: "notfound1" });
    let errorDiv3 = Util.createAndAppend("div", errorDiv2, {
      id: "notfound-404"
    });
    Util.createAndAppend("div", errorDiv3);
    let errorStat = Util.createAndAppend("h1", errorDiv3);
    errorStat.innerHTML = xhrRequest.status;
    console.log(xhrRequest.status);
    let errorMsg = Util.createAndAppend("h2", errorDiv2, { id: "errorMsg" });
    errorMsg.innerHTML = "Error: " + xhrRequest.statusText;
    console.log(xhrRequest.statusText);
  }

  static fillCombobox(obj) {
    let selector = document.getElementById("comboMenu");
    obj.sort((a, b) => a.name.localeCompare(b.name));
    obj.map(i => {
      let comOpt = document.createElement("option");
      comOpt.text = i.name;
      comOpt.value = i.id;
      selector.appendChild(comOpt);
    });
  }

  static comboChangeListener(obj) {
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

          let repHead = Util.createAndAppend("tr", repoInfo);
          let repHeadLabel = Util.createAndAppend("td", repHead, {
            text: "Repository: "
          });
          repHeadLabel.className = "labels";
          let repHeadInfo = Util.createAndAppend("td", repHead);
          let repLink = Util.createAndAppend("a", repHeadInfo);
          repLink.setAttribute("target", "_blank");
          repLink.href = obj[key].html_url;
          repLink.innerText = obj[key].name;

          //Description part:

          let descHead = Util.createAndAppend("tr", repoInfo);
          let descHeadLabel = Util.createAndAppend("td", descHead, {
            text: "Description: "
          });
          descHeadLabel.className = "descLabel";
          let descHeadInfo = Util.createAndAppend("td", descHead, {
            class: "descInfo"
          });
          descHeadInfo.innerText = obj[key].description;

          //Forks part:

          let forkHead = Util.createAndAppend("tr", repoInfo);
          let forkHeadLabel = Util.createAndAppend("td", forkHead, {
            text: "Forks: "
          });
          forkHeadLabel.className = "labels";
          let forkHeadInfo = Util.createAndAppend("td", forkHead);
          forkHeadInfo.innerText = obj[key].forks;

          //Updated part:

          let updateHead = Util.createAndAppend("tr", repoInfo);
          let updateHeadLabel = Util.createAndAppend("td", updateHead, {
            text: "Updated: "
          });
          updateHeadLabel.className = "labels";
          let updateHeadInfo = Util.createAndAppend("td", updateHead);
          let date = new Date(obj[key].updated_at);
          date = date.toUTCString();
          updateHeadInfo.innerText = date;

          let contrUrl = obj[key].contributors_url;
          Util.fetchJSON(contrUrl).then(data => Util.getContributors(data));
        }
      }
    }
    console.log(obj);
  }

  static getContributors(data) {
    let parsedContr = data;
    console.log(parsedContr);

    let contrList = document.getElementById("contributorList");
    while (contrList.hasChildNodes()) {
      contrList.removeChild(contrList.firstChild);
    }

    parsedContr.forEach(contributor => {
      //List element:
      let contrCard = Util.createAndAppend("li", contrList, {
        class: "contributorCard"
      });

      //Picture:
      let contrPicBox = Util.createAndAppend("div", contrCard, {
        class: "contrPicBox"
      });
      let contrPic = Util.createAndAppend("img", contrPicBox, {
        class: "contributorPic"
      });
      contrPic.src = contributor.avatar_url;

      //Contributor name with link to the profile:
      let contrLinkBox = Util.createAndAppend("div", contrCard, {
        class: "contrLinkBox"
      });
      let contrProfileLink = Util.createAndAppend("a", contrLinkBox, {
        id: "contributorName"
      });
      contrProfileLink.setAttribute("target", "_blank");
      contrProfileLink.href = contributor.html_url;
      contrProfileLink.innerText = contributor.login;

      //Contributor badges:
      let contrBadgeBox = Util.createAndAppend("div", contrCard, {
        class: "contrBadgeBox"
      });
      let contrBadge = Util.createAndAppend("p", contrBadgeBox, {
        class: "contributorBadge"
      });
      contrBadge.innerText = contributor.contributions;
    });
  }

  static dataRender(obj) {
    let comboMenu = document.getElementById("comboMenu");
    let repoInfo = document.getElementById("tableBud");

    for (let key in obj) {
      if (obj[key].name === comboMenu.options[comboMenu.selectedIndex].text) {
        //Repository part:

        let repHead = Util.createAndAppend("tr", repoInfo);
        let repHeadLabel = Util.createAndAppend("td", repHead, {
          text: "Repository: "
        });
        repHeadLabel.className = "labels";
        let repHeadInfo = Util.createAndAppend("td", repHead);
        let repLink = Util.createAndAppend("a", repHeadInfo);
        repLink.setAttribute("target", "_blank");
        repLink.href = obj[key].html_url;
        repLink.innerText = obj[key].name;

        //Description part:

        let descHead = Util.createAndAppend("tr", repoInfo);
        let descHeadLabel = Util.createAndAppend("td", descHead, {
          text: "Description: "
        });
        descHeadLabel.className = "descLabel";
        let descHeadInfo = Util.createAndAppend("td", descHead, {
          class: "descInfo"
        });
        descHeadInfo.innerText = obj[key].description;

        //Forks part:

        let forkHead = Util.createAndAppend("tr", repoInfo);
        let forkHeadLabel = Util.createAndAppend("td", forkHead, {
          text: "Forks: "
        });
        forkHeadLabel.className = "labels";
        let forkHeadInfo = Util.createAndAppend("td", forkHead);
        forkHeadInfo.innerText = obj[key].forks;

        //Updated part:

        let updateHead = Util.createAndAppend("tr", repoInfo);
        let updateHeadLabel = Util.createAndAppend("td", updateHead, {
          text: "Updated: "
        });
        updateHeadLabel.className = "labels";
        let updateHeadInfo = Util.createAndAppend("td", updateHead);
        let date = new Date(obj[key].updated_at);
        date = date.toUTCString();
        updateHeadInfo.innerText = date;

        //Passing contributor url data to the function with promise:
        let contrUrl = obj[key].contributors_url;
        Util.fetchJSON(contrUrl).then(data => Util.getContributors(data));
      }
    }
  }
}
