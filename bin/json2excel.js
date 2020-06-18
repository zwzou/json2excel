#!/usr/bin/env node
'use strict'

const program = require('commander')

// 定义当前的版本
program
  .version(require('../package').version)

// 定义命令方法
program
  .usage('<command> [inPath] [toPath]')

program
  .command('j2c [paths...]')
  .description('Conversion from JSON to csv')
  .alias('-j')
  .action(paths => require('../command/j2c')(paths))

program
  .command('c2j [paths...]')
  .description('Conversion from csv to JSON')
  .alias('-c')
  .action(paths => require('../command/c2j')(paths))

program.parse(process.argv)

if (!program.args.length) {
  program.help()
}
