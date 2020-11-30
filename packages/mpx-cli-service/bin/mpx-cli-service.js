#!/usr/bin/env node

const { semver, error } = require('@vue/cli-shared-utils')
const requiredVersion = require('../package.json').engines.node

if (!semver.satisfies(process.version, requiredVersion, { includePrerelease: true })) {
  error(
    `You are using Node ${process.version}, but mpx-cli-service ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}

const Service = require('@vue/cli-service/lib/Service')
const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd())

const setPluginsToSkip = service.setPluginsToSkip.bind(service)
service.setPluginsToSkip = function(args) {
  setPluginsToSkip(args)
  let builtInPlugins = []
  if (process.env.MPX_CLI_MODE !== 'web') {
    builtInPlugins = [
      'built-in:config/base',
      'built-in:config/app',
      'vue-cli-plugin-mpx-web'
    ]
  } else {
    builtInPlugins = [
      'vue-cli-plugin-mpx-mp'
    ]
  }

  builtInPlugins.forEach(plugin => {
    this.pluginsToSkip.add(plugin)
  })
}

const rawArgv = process.argv.slice(2)
const args = require('minimist')(rawArgv, {
  boolean: [
    // build
    'modern',
    'report',
    'report-json',
    'inline-vue',
    'watch',
    // serve
    'open',
    'copy',
    'https',
    // inspect
    'verbose'
  ]
})
const command = args._[0]

service.run(command, args, rawArgv).catch(err => {
  error(err)
  process.exit(1)
})
