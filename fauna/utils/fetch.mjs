import https from "https";

/** @typedef {string | URL} Url */
/** @typedef {Record<string, string>} Headers */
/** @typedef {string | Buffer} Body */

/**
 * @param {Url} url
 * @param {{method?: string, body?: Body, headers?: Headers}} options
 * @returns {Promise<{statusCode: number, statusMessage: string, headers: Headers, data: string}>}
 */
async function fetch(url, { method = "GET", headers, body } = {}) {
  const promise = new Promise((resolve, reject) => {
    let data = "";

    const request = https.request(
      url,
      {
        method,
        headers,
      },
      (response) => {
        response.on("data", (chunk) => (data += chunk));

        response.on("end", () => {
          const statusCode = response.statusCode;
          const statusMessage = response.statusMessage;
          const headers = response.headers;

          if (statusCode >= 400) {
            const error = new Error(response.statusMessage);
            error.statusCode = statusCode;
            error.statusMessage = statusMessage;
            error.headers = headers;
            error.data = data;
            reject(error);
          } else {
            resolve({
              statusCode,
              statusMessage,
              headers,
              data,
            });
          }
        });
      }
    );

    request.on("error", reject);

    if (body) {
      request.write(body);
    }

    request.end();
  });

  return promise;
}

/**
 * @param {Url} url
 * @param {Headers} headers
 */
fetch.get = (url, headers) => fetch(url, { headers });

/**
 * @param {Url} url
 * @param {Body} body
 * @param {Headers} headers
 * @returns
 */
fetch.post = (url, body, headers) =>
  fetch(url, { method: "POST", body, headers });

export default fetch;
