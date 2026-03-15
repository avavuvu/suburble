import { Searcher } from "fast-fuzzy";
import suburbNamesJson from "../json/suburbNames.json"

const suburbNameSearcher = new Searcher(
    suburbNamesJson
)

export default suburbNameSearcher
