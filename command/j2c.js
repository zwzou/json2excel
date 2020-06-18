'use strict'
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const co = require('co')
const prompt = require('co-prompt')
const { getMultiEntry } = require('../utils')
const Json2csvParser = require('json2csv').Parser

module.exports = (paths) => {
  co(function* () {
    let [inPath, outPath] = paths
    // 处理用户输入
    inPath = inPath ? inPath : yield prompt('Input file directory: ')
    outPath = outPath ? outPath : (yield prompt('Output file directory: ')) || inPath

    // 遍历获取json文件
    const files = getMultiEntry(`${inPath}/*.json`)

    // 如果指定目录下没有json文件输出提示信息
    if (!Object.keys(files).length) {
      console.log(chalk.red('\n x There is no JSON file in the specified folder'))
      process.exit()
    }

    // 开始转换文件
    console.log('\n ')
    console.log(chalk.green('Start Conversion: '))

    for(let filename in files) {
      // 同步读取文件
      let jsonData = fs.readFileSync(files[filename])
      jsonData = JSON.parse(jsonData)

      /*
      * 判断csv能接受的数据结构
      * 如果是json对象,则取key, value作为列
      * 如果是json数组，则读取第一行的所有key
      * */
      let jData, fields
      if(Object.prototype.toString.call(jsonData) === '[object Object]') {
        jData = Object.keys(jsonData).map(key => ({
          key: key,
          value: jsonData[key]
        }))
        fields = ['key', 'value']
      }
      if(Object.prototype.toString.call(jsonData) === '[object Array]') {
        jData = jsonData
        fields = Object.keys(jsonData[0])
      }

      // json格式 => csv格式
      const json2csvParser = new Json2csvParser({fields})
      const csvData = json2csvParser.parse(jData)

      // office Excel需要 BOM 头来定义 UTF-8编码格式
      const BOM = Buffer.from('\uFEFF')
      const bomCsv = Buffer.concat([BOM, Buffer.from(csvData)])

      // 写入的文件名
      const outputFileName = `${outPath}/${filename}.csv`

      // 不存在文件夹就创建
      if(!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath)
      }

      // 写入文件
      const err = fs.writeFileSync(outputFileName, bomCsv)
      if(err) {
        return console.log(err)
      } else {
        console.log(chalk.green(`- ${filename}.json Conversion successful！`))
      }
    }

    // 提示输出的文件目录
    console.log('\n ')
    console.log(chalk.blue(`- Please go to check the file: ${chalk.underline(path.join(process.cwd(), outPath))}`))
    process.exit()
  })
}
