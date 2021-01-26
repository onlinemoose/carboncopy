
//appName can be one of [Lean Stories, Carbon Copy, Lean Stories+]
const appName = "Lean Stories";
var documentName;
const FIREBASE_PROJECT_ID = "leanstories-f5798";
window.firebase.initializeApp({ projectId: FIREBASE_PROJECT_ID });
const db = window.firebase.firestore();
const collection = db.collection('miro');

miro.onReady(async () => {
    let boardInfo = await miro.board.info.get();
    documentName = btoa(boardInfo.id + boardInfo.createdAt);
});

const getAppName = () => {
    return appName;
}

const compareAllValues = (obj1, obj2, ignoreKeys = []) => {
    let objectsAreNotSame = Object.keys(obj1).find(key => obj1[key] !== obj2[key] && !ignoreKeys.includes(key));
    if (objectsAreNotSame) {
        return false;
    }
    else {
        return true;
    }
}

const allEqual = arr => arr.every(v => v === arr[0]);

const readData = async () => {

    let doc = await collection.doc(documentName).get();

    if (doc.exists) {
        return doc.data();
    } else {
        writeData({});
        return {};
    }
}

const writeData = async (data) => {
    await collection.doc(documentName).set(data);
}