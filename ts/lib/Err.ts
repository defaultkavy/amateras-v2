export class Err extends Error {
    constructor(message: string) {
        super(message)
        this.name = "Err"
        console.error('Error: ' + this.message)
    }

}