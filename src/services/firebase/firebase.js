
export class storage {

    constructor(boardId) {
        this.boardId = boardId;
        this.db = window.firebase.firestore();
        this.collection = this.db.collection('boardData');
    }

    writeData = (data) => {
        return this.collection.doc(this.boardId).set(data);
    }

    mergeData = (data) => {
        return this.collection.doc(this.boardId).set(data, { merge: true });
    }

    getBoard = () => {
        return this.collection.doc(this.boardId).get();
    }

    readData = (widgetId) => {
        return new Promise((resolve, reject) => {
            this.collection.doc(widgetId).get()
                .then(doc => {
                    if (doc.exists) {
                        return resolve(doc.data());
                    } else {
                        this.writeData(widgetId, {});
                        return resolve({});
                    }
                })
                .catch(err => reject(err));
        });
    }
}