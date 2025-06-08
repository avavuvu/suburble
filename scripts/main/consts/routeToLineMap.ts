const routeToLineMap: {[key: string]: string} = {
    "Flinders Street<->Glen Waverley": "Glen Waverley",
    "Belgrave<->Flinders Street": "Belgrave",
    "Alamein<->Flinders Street": "Alamein",
    "Lilydale<->Flinders Street": "Lilydale",
    "Flinders Street<->Cranbourne": "Cranbourne",
    "Frankston<->Williamstown": "Williamstown",
    // "Stony Point Frankston": "Frankston",
    "Laverton<->Frankston": "Altona Loop",
    "Flinders Street<->Werribee": "Werribee",
    "Flinders Street<->East Pakenham": "Pakenham",
    "Sandringham<->Flinders Street": "Sandringham",
    "Mernda<->Flinders Street": "Mernda",
    "Hurstbridge<->Flinders Street": "Hurstbridge",
    "Sunbury<->Flinders Street": "Sunbury",
    "Upfield<->Flinders Street": "Upfield",
    "Craigieburn<->Flinders Street": "Craigieburn"
} as const

export default routeToLineMap
