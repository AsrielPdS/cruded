import { red, reset, yellow } from 'kolorist'
import minimist from 'minimist'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'

// Avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist<{
  mode?: "dark" | "light";
  theme?: "basic";
}>(process.argv.slice(2), { string: ['_'] })
const cwd = process.cwd()

type Bundler = string;
type Theme = {
  name: string;
  style?: boolean;
};
type Src = {
  title: string;
  v?: string;
  conn?: string[];
  lang?: string[];
  disabled?: boolean
};

const bundler: Bundler[] = [
  "vite"
];
const themes: Theme[] = [
  { name: "basic", style: true },
  { name: "semantic" },
  { name: "bootstrap" },
  { name: "material" },
];
const srcs: Src[] = [
  { title: "Array    ", conn: [], lang: [], v: "array" },
  { title: "IndexedDB", conn: [], lang: [], v: "idb" },
  { title: "---------", disabled: true },
  { title: "Cassandra", conn: ["gq", "fetch"]/*    */, lang: ["js", "net", "py"], v: "cas", },
  { title: "DynamoDB ", conn: ["gq", "fetch"]/*    */, lang: ["js", "net", "py"], v: "dd", },
  { title: "Firebase ", conn: ["gq", "fetch"]/*    */, lang: ["js", "net", "py"], v: "fb", },
  { title: "MariaDB  ", conn: ["gq", "fetch"]/*    */, lang: ["js", "net", "py"], v: "maria", },
  { title: "MongoDB  ", conn: ["gq", "fetch", "less"], lang: ["js", "net", "py"], v: "mongo", },
  { title: "MySql    ", conn: ["gq", "fetch"]/*    */, lang: ["js", "net", "py"], v: "my", },
  { title: "Redis    ", conn: ["gq", "fetch"]/*    */, lang: ["js", "net", "py"], v: "redis", },
  { title: "Sql SERVE", conn: ["gq", "fetch"]/*    */, lang: ["js", "net", "py"], v: "ss", },
  { title: "Postgre  ", conn: ["gq", "fetch"]/*    */, lang: ["js", "net", "py"], v: "pg", },
];
const conns = [
  { title: "Fetch API", value: "fetch" },
  { title: "GraphQL", value: "gq" },
  { title: "Serverless", value: "less" },
];
const langs = [
  { title: "Asp.NET", conn: ["fetch"]/*  */, value: "net" },
  { title: "Node.JS", conn: ["fetch", "gq"], value: "js" },
  { title: "Python ", conn: ["fetch"]/*  */, value: "py" },
];
// type ColorFunc = (str: string | number) => string

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
}
const replaces = {
  "vite.config.mjs": { theme_css: (v) => `${v.theme}.css` },
  "index.html": {
    doc_lang: (v) => v.lang,
    start: (v) => 'index.' + (v.ts ? 'ts' : 'js'),
  },
};
const defaultTargetDir = 'cruded-project'

async function init() {
  const argTargetDir = formatTargetDir(argv._[0])

  let targetDir = argTargetDir || defaultTargetDir
  const getProjectName = () =>
    targetDir === '.' ? path.basename(path.resolve()) : targetDir

  // let result: prompts.Answers<
  //   'projectName' | 'overwrite' | 'packageName' | 'theme' | 'mode'
  // >

  try {
    // user choice associated with prompts
    var { mode, lang, overwrite, packageName, projectName } = await prompts(
      [
        {
          type: argTargetDir ? null : 'text',
          name: 'projectName',
          message: reset('Project name:'),
          initial: defaultTargetDir,
          onState(state) {
            targetDir = formatTargetDir(state.value) || defaultTargetDir
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'confirm',
          name: 'overwrite',
          message: () =>
            (targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
        },
        {
          type: (_, { overwrite }: { overwrite?: boolean }) => {
            if (overwrite === false) {
              throw new Error(red('✖') + ' Operation cancelled')
            }
            return null
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: reset('Package name:'),
          initial: () => toValidPackageName(getProjectName()),
          validate: (dir) =>
            isValidPackageName(dir) || 'Invalid package.json name',
        },
        {
          type: 'confirm',
          name: 'ts',
          message: reset('Use TypeScript:'),
        },
        // {
        {
          type: null,//"select",
          name: 'theme',
          message: reset('Theme:'),
          choices: themes.map(p => ({ value: p, title: p.name })),
        },
        {
          type: "select",//(theme) => theme && theme.variants ? 'select' : null,
          name: 'mode',
          message: reset('Color mode:'),
          choices: [
            { title: "Both", value: "both" },
            { title: "Light", value: "light" },
            { title: "Dark", value: "dark" },
          ],
        },
        {
          type: "select",
          name: 'lang',
          message: reset('Color mode:'),
          choices: [
            { title: "English", value: "EN" },
            { title: "Español", value: "ES" },
            { title: "Français", value: "FR" },
            { title: "Portugues", value: "PT" },
            { title: yellow("Custom"), value: "CT" },
          ],
        },
        {
          type: null,//"select",
          name: 'bundler',
          message: reset('Bundler:'),
          choices: bundler.map(p => ({ value: p, title: p })),
        },
        {
          type: null,//"select",
          name: 'src',
          message: reset('Data source:'),
          choices: srcs.map(s => ({ title: s.title, value: s })),
        },
        {
          type: null,//"select",
          name: 'conn',
          message: reset('Connection:'),
          choices: (src: Src) => conns.filter(l => src.conn.includes(l.value)),
        },
        {
          type: null,//"select",
          name: 'server',
          message: reset('Server:'),
          choices: langs//(conn: string) => langs.filter(l => byKey(conns, conn, "value").conn.includes(conn)),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        },
      },
    )
  } catch (cancelled: any) {
    console.log(cancelled.message)
    return
  }

  const root = path.join(cwd, targetDir)

  if (overwrite) {
    emptyDir(root)
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }

  let ua = process.env.npm_config_user_agent;
  let pkgManager = ua ? ua.split(' ')[0].split('/')[0] : "npm"

  console.log(`\nScaffolding project in ${root}...`)

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    `../../client`,
  )

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  const files = fs.readdirSync(templateDir)
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file)
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
  )

  pkg.name = packageName || getProjectName()

  write('package.json', JSON.stringify(pkg, null, 2) + '\n')

  const cdProjectName = path.relative(cwd, root)
  console.log(`\nDone. Now run:\n`)
  if (root !== cwd) {
    console.log(
      `  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName
      }`,
    )
  }
  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn')
      console.log('  yarn dev')
      break
    default:
      console.log(`  ${pkgManager} install`)
      console.log(`  ${pkgManager} run dev`)
      break
  }
  console.log()
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '')
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  )
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-')
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}


function editFile(file: string, callback: (content: string) => string) {
  const content = fs.readFileSync(file, 'utf-8')
  fs.writeFileSync(file, callback(content), 'utf-8')
}

init().catch((e) => {
  console.error(e)
})
