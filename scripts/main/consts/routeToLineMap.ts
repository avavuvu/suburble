import type { TrainLineName } from "suburble-shared"

const routeToLineMap: { [key: string]: TrainLineName } = {
    "Flinders Street<->Glen Waverley": "Glen Waverley",
    "Belgrave<->Flinders Street": "Belgrave",
    "Alamein<->Flinders Street": "Alamein",
    "Lilydale<->Flinders Street": "Lilydale",
    "Mernda<->Flinders Street": "Mernda",
    "Upfield<->Flinders Street": "Upfield",
    "Craigieburn<->Flinders Street": "Craigieburn",

    // "Stony Point<->Frankston": "Frankston",

    "Flinders Street<->Frankston": "Frankston",

    "Sandringham<->Williamstown": "Williamstown",
    "Sandringham<->Laverton": "Altona Loop",
    "Sandringham<->Werribee": "Werribee",

    "Flinders Street<->East Pakenham": "East Pakenham",
    "Sandringham<->Flinders Street": "Sandringham",
    "Hurstbridge<->Flinders Street": "Hurstbridge",

    "East Pakenham<->Sunbury": "East Pakenham",
    "Cranbourne<->West Footscray": "Cranbourne",

    // vline
    "Wyndham Vale<->Southern Cross": "Geelong",
    "Southern Cross<->Wendouree": "Ballarat",
} as const

export default routeToLineMap
