import dotenv from 'dotenv'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import fetch from '../utils/fetch.mjs'
import getDirname from '../utils/getDirname.mjs'

const dirname = getDirname(import.meta.url)

dotenv.config({ path: path.resolve(dirname, '..', '.env') })

async function execute() {
  const secret = process.env.FAUNA_KEY
  const apiDomain = process.env.FAUNA_DOMAIN.replace('db', 'graphql')

  const schemaBuffer = await readFile(path.resolve(dirname, '..', 'schema.gql'))

  try {
    console.info('\nImporting graphql schema...')

    const response = await fetch.post(
      `https://${apiDomain}/import`,
      schemaBuffer,
      {
        authorization: `Bearer ${secret}`,
      }
    )

    console.info(response.statusCode, response.statusMessage)
  } catch (error) {
    console.error(error.statusCode, error.statusMessage, '\n\n', error.data)
    process.exit(1)
  }
}

execute()
