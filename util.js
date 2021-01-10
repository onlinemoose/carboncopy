
//appName can be one of [Lean Stories, Carbon Copy, Lean Stories+]
const appName = "Carbon Copy";

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