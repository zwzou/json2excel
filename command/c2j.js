'use strict'
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const co = require('co')
const prompt = require('co-prompt')
const { getMultiEntry } = require('../utils')
const csvtojson = require('csvtojson')

module.exports = (paths) => {
  co(function* () {
    let [inPath, outPath] = paths
    // 处理用户输入
    inPath = inPath ? inPath : yield prompt('Input file directory: ')
    outPath = outPath ? outPath : (yield prompt('Output file directory: ')) || inPath

    // 遍历获取csv文件
    const files = getMultiEntry(`${inPath}/*.csv`)

    // 如果指定目录下没有json文件输出提示信息
    if (!Object.keys(files).length) {
      console.log(chalk.red('\n There is no JSON file in the specified folder'))
      process.exit()
    }

    // 开始转换文件
    console.log('\n ')
    console.log(chalk.green('Start Conversion: '))

    for(let filename in files) {
      yield csvtojson().fromFile(files[filename]).then(jsonObj => {
        // 转换json文件的格式
        jsonObj = jsonObj.reduce((obj, item) => ({
          ...obj,
          [item.key]: item.value
        }), {})

        jsonObj = JSON.stringify(jsonObj, undefined, 2)

        let outputFileName = `${outPath}/${filename}.json`

        // 不存在文件夹就创建
        if(!fs.existsSync(outPath)) {
          fs.mkdirSync(outPath)
        }

        // 写入文件
        const err = fs.writeFileSync(outputFileName, jsonObj)
        if(err) {
          return console.log(err)
        } else {
          console.log(chalk.green(`- ${filename}.csv Conversion successful！`))
        }
      })
    }

    // 提示输出的文件目录
    console.log('\n ')
    console.log(chalk.blue(`- Please go to check the file: ${chalk.underline(path.resolve(__dirname, outPath))}`))
    process.exit()
  })
}
