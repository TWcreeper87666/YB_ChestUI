export class Page {
    constructor(btnWithIdx, options = {}) {
        this.btnWithIdx = btnWithIdx;
        Object.assign(this, options);
    }
}
