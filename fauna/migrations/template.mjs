import faunadb from "faunadb";
import createClient from "../utils/createClient.mjs";

const { query: q } = faunadb;

export async function migration() {
  const client = createClient();
}

export async function applied() {
  const client = createClient();
}
