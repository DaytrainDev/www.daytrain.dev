/*:
 * @target MZ
 * @plugindesc Connects RPG Maker MZ to the DaytrainDev API for dynamic data loading.
 * @author DaytrainDev
 *
 * @param apiBasePath
 * @text API Base Path
 * @desc The base path for API requests
 * @type string
 * @default /api/rpg
 *
 * @help
 * ============================================================================
 * DaytrainDev Plugin
 * ============================================================================
 *
 * This plugin allows you to fetch JSON data from the DaytrainDev API
 * and use it in your game alongside the standard data files.
 *
 * ============================================================================
 * Script Calls
 * ============================================================================
 *
 * DaytrainDev.fetch(endpoint, callback)
 *   - Fetches data from the API
 *   - endpoint: The API endpoint (e.g., "players", "items/1")
 *   - callback: Function called with the response data
 *
 * DaytrainDev.fetchAsync(endpoint)
 *   - Returns a promise for async/await usage
 *
 * DaytrainDev.getData(key)
 *   - Returns cached data by key
 *
 * DaytrainDev.setData(key, value)
 *   - Stores data in the cache
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * @command fetch
 * @text Fetch API Data
 * @desc Fetches data from the API and stores it
 *
 * @arg endpoint
 * @text Endpoint
 * @desc The API endpoint to fetch from
 * @type string
 *
 * @arg variableId
 * @text Store in Variable
 * @desc Game variable ID to store the result (as JSON string)
 * @type variable
 * @default 0
 *
 * @command post
 * @text Post API Data
 * @desc Posts data to the API
 *
 * @arg endpoint
 * @text Endpoint
 * @desc The API endpoint to post to
 * @type string
 *
 * @arg data
 * @text Data
 * @desc JSON string to send (can use \V[n] for variables)
 * @type string
 *
 * @arg variableId
 * @text Store Response in Variable
 * @desc Game variable ID to store the response
 * @type variable
 * @default 0
 */

(() => {
  "use strict";

  const pluginName = "DaytrainDev";
  const parameters = PluginManager.parameters(pluginName);
  const apiBasePath = parameters["apiBasePath"] || "/api/rpg";

  // Data cache for storing fetched API data
  const dataCache = {};

  // Main plugin object
  window.DaytrainDev = {
    // Cache management
    getData: function (key) {
      return dataCache[key];
    },

    setData: function (key, value) {
      dataCache[key] = value;
    },

    clearData: function (key) {
      if (key) {
        delete dataCache[key];
      } else {
        Object.keys(dataCache).forEach((k) => delete dataCache[k]);
      }
    },

    // Fetch data from API with callback
    fetch: function (endpoint, callback, errorCallback) {
      const url = `${apiBasePath}/${endpoint}`;

      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          if (callback) callback(data);
        })
        .catch((error) => {
          console.error(`[DaytrainDev] Fetch error:`, error);
          if (errorCallback) errorCallback(error);
        });
    },

    // Fetch data from API (Promise-based)
    fetchAsync: function (endpoint) {
      const url = `${apiBasePath}/${endpoint}`;

      return fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      });
    },

    // Post data to API with callback
    post: function (endpoint, data, callback, errorCallback) {
      const url = `${apiBasePath}/${endpoint}`;

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        })
        .then((responseData) => {
          if (callback) callback(responseData);
        })
        .catch((error) => {
          console.error(`[DaytrainDev] Post error:`, error);
          if (errorCallback) errorCallback(error);
        });
    },

    // Post data to API (Promise-based)
    postAsync: function (endpoint, data) {
      const url = `${apiBasePath}/${endpoint}`;

      return fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(data),
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      });
    },

    // Fetch and cache data
    fetchAndCache: function (endpoint, cacheKey, callback) {
      this.fetch(
        endpoint,
        (data) => {
          this.setData(cacheKey || endpoint, data);
          if (callback) callback(data);
        },
        null
      );
    },

    // Get player session info
    getSession: function (callback) {
      this.fetch("session", callback);
    },
  };

  // Plugin Commands
  PluginManager.registerCommand(pluginName, "fetch", function (args) {
    const endpoint = args.endpoint;
    const variableId = Number(args.variableId) || 0;
    const interpreter = this;

    interpreter.setWaitMode("DaytrainDev");

    DaytrainDev.fetch(
      endpoint,
      (data) => {
        if (variableId > 0) {
          $gameVariables.setValue(variableId, JSON.stringify(data));
        }
        DaytrainDev.setData(endpoint, data);
        interpreter.setWaitMode("");
      },
      () => {
        interpreter.setWaitMode("");
      }
    );
  });

  PluginManager.registerCommand(pluginName, "post", function (args) {
    const endpoint = args.endpoint;
    const variableId = Number(args.variableId) || 0;
    const interpreter = this;

    let dataStr = args.data || "{}";
    dataStr = dataStr.replace(/\\V\[(\d+)\]/gi, (_, id) => {
      return $gameVariables.value(Number(id));
    });

    let data;
    try {
      data = JSON.parse(dataStr);
    } catch (e) {
      console.error("[DaytrainDev] Invalid JSON in post command:", dataStr);
      return;
    }

    interpreter.setWaitMode("DaytrainDev");

    DaytrainDev.post(
      endpoint,
      data,
      (responseData) => {
        if (variableId > 0) {
          $gameVariables.setValue(variableId, JSON.stringify(responseData));
        }
        interpreter.setWaitMode("");
      },
      () => {
        interpreter.setWaitMode("");
      }
    );
  });

  // Extend Game_Interpreter to handle our wait mode
  const _Game_Interpreter_updateWaitMode =
    Game_Interpreter.prototype.updateWaitMode;
  Game_Interpreter.prototype.updateWaitMode = function () {
    if (this._waitMode === "DaytrainDev") {
      return true;
    }
    return _Game_Interpreter_updateWaitMode.call(this);
  };
})();
