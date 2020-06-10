const glob  = require('glob')
const path = require('path')

// 获取多文件的方法
const getMultiEntry = function (globPath) {
  let entries = {}

  glob.sync(globPath).forEach(function (entry) {
    const basename = path.basename(entry, path.extname(entry))
    entries[basename] = entry
  })

  return entries
}

module.exports = {
  getMultiEntry,
}
