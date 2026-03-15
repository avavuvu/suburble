function capitalize(word: string) {
    const splits = word.split(" ")
    return splits.map(split => split.slice(0, 1).toUpperCase() + split.slice(1,)).join(" ")
}

export default capitalize
