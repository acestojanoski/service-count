import faunadb from "faunadb";

/** @type {import('faunadb').Client | null} */
let client = null;

function createClient() {
  if (!client) {
    const domain = process.env.FAUNA_DOMAIN;

    client = new faunadb.Client({
      domain,
      secret: process.env.FAUNA_KEY,
    });
  }

  return client;
}

export default createClient;
