import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {string | URL} url
 */
function getDirname(url) {
  return path.dirname(fileURLToPath(url));
}

export default getDirname;
