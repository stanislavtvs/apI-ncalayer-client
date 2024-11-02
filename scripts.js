function errortext(text) {
    document.getElementById("error").innerHTML = text;
}
function clearerrortext() {
    document.getElementById("error").innerHTML = "";
}

async function connectAndSign(base64EncodedData) {
    const ncalayerClient = new NCALayerClient();
  
    try {
      await ncalayerClient.connect();
    } catch (error) {
        errortext(`Не удалось подключиться к NCALayer: ${error.toString()}`);
      return;
    }
  
    let activeTokens;
    try {
      activeTokens = await ncalayerClient.getActiveTokens();
    } catch (error) {
      alert(error.toString());
      return;
    }
  
    const storageType = activeTokens[0] || NCALayerClient.fileStorageType;
  
    let base64EncodedSignature;
    try {
      base64EncodedSignature = await ncalayerClient.createCAdESFromBase64(storageType, base64EncodedData);
    } catch (error) {
      alert(error.toString());
      return;
    }
  
    return base64EncodedSignature;
}

  function someFunc(json,type) {
    console.log(json)
    if (type == "bs4") {
        success_get_nonce(json.nonce)
    }
    else if (type == "user") {
        console.log(json);
        if (json.subjectStructure[0][0].value != "") {
            clearerrortext();
        }
        document.getElementById("name_and_surname").innerHTML = "Фамилия и имя: "+json.subjectStructure[0][0].value;
        document.getElementById("iin").innerHTML = "ИИН : "+json.userId.substring(3);
    }
  }


async function auth(data,type) {

    await fetch('https://sigex.kz/api/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(async response => someFunc(await response.json(),type))
}
function get_nonce() {
    const dataUser = {};
    auth(dataUser,"bs4");
}
function get_user(base64,token) {
    const dataUser = {
        "nonce": base64,
        "signature": token,
        "external": false
    };
    auth(dataUser,"user")
}


function success_get_nonce(result) {
    result_connectAndSign = connectAndSign(result)
    result_connectAndSign.then(onFulfilled => get_user(result,onFulfilled))
    result_connectAndSign.then(null, onRejected => console.log("Ошибка :"+onRejected))
}

var btn = document.getElementById("btn");
btn.addEventListener('click', get_nonce);