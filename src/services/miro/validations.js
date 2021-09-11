import { widgetTypes } from "./consts"

export const isLeanLaneWidget = (selection, appId) => {
    if (Array.isArray(selection)) {
        return selection.length === 1
            && selection[0].type === widgetTypes.SHAPE
            && selection[0].metadata[appId]?.leanLane;
    }
    else if (selection) {
        return selection.type === widgetTypes.SHAPE
            && selection.metadata[appId]?.leanLane;
    }
}

export const isLeanStoryMirror = (selection, appId) => {
    if (Array.isArray(selection)) {
        return selection.length === 1
            && selection[0].type === widgetTypes.SHAPE
            && selection[0].metadata[appId]?.leanStory
            && selection[0].metadata[appId]?.mirror;
    }
    else if (selection) {
        return selection.type === widgetTypes.SHAPE
            && selection.metadata[appId]?.leanStory
            && selection.metadata[appId]?.mirror;
    }
}

export const isLeanStoryWidget = (selection, appId) => {
    if (Array.isArray(selection)) {
        return selection.length === 1
            && selection[0].type === widgetTypes.SHAPE
            && selection[0].metadata[appId]?.leanStory;
    }
    else if (selection) {
        return selection.type === widgetTypes.SHAPE
            && selection.metadata[appId]?.leanStory;
    }
}

export const isPrintWidget = (selection, appId) => {
    if (Array.isArray(selection)) {
        return selection.length === 1
            && selection[0].type === widgetTypes.IMAGE
            && selection[0].metadata[appId]?.printId;
    }
    else if (selection) {
        return selection.type === widgetTypes.IMAGE
            && selection.metadata[appId]?.printId;
    }
}

export const isPrintStoryWidget = (selection, appId) => {
    if (Array.isArray(selection)) {
        return selection.length === 1
            && selection[0].type === widgetTypes.SHAPE
            && selection[0].metadata[appId]?.printId
            && selection[0].metadata[appId]?.type === 'story';
    }
    else if (selection) {
        return selection.type === widgetTypes.SHAPE
            && selection.metadata[appId]?.printId
            && selection.metadata[appId]?.type === 'story';
    }
}

export const isPrintTitleWidget = (selection, appId) => {
    if (Array.isArray(selection)) {
        return selection.length === 1
            && selection[0].type === widgetTypes.SHAPE
            && selection[0].metadata[appId]?.printId
            && selection[0].metadata[appId]?.type === 'title';
    }
    else if (selection) {
        return selection.type === widgetTypes.SHAPE
            && selection.metadata[appId]?.printId
            && selection.metadata[appId]?.type === 'title';
    }
}