import path from 'node:path'
import enquirer from 'enquirer'
import { readFile, writeFile } from 'node:fs/promises'
import resolveMigrationsPath from '../utils/resolveMigrationsPath.mjs'

const migrationsPath = resolveMigrationsPath()

async function execute() {
  const { migrationName } = await enquirer.prompt([
    {
      name: 'migrationName',
      message: 'Migration name:',
      type: 'text',
    },
  ])

  const template = await readFile(
    path.resolve(migrationsPath, 'template.mjs'),
    'utf-8'
  )

  await writeFile(
    path.resolve(migrationsPath, `${Date.now()}-${migrationName}.mjs`),
    template,
    'utf-8'
  )
}

execute()
