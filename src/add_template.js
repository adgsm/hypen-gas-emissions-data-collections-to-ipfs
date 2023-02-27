import { FGStorage } from '@co2-storage/js-api'

const authType = "pk"
const ipfsNodeType = "client"
//const ipfsNodeAddr = "/dns4/web2.co2.storage/tcp/5002/https"
//const fgApiUrl = "https://co2.storage"
const ipfsNodeAddr = "/ip4/127.0.0.1/tcp/5001"
const fgApiUrl = "http://localhost:3020"

const fgStorage = new FGStorage({authType: authType, ipfsNodeType: ipfsNodeType, ipfsNodeAddr: ipfsNodeAddr, fgApiHost: fgApiUrl})

/**
 * Add a template
 * parameters: (template:json, template name:string, template base:string, template description:string, template parent:string(CID), chain_name: string)
 */

const template = {
    source: { type: 'string', mandatory: true },
    timestamp: { type: 'string', mandatory: true },
    data: { type: 'json', mandatory: true },
    gas_name: { type: 'string', mandatory: true },
    year: { type: 'integer', mandatory: true, min: 1900 },
    month: { type: 'integer', mandatory: true, min: 1, max: 12 },
    day: { type: 'integer', mandatory: true, min: 1, max: 31 }
}
const templateName = "Hypen's gas emissions data collections"
const templateBase = {title: null, reference: null}
const templateDescription = "Template for gas emissions data collections collected from Hypen's open API"
const templateParent = null
const chainName = "Gas Emissions Measurements - Hypen"
let addTemplateResponse = await fgStorage.addTemplate(template, templateName, templateBase, templateDescription, templateParent, chainName)
if(addTemplateResponse.error != null) {
    console.error(addTemplateResponse.error)
    await new Promise(reject => setTimeout(reject, 300));
    process.exit()
}

console.dir(addTemplateResponse.result, {depth: null})

await new Promise(resolve => setTimeout(resolve, 1000));

// Exit program
process.exit()