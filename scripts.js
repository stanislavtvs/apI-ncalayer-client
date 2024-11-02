function displaysErrorText(text) {
    document.getElementById("error").innerHTML = text;
}

function eraseErrorText() {
    document.getElementById("error").innerHTML = "";
}

async function connectionsToNcalayer(base64EncodedData) {
    const ncalayerClient = new NCALayerClient();
  
    try {
      await ncalayerClient.connect();
    } catch (error) {
        displaysErrorText(`Не удалось подключиться к NCALayer: ${error.toString()}`);
      return;
    }
  
    let activeTokens;
    try {
      activeTokens = await ncalayerClient.getActiveTokens();
    } catch (error) {
      displaysErrorText(error.toString());
      return;
    }
  
    const storageType = activeTokens[0] || NCALayerClient.fileStorageType;
  
    let base64EncodedSignature;
    try {
      base64EncodedSignature = await ncalayerClient.createCAdESFromBase64(storageType, base64EncodedData);
    } catch (error) {
      displaysErrorText(error.toString());
      return;
    }
  
    return base64EncodedSignature;
}

function finalDataPreparationAndOutput(json,type) {
    console.log(json)
    if (type == "bs4") {
        takingTheKeyAndAuthorization(json.nonce)
    }
    else if (type == "user") {
        if (json.subjectStructure[0][0].value != "") {
            eraseErrorText();
        }
        document.getElementById("name_and_surname").innerHTML = "Фамилия и имя: "+json.subjectStructure[0][0].value;
        document.getElementById("iin").innerHTML = "ИИН : "+json.userId.substring(3);
    }
}

async function authorization(data,type) {

    await fetch('https://sigex.kz/api/auth', {
        credentials: "same-origin",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(async response => finalDataPreparationAndOutput(await response.json(),type))
}

function getNonce() {
    const dataUser = {};
    authorization(dataUser,"bs4");
}

function getUser(base64,token) {
    const dataUser = {
        "nonce": base64,
        "signature": token,
        "external": false
    };
    authorization(dataUser,"user")
}

function takingTheKeyAndAuthorization(result) {
    resultConnectionsToNcalayer = connectionsToNcalayer(result)
    resultConnectionsToNcalayer.then(onFulfilled => getUser(result,onFulfilled))
    resultConnectionsToNcalayer.then(null, onRejected => displaysErrorText("Ошибка :"+onRejected))
}

var btn = document.getElementById("btn");
btn.addEventListener('click', getNonce);