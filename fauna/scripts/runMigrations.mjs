import dotenv from 'dotenv'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import getDirname from '../utils/getDirname.mjs'
import resolveMigrationsPath from '../utils/resolveMigrationsPath.mjs'

const dirname = getDirname(import.meta.url)

dotenv.config({ path: path.resolve(dirname, '..', '.env') })

const migrationsPath = resolveMigrationsPath()

async function execute() {
  const migrationFiles = (await readdir(migrationsPath)).filter(
    (file) => file !== 'template.mjs'
  )

  for await (const file of migrationFiles) {
    console.info(`\nRunning migration \`${file.replace('.mjs', '')}\`...`)

    const { applied, migration } = await import(
      path.resolve(migrationsPath, file)
    )

    if (!(await applied())) {
      await migration()
    } else {
      console.info('Skipping. Migration is already applied.')
    }
  }
}

execute()
