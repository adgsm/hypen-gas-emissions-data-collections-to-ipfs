import { FGStorage } from '@co2-storage/js-api'
import axios from 'axios'

const authType = "pk"
const ipfsNodeType = "client"
// const ipfsNodeAddr = "/dns4/web2.co2.storage/tcp/5002/https"
// const fgApiUrl = "https://co2.storage"
const ipfsNodeAddr = "/ip4/127.0.0.1/tcp/5001"
const fgApiUrl = "http://localhost:3020"

const fgStorage = new FGStorage({authType: authType, ipfsNodeType: ipfsNodeType, ipfsNodeAddr: ipfsNodeAddr, fgApiHost: fgApiUrl})

async function rest(uri, method, headers, responseType, data) {
    return await axios({
        url: uri,
        method: method,
        headers: headers,
        responseType: responseType,
        data: (data != undefined) ? data : null
    })
}

/**
 * Add asset
 * parameters: assetElements: json; { options } -> (asset parent:string(CID), asset name:string, asset template:string(CID),
 *  upload start event callback, upload progress callback(bytes uploaded), upload end event callback,
 *  asset creation start event callback, asset creation end event callback); chain_name: string
 */

try {
    const args = process.argv

    if(args.length < 4) {
        throw new Error('Input parameters missing.')
    }

    const start = new Date(args[2])
    const startYear = start.getFullYear()
    const startMonth = start.getMonth()
    const startDay = start.getDate()

    if(isNaN(startYear) || isNaN(startMonth) || isNaN(startDay)) {
        throw new Error('Invalid start date provided.')
    }

    let year = startYear, month = startMonth, day = startDay

    const gasses = args[3]
    const gassesList = gasses.split(",")

    let date = new Date(year, month, day)

    while (date.setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0)) {
        for (let gass of gassesList) {
            gass = gass.trim()
            const url = `https://portal-develop-api.hyphen.earth/api/station_gas_allheights_dailyaverage_combinations_allStationsOneGas_specifiedDate?gasName=${gass}&year=${year}&month=${month+1}&day=${day}`
            const data = null
            const method = 'GET'
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            const responseType = null
    
            let response = await rest(url, method,
                headers, responseType, data)

            if(response.status > 299) {
                console.log(response)
                break
            }

            const responseData = response.data
            if(responseData.stationsIncludedCount == 0 && responseData.gasesIncludedCount == 0
                && responseData.datesIncludedCount == 0 && responseData.stationGasCombinationsCount == 0) {
                    console.log(`No data available for ${gass} ${year}-${month+1}-${day}`)
                    continue
                }
                            
            const assetElements = [
                {
                    "name": "source", "value": url
                },
                {
                    "name": "timestamp", "value": (new Date()).toUTCString()
                },
                {
                    "name": "data", "value": responseData
                },
                {
                    "name": "gas_name", "value": gass
                },
                {
                    "name": "year", "value": year
                },
                {
                    "name": "month", "value": month+1
                },
                {
                    "name": "day", "value": day
                }
            ]

            const addAssetResponse = await fgStorage.addAsset(
                assetElements,
                {
                    parent: null,
                    name: `${gass} ${year}-${month+1}-${day}`,
                    description: `Hypen's data collection for ${gass} emissions on ${year}-${month+1}-${day}`,
                    template: "bafyreidt5v4cloxgc2ox32bdh3at2nbri4hcsmxe45mj3ljx5zz4mllp5u",
                    filesUploadStart: () => {
                        console.log("Upload started")
                    },
                    filesUpload: async (bytes, path) => {
                        console.log(`${bytes} uploaded`)
                    },
                    filesUploadEnd: () => {
                        console.log("Upload finished")
                    },
                    createAssetStart: () => {
                        console.log("Creating asset")
                    },
                    createAssetEnd: () => {
                        console.log("Asset created")
                    }
                },
                'Gas Emissions Measurements - Hypen'
            )
            if(addAssetResponse.error != null) {
                console.error(addAssetResponse.error)
                await new Promise(reject => setTimeout(reject, 300))
                process.exit()
            }

            console.log(`Pinned data for ${gass} ${year}-${month+1}-${day}`)

            await new Promise(resolve => setTimeout(resolve, 300))

        }
    
        date.setDate(date.getDate() + 1)
        year = date.getFullYear()
        month = date.getMonth()
        day = date.getDate()
    }
} catch (error) {
    console.log(error)
}


await new Promise(resolve => setTimeout(resolve, 1000));

// Exit program
process.exit()