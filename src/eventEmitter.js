import EventEmitter from 'events'

let eventEmitter = new EventEmitter();

const EVENTS = {
    MIC: 'MIC',
    RESET: 'RESET',
    CURRENT_NOTE: 'CURRENT_NOTE',
    NOTE_HIT: 'NOTE_HIT'
}

module.exports = {
    eventEmitter,
    EVENTS
}
