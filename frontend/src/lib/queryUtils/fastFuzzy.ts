import { Searcher } from "fast-fuzzy";
import suburbNamesJson from "@j/suburbNames.json"

const suburbNameSearcher = new Searcher(
    suburbNamesJson
)

export default suburbNameSearcher