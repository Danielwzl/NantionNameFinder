
let prevName = null;
let nationality = null;
const apiKey = [ '449681effd4a58514c015c68b0589180', 'daa0794b76372ed73511396c01cba011', '948a46cb512550ba710b8e2030df37ea', '7360d6506be7f064221dd29c13665dfb', '4caffb7fd6f2c33b8260cb0fdab8fea1']; // Replace with your NamSor API key
const popup = document.createElement('div');


popup.id = 'wzl02_popup';
popup.className = 'popup';
popup.textContent = 'Popup Text';

// Add some styles to the popup element
popup.style.position = 'fixed';
popup.style.background = 'white';
popup.style.border = '1px solid black';
popup.style.padding = '30px';
popup.style.display = 'none';
popup.style.color = 'black'; // Set the font color to blue
popup.style.zIndex = 99;

document.body.appendChild(popup);

document.addEventListener("mouseup", async function(event) {
  let status = null;
  const lastName = event.target.textContent.trim();
  
  if(apiKey.length > 0){
    status = await getNationality(lastName); 
  }
  while(status == "Limited API calls" && apiKey.length > 0) {
    console.log(apiKey[0]);
    apiKey.shift();
    status = await getNationality(lastName, status);
  }
});

async function getNationality(name, status) {
  if(prevName == name && status != "Limited API calls") {
    popup.textContent = nationality;
    popup.style.display = 'block';
    return nationality;
  }
  prevName = name;
  
  var body = {
    "personalNames": [
      {
        "name": name
      }
    ]
  };

  try {
    const response = await fetch("https://v2.namsor.com/NamSorAPIv2/api2/json/countryBatch", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey[0],
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (response.status === 403) {
      throw new Error("403");
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    var getCountryNames = new Intl.DisplayNames(['zh-Hans'], {type: 'region'});
    const countriesTop = data.personalNames[0].countriesTop;
    const mostProbableCountry = getCountryNames.of(countriesTop[0]);
    console.log("Possible countries:", countriesTop.map(c => getCountryNames.of(c)));
    nationality = mostProbableCountry + ", " + getCountryNames.of(countriesTop[1]) + ", " + getCountryNames.of(countriesTop[2])
    popup.textContent = nationality;
    popup.style.display = 'block';
    return null;
  } catch (err) {
    if (err.message === "403") {
      return "Limited API calls";
    }
    return "error: " + err.message;
  }
}

function getSelectedText() {
  if (window.getSelection) {
      return window.getSelection().toString();
  } else if (document.selection) {
      return document.selection.createRange().text;
  }
  return '';
}


// Listen for the mousemove event
document.addEventListener('mousemove', function(event) {
  // Update the position of the popup to follow the mouse
  popup.style.left = (event.clientX + 30) + 'px';
  popup.style.top = (event.clientY + 30) + 'px';
});

// Hide the popup when the mouse leaves an element
document.addEventListener('mousedown', function(event) {
  // Hide the popup element
  popup.style.display = 'none';
});