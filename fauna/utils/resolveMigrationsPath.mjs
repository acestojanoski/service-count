import path from 'node:path'
import getDirname from './getDirname.mjs'

const dirname = getDirname(import.meta.url)

function resolveMigrationsPath() {
  return path.resolve(dirname, '..', 'migrations')
}

export default resolveMigrationsPath
