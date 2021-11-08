import { widgetTypes } from "./consts"
const { miro } = window;

export const createWidgets = (widgets) => {
    return miro.board.widgets.create(widgets);
}

export const getWidgetById = (widgetId) => {
    return miro.board.widgets.get({ id: widgetId });
}

export const updateWidgetText = (id, text) => {
    return miro.board.widgets.update({ id, text });
}

export const updateWidgetMetadata = async (id, metadata) => {
    const widget = await getWidgetById(id);
    return miro.board.widgets.update({ ...widget[0], metadata });
}

export const updateWidgetData = (data) => {
    return miro.board.widgets.update(data);
}

export const getWidgetByUniqueId = (uniqueStoryId, appId) => {
    return new Promise((resolve, reject) => {
        miro.board.widgets.get({ type: widgetTypes.SHAPE })
            .then(widgets => {
                for (let i = 0; i < widgets.length; i++) {
                    if (widgets[i].metadata[appId]?.uniqueStoryId === uniqueStoryId
                        && !widgets[i].metadata[appId]?.mirror) {
                        return resolve([widgets[i]]);
                    }
                }
                reject('Widget not found with uniqueStoryId ', uniqueStoryId);
            });
    });
}

export const updateWidgetAsReadOnly = async (id) => {
    const widget = await getWidgetById(id);
    return miro.board.widgets.update({ ...widget[0], capabilities: { editable: false } });
}

export const deleteWidget = (widgets) => {
    return miro.board.widgets.deleteById(widgets);
}

export const getBoardXY = () => {
    return new Promise(resolve =>
        miro.addListener(miro.enums.event.CANVAS_CLICKED, ({ data: { x, y } }) => {
            miro.removeListener(miro.enums.event.CANVAS_CLICKED);
            resolve({ x, y });
        }));
}

export const getWidgets = (filter) => {
    return miro.board.widgets.get(filter);
}

export const getSyncWidgets = async () => {
    const widgets = await getWidgets();
    return widgets.filter(({ type }) => Object.keys(widgetTypes).includes(type));
}

export const getCurrentSelection = () => {
    return miro.board.selection.get();
}

export const showNotification = (message) => {
    return miro.showNotification(message);
}

export const showErrorNotification = message => {
    return miro.showErrorNotification(message);
}

export const selectWidget = (widgetId) => {
    return miro.board.selection.selectWidgets(widgetId);
}

export const getViewPort = () => {
    return miro.board.viewport.get();
}

export const openModel = async (url) => {
    miro.board.ui.openModal(url, { fullscreen: true });
}

export const openStandardModel = (url, options = {}) => {
    miro.board.ui.openModal(url, options);
}

export const focusWidget = async (widget) => {

    let miroLocation = {
        x: widget.x,
        y: widget.y
    };
    const scale = Math.floor(await miro.board.viewport.getScale() * 100) / 100;
    return miro.board.viewport.get()
        .then(viewport => {
            const height = Math.abs(viewport.height);
            const width = Math.abs(viewport.width);
            miro.board.viewport.set({
                height: height * scale,
                width: width * scale,
                x: miroLocation.x - (width * scale) / 2,
                y: miroLocation.y - (height * scale) / 2
            }, { animationTimeInMS: 250 });
        });
}

export const focusWidgetByPct = async (widget, pct) => {

    const widgetWidth = widget.width + ((widget.width / 100) * (100 - pct));
    const widgetHeight = widget.height + ((widget.height / 100) * (pct));
    return miro.board.viewport.set({
        width: widgetWidth,
        height: widgetHeight,
        x: widget.x - (widgetWidth / 2),
        y: widget.y - (widgetHeight / 2)
    }, { animationTimeInMS: 250 });
}

export const focusWidgetById = (widgetId) => {
    return miro.board.widgets.get({ id: widgetId })
        .then((widget) => focusWidget(widget[0]));
}

export const focusStory = (widgetId) => {
    return miro.board.widgets.get({ id: widgetId })
        .then((widget) => focusWidgetByPct(widget[0], 65));
}

export const focusAndSelectWidgetById = (widgetId) => {
    focusWidgetById(widgetId);
    selectWidget(widgetId);
}
