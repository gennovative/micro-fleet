const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

const log = require('./common')


/**
 * Copies source files from other neighbor packages. The operations are sync.
 *
 * @param {object[]} pairs An array whose each item is an object with format:
 *
 * 	"from": Source path, if this is a directory, its content will be copied, not itself.
 * 	"to": Destination path. If "from" is a directory, this must be a directory too.
 * 	"transformFn": Signature: function(content). Function to transform file content.
 * 		If source path is a directory, the function is applied to every files.
 */
async function copySrc(pairs = [], verbose = true) {
	verbose && log.bold('> copySrc.js')

	pairs.forEach((p) => {
		if (p.transformFn) {
			fse.removeSync(p.to)
			if (fs.lstatSync(p.from).isDirectory()) {
				fse.ensureDirSync(p.to)
				fse.readdirSync(p.from).forEach(subPath => copySrc([{
					from: path.join(p.from, subPath),
					to: path.join(p.to, subPath),
					transformFn: p.transformFn,
				}], false))
				return
			}
			const content = fse.readFileSync(p.from, { encoding: 'utf8' })
			fse.writeFileSync(p.to, p.transformFn(content), { encoding: 'utf8' })
		}
		else {
			fse.copySync(p.from, p.to, { overwrite: true,  })
		}
	})

	verbose && log.success(`Copied ${pairs.length} path(s)`)
}

module.exports = copySrc