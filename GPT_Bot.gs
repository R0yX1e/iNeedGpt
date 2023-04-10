var TELEGRAM_BOT_API = PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_API');
var CHATGPT_API = PropertiesService.getScriptProperties().getProperty('CHATGPT_API');
var USER_ID = PropertiesService.getScriptProperties().getProperty('USER_ID');
var GPT_MODLE = PropertiesService.getScriptProperties().getProperty('GPT_MODLE');

var webhook_url = "";
var telegram_url = "https://api.telegram.org/bot" + TELEGRAM_BOT_API;
var openai_url = "https://api.openai.com/v1/chat/completions";

function testChatGPT() {
    var requests = {
        "method": "POST",
        "headers": {
            "Authorization": "Bearer " + CHATGPT_API,
            "Content-Type": "application/json"
        },
        "payload": JSON.stringify({
            "model": GPT_MODLE,
            "messages": [{ "role": "user", "content": "Say this is a test!" }]
        })
    }
    var response = UrlFetchApp.fetch(openai_url, requests);
    Logger.log(response);
}

function testTelegram() {
    var url = telegram_url + "/getMe";
    var response = UrlFetchApp.fetch(url);
    Logger.log(response.getContentText());
}

function setTelegram() {
    var url = telegram_url + "/setWebhook";
    var requests = {
        "method": "POST",
        "payload": {
            "url": webhook_url
        }
    }
    var response = UrlFetchApp.fetch(url, requests);
    Logger.log(response.getContentText());
}

function doPost(getjson) {
    var data = JSON.parse(getjson.postData.contents);
    var id = data.message.chat.id;

    if (id == USER_ID) {
        if (!data.message.text) {
            Logger.log("无法处理非文字信息");
            return;
        }
        var user_message = data.message.text;
    } else {
        sendTelegram(id, "你不是我的主人");
        Logger.log("非法用户访问");
        return;
    }
    var back_gpt_data = sendGPT(user_message);
    sendTelegram(id, back_gpt_data);
}


function sendGPT(text) {
    var headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + CHATGPT_API
    };

    var body = {
        "model": GPT_MODLE,
        "messages": [{ "role": "user", "content": text }],
        // "prompt": text,
        // "max_tokens": 50,
        // "temperature": 0.5,
        // "top_p": 1,
        // "frequency_penalty": 0,
        // "presence_penalty": 0
    };

    var options = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(body)
    };

    var response = JSON.parse(UrlFetchApp.fetch(openai_url, options));
    var result = response.choices[0].message.content;

    return result;
}


function sendTelegram(id, message) {
    var url = telegram_url + "/sendMessage";
    var headers = {
        "Content-Type": "application/json",
    }
    var body = {
        "chat_id": id,
        "text": message
    };

    var options = {
        "method": "POST",
        "headers": headers,
        "payload": JSON.stringify(body)
    };

    UrlFetchApp.fetch(url, options);
}