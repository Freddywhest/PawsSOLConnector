> [<img src="https://img.shields.io/badge/Telegram-%40Me-orange">](https://t.me/roddyfred)

# Use Node.Js 18 or greater

## Functionality

| Functional                            | Supported |
| ------------------------------------- | :-------: |
| Auto creating SOL wallet and linking  |    ✅     |
| Multithreading                        |    ✅     |
| Binding a proxy to a session          |    ✅     |
| Binding a proxy to a session/query_id |    ✅     |

## [How to add query id](https://github.com/Freddywhest/RockyRabbitBot/blob/main/AddQueryId.md)

## [Settings](https://github.com/FreddyWhest/PawsSOLConnector/blob/main/.env-example)

| Settings                       | Description                                                                |
| ------------------------------ | -------------------------------------------------------------------------- |
| **API_ID / API_HASH**          | Platform data from which to launch a Telegram session (stock - Android)    |
| **DELAY_BETWEEN_STARTING_BOT** | Delay between starting in seconds (eg. [20, 30])                           |
| **USE_PROXY_FROM_JS_FILE**     | Whether to use proxy from the `bot/config/proxies.js` file (True / False)  |
| **USE_PROXY_FROM_TXT_FILE**    | Whether to use proxy from the `bot/config/proxies.txt` file (True / False) |

## Installation

You can download [**Repository**](https://github.com/FreddyWhest/PawsSOLConnector) by cloning it to your system and installing the necessary dependencies:

```shell
~ >>> git clone https://github.com/FreddyWhest/PawsSOLConnector.git
~ >>> cd PawsSOLConnector

#Linux and MocOS
~/PawsSOLConnector >>> chmod +x check_node.sh
~/PawsSOLConnector >>> ./check_node.sh

OR

~/PawsSOLConnector >>> npm install
~/PawsSOLConnector >>> cp .env-example .env
~/PawsSOLConnector >>> nano .env # Here you must specify your API_ID and API_HASH , the rest is taken by default
~/PawsSOLConnector >>> node index.js

#Windows
1. Double click on INSTALL.bat in PawsSOLConnector directory to install the dependencies
2. Double click on START.bat in PawsSOLConnector directory to start the bot

OR

~/PawsSOLConnector >>> npm install
~/PawsSOLConnector >>> cp .env-example .env
~/PawsSOLConnector >>> # Specify your API_ID and API_HASH, the rest is taken by default
~/PawsSOLConnector >>> node index.js
```

Also for quick launch you can use arguments, for example:

```shell
~/PawsSOLConnector >>> node index.js --action=1

OR

~/PawsSOLConnector >>> node index.js --action=2

#1 - Create session
#2 - Run clicker
```
