const { default: axios } = require("axios");
const logger = require("../utils/logger");
const headers = require("./header");
const settings = require("../config/config");
const app = require("../config/app");
const user_agents = require("../config/userAgents");
const fs = require("fs");
const sleep = require("../utils/sleep");
const ApiRequest = require("./api");
const _ = require("lodash");
const path = require("path");
const { HttpsProxyAgent } = require("https-proxy-agent");
const parser = require("../utils/parser");
const { createWallet } = require("../utils/helper");

class NonSessionTapper {
  constructor(query_id, query_name) {
    this.bot_name = "paws";
    this.session_name = query_name;
    this.query_id = query_id;
    this.API_URL = app.apiUrl;
    this.session_user_agents = this.#load_session_data();
    this.headers = { ...headers, "user-agent": this.#get_user_agent() };
    this.api = new ApiRequest(this.session_name, this.bot_name);
  }

  #load_session_data() {
    try {
      const filePath = path.join(process.cwd(), "session_user_agents.json");
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        return {};
      } else {
        throw error;
      }
    }
  }

  #get_random_user_agent() {
    const randomIndex = Math.floor(Math.random() * user_agents.length);
    return user_agents[randomIndex];
  }

  #get_user_agent() {
    if (this.session_user_agents[this.session_name]) {
      return this.session_user_agents[this.session_name];
    }

    logger.info(
      `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Generating new user agent...`
    );

    const newUserAgent = this.#get_random_user_agent();
    this.session_user_agents[this.session_name] = newUserAgent;
    this.#save_session_data(this.session_user_agents);
    return newUserAgent;
  }

  #save_session_data(session_user_agents) {
    const filePath = path.join(process.cwd(), "session_user_agents.json");
    fs.writeFileSync(filePath, JSON.stringify(session_user_agents, null, 2));
  }

  #proxy_agent(proxy) {
    try {
      if (!proxy) return null;
      let proxy_url;
      if (!proxy.password && !proxy.username) {
        proxy_url = `${proxy.protocol}://${proxy.ip}:${proxy.port}`;
      } else {
        proxy_url = `${proxy.protocol}://${proxy.username}:${proxy.password}@${proxy.ip}:${proxy.port}`;
      }
      return new HttpsProxyAgent(proxy_url);
    } catch (e) {
      logger.error(
        `<ye>[${this.bot_name}]</ye> | ${
          this.session_name
        } | Proxy agent error: ${e}\nProxy: ${JSON.stringify(proxy, null, 2)}`
      );
      return null;
    }
  }

  async #get_tg_web_data() {
    try {
      const jsonData = {
        data: `${this.query_id}`,
      };

      return jsonData;
    } catch (error) {
      logger.error(
        `<ye>[${this.bot_name}]</ye> | ${this.session_name} | ❗️Unknown error during Authorization: ${error}`
      );
      throw error;
    } finally {
      await sleep(1);
      logger.info(
        `<ye>[${this.bot_name}]</ye> | ${this.session_name} | 🚀 Starting session...`
      );
    }
  }

  async #get_access_token(tgWebData, http_client) {
    try {
      const response = await http_client.post(
        `${app.apiUrl}/v1/user/auth`,
        JSON.stringify(tgWebData)
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.error) {
        logger.error(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | ❗️ Error while getting Access Token: ${error?.response?.data?.message}`
        );
        return null;
      }
      if (error?.response?.status > 499) {
        logger.error(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Server Error, retrying again after sleep...`
        );
        await sleep(1);
        return null;
      } else {
        logger.error(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | ❗️Unknown error while getting Access Token: ${error}`
        );
        await sleep(3); // 3 seconds delay
      }
    }
  }

  async #check_proxy(http_client, proxy) {
    try {
      const response = await http_client.get("https://httpbin.org/ip");
      const ip = response.data.origin;
      logger.info(
        `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Proxy IP: ${ip}`
      );
    } catch (error) {
      if (
        error.message.includes("ENOTFOUND") ||
        error.message.includes("getaddrinfo") ||
        error.message.includes("ECONNREFUSED")
      ) {
        logger.error(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error: Unable to resolve the proxy address. The proxy server at ${proxy.ip}:${proxy.port} could not be found. Please check the proxy address and your network connection.`
        );
        logger.error(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | No proxy will be used.`
        );
      } else {
        logger.error(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Proxy: ${proxy.ip}:${proxy.port} | Error: ${error.message}`
        );
      }

      return false;
    }
  }

  async run(proxy) {
    let http_client;
    let access_token_created_time = 0;

    let profile_data;
    let tg_web_data;
    let runCount = 0;

    if (
      (settings.USE_PROXY_FROM_TXT_FILE || settings.USE_PROXY_FROM_JS_FILE) &&
      proxy
    ) {
      http_client = axios.create({
        httpsAgent: this.#proxy_agent(proxy),
        headers: this.headers,
        withCredentials: true,
      });
      const proxy_result = await this.#check_proxy(http_client, proxy);
      if (!proxy_result) {
        http_client = axios.create({
          headers: this.headers,
          withCredentials: true,
        });
      }
    } else {
      http_client = axios.create({
        headers: this.headers,
        withCredentials: true,
      });
    }
    while (runCount < 1) {
      try {
        const currentTime = _.floor(Date.now() / 1000);
        if (currentTime - access_token_created_time >= 3600) {
          tg_web_data = await this.#get_tg_web_data();
          if (
            _.isNull(tg_web_data) ||
            _.isUndefined(tg_web_data) ||
            !tg_web_data ||
            _.isEmpty(tg_web_data)
          ) {
            logger.info(
              `<ye>[${this.bot_name}]</ye> | ${this.session_name} | No access token found.`
            );
            continue;
          }

          const get_token = await this.#get_access_token(
            tg_web_data,
            http_client
          );

          http_client.defaults.headers[
            "authorization"
          ] = `Bearer ${get_token?.data[0]}`;
          access_token_created_time = currentTime;
          await sleep(2);
        }

        // Get profile data
        profile_data = await this.api.get_user_data(http_client);

        if (_.isEmpty(profile_data?.data)) {
          logger.info(
            `<ye>[${this.bot_name}]</ye> | ${this.session_name} | No profile data found. Skipping.....`
          );
          continue;
        }

        logger.info(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Balance: <la>${profile_data?.data?.gameData?.balance}</la>`
        );

        // Connect sol wallet
        if (!profile_data?.data?.userData?.solanaWallet) {
          const address = await createWallet(
            this.session_name,
            profile_data?.data?.userData?.username
          );

          if (_.isString(address?.wallet_address)) {
            logger.info(
              `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Wallet address: <la>${address?.wallet_address}</la>`
            );
            const connect_wallet = await this.api.link_wallet(
              http_client,
              address?.wallet_address
            );

            if (connect_wallet?.success) {
              logger.success(
                `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Wallet linked successfully.`
              );
            }
          } else {
            logger.error(
              `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while getting wallet address.`
            );
          }
        } else {
          logger.info(
            `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Wallet already connected | Wallet address: <la>${profile_data?.data?.userData?.solanaWallet}</la>`
          );
        }

        await sleep(_.random(2, 5));
      } catch (error) {
        logger.error(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | ❗️Unknown error: ${error}`
        );
      } finally {
        runCount++;
      }
    }
  }
}
module.exports = NonSessionTapper;
