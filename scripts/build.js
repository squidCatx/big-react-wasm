const {execSync} = require('child_process')
const fs = require('fs')

const cwd = process.cwd()

const isTest = process.argv[2] === '--test'

execSync('rm -rf dist')

execSync(
  `wasm-pack build packages/react --out-dir ${cwd}/dist/react --out-name jsx-dev-runtime ${
    isTest ? '--target nodejs' : ''
  }`
)

execSync(
  `wasm-pack build packages/react --out-dir ${cwd}/dist/react --out-name index ${
    isTest ? '--target nodejs' : ''
  }`
)

if (isTest) {
  execSync(
    `wasm-pack build packages/react-noop --out-dir ${cwd}/dist/react-noop --out-name index ${
      isTest ? '--target nodejs' : ''
    }`
  )
}
execSync(
  `wasm-pack build packages/react-dom --out-dir ${cwd}/dist/react-dom --out-name index ${
    isTest ? '--target nodejs' : ''
  }`
)

// modify react/package.json
const packageJsonFilename = `${cwd}/dist/react/package.json`
const packageJson = JSON.parse(
  fs.readFileSync(packageJsonFilename).toString('utf-8')
)
packageJson.files.push(
  'jsx-dev-runtime.wasm',
  'jsx-dev-runtime.js',
  'jsx-dev-runtime_bg.js',
  'jsx-dev-runtime_bg.wasm'
)
fs.writeFileSync(packageJsonFilename, JSON.stringify(packageJson))

if (isTest) {
  // modify react-noop/index_bg.js
  const reactNoopIndexFilename = isTest
    ? `${cwd}/dist/react-noop/index.js`
    : `${cwd}/dist/react-noop/index_bg.js`
  const reactNoopIndexBgData = fs.readFileSync(reactNoopIndexFilename)
  fs.writeFileSync(
    reactNoopIndexFilename,
    (isTest
      ? 'const {updateDispatcher} = require("react");\n'
      : 'import {updateDispatcher} from "react";\n') + reactNoopIndexBgData
  )
}

// modify react-dom/index_bg.js
const reactDomIndexFilename = isTest
  ? `${cwd}/dist/react-dom/index.js`
  : `${cwd}/dist/react-dom/index_bg.js`
const reactDomIndexBgData = fs.readFileSync(reactDomIndexFilename)
fs.writeFileSync(
  reactDomIndexFilename,
  (isTest
    ? 'const {updateDispatcher} = require("react");\n'
    : 'import {updateDispatcher} from "react";\n') + reactDomIndexBgData
)

// add Fragment
const reactIndexFilename = `${cwd}/dist/react/jsx-dev-runtime.js`
const reactIndexData = fs.readFileSync(reactIndexFilename)
fs.writeFileSync(
  reactIndexFilename,
  reactIndexData + `export const Fragment='react.fragment';\n`
)
const reactTsIndexFilename = `${cwd}/dist/react/jsx-dev-runtime.d.ts`
const reactTsIndexData = fs.readFileSync(reactTsIndexFilename)
fs.writeFileSync(
  reactTsIndexFilename,
  reactTsIndexData + `export const Fragment: string;\n`
)
