import type { Guess } from "./types/guess";
import { writable } from "svelte/store";




const guessStore = writable<Guess[]>([])

export default guessStore
