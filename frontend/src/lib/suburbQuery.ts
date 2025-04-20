export class SuburbQuery {
    suburbNames: string[]
    
    constructor(suburbNames: string[]) {
        this.suburbNames = suburbNames
    }

    getPlaceholder = () => {
        return `${this.suburbNames[Math.floor(this.suburbNames.length * Math.random())]}...`
    }

    getPotentialSuburbs = (input: string) => {
        return this.suburbNames.filter(name => {
            return name.toLowerCase().includes(input)
        })
    }

    findSuburb = (input: string) => 
        this.suburbNames.find(name => input === name.toLowerCase())

}