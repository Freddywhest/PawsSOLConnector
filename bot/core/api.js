const app = require("../config/app");
const logger = require("../utils/logger");
const sleep = require("../utils/sleep");
const _ = require("lodash");

class ApiRequest {
  constructor(session_name, bot_name) {
    this.session_name = session_name;
    this.bot_name = bot_name;
  }

  async get_user_data(http_client) {
    try {
      const response = await http_client.get(`${app.apiUrl}/v1/user`);
      return response.data;
    } catch (error) {
      if (error?.response?.status > 499) {
        logger.error(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Server Error while <b>getting user data:</b>: ${error.message}`
        );
        return null;
      }

      if (error?.response?.data?.message) {
        logger.warning(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting user data:</b> ${error?.response?.data?.message}`
        );
        return null;
      }

      logger.error(
        `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>getting user data:</b>: ${error.message}`
      );
      return null;
    }
  }

  async validate_query_id(http_client, data) {
    try {
      const response = await http_client.post(
        `${app.apiUrl}/v1/user/auth`,
        JSON.stringify(data)
      );

      if (response.data?.data?.[0]) {
        return true;
      }

      return false;
    } catch (error) {
      if (
        error?.response?.data?.error?.toLowerCase()?.includes("invalid") ||
        error?.response?.data?.error?.toLowerCase()?.includes("expired")
      ) {
        return false;
      }

      throw error;
    }
  }

  async link_wallet(http_client, wallet) {
    try {
      const response = await http_client.post(
        `${app.apiUrl}/v1/user/sol-wallet`,
        JSON.stringify({ wallet })
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status > 499) {
        logger.error(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Server Error while <b>linking wallet:</b>: ${error.message}`
        );
        return null;
      }

      if (error?.response?.data?.message) {
        logger.warning(
          `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>linking wallet:</b> ${error?.response?.data?.message}`
        );
        return null;
      }

      logger.error(
        `<ye>[${this.bot_name}]</ye> | ${this.session_name} | Error while <b>linking wallet:</b>: ${error.message}`
      );
      return null;
    }
  }
}

module.exports = ApiRequest;
