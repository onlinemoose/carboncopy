
//appName can be one of [Lean Stories, Carbon Copy, Lean Stories+]
const appName = "Carbon Copy";
var appId;
var storageWidget;

miro.onReady(async () => {
    appId = await miro.getClientId();
    storageWidget = appId + "_metadata";
    let widgetData = await miro.board.widgets.get({ text: storageWidget });
    if (widgetData && widgetData.length) {
        miro.board.widgets.update({ ...widgetData[0], clientVisible: false });
    }
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

    let widgetData = await miro.board.widgets.get({ text: storageWidget });

    if (widgetData && widgetData.length) {
        return (widgetData[0].metadata[appId] || {});
    }
    else {
        let metadata = {};
        metadata[appId] = {};
        console.log('create on read')
        await miro.board.widgets.create({ type: "TEXT", text: storageWidget, metadata: metadata, clientVisible: false, scale: 0.00001 });
        return {};
    }
}

const writeData = async (data) => {

    let widgetData = await miro.board.widgets.get({ text: storageWidget });

    let metadata = {};
    metadata[appId] = { ...data };

    if (!widgetData || !widgetData.length) {
        console.log('create on write')
        await miro.board.widgets.create({ type: "TEXT", text: storageWidget, metadata: metadata, clientVisible: false, scale: 0.00001 });
    }
    else {
        await miro.board.widgets.update({ ...widgetData[0], metadata: metadata });
    }

}