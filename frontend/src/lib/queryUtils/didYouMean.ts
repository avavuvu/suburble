/*


UNUSED


*/

type Splits = [string, string][]

function createAllSplits(word: string): [string, string][] {
    // [(word[:i], word[i:])    for i in range(len(word) + 1)]

    word = word.toLowerCase()

    return Array.from({length: word.length + 1}, (_, index) => {
        return [word.slice(0, index), word.slice(index)]
    })
}

function createDeletions(splits: Splits): string[]  {
    //deletes = [L + R[1:] for L, R in splits if R]
    return splits.flatMap(([splitL,splitR]) => {
        if(splitR) {
            return `${splitL}${splitR.slice(1)}`
        }
        
        return []
    })
}

function createTransposes(splits: Splits): string[]  {
    //  transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R)>1]
    return splits.flatMap(([splitL,splitR]) => {
        if(splitR.length > 1) {
            return `${splitL}${splitR[1]}${splitR[0]}${splitR.slice(2)}`
        }

        return []
    })
}

const letters = [...'abcdefghijklmnopqrstuvwxyz']
function createReplaces(splits: Splits): string[]  {
    //  [L + c + R[1:] for L, R in splits if R for c in letters]
    return splits.flatMap(([splitL,splitR]) => {
        if(splitR) {
            return letters.map(letter => `${splitL}${letter}${splitR.slice(1)}`)
        }

        return []
    })
}

function createInserts(splits: Splits): string[]  {
    //  [L + c + R[1:] for L, R in splits if R for c in letters]
    return splits.flatMap(([splitL,splitR]) => {
        if(splitR) {
            return letters.map(letter => `${splitL}${letter}${splitR}`)
        }

        return []
    })
}

class QueryCorrector {
    private dictionary!: Set<string>;
    
    init(dictionary: string[]) {
        this.dictionary = new Set(dictionary.map(word => word.toLowerCase()));
    }

    getEdits(word: string) {
        const splits = createAllSplits(word)
        
        return [...new Set<string>(
            createDeletions(splits)
                .concat(createTransposes(splits))
                .concat(createReplaces(splits))
                .concat(createInserts(splits))
        )]
    }
    
    didYouMean(word: string) {
        const oneEdits = this.getEdits(word);
        for (const candidate of oneEdits) {
            if (this.dictionary.has(candidate)) {
                return candidate;
            }
        }
        
        for (const oneEdit of oneEdits) {
            const twoEdits = this.getEdits(oneEdit);
            for (const candidate of twoEdits) {
                if (this.dictionary.has(candidate)) {
                    return candidate;
                }
            }
        }

        return null
    }
}

export const queryCorrector = new QueryCorrector()

