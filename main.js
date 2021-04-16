let leanStoriesIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24"/></g><g><g/><g><path d="M8,8H6v7c0,1.1,0.9,2,2,2h9v-2H8V8z"/><path d="M20,3h-8c-1.1,0-2,0.9-2,2v6c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V5C22,3.9,21.1,3,20,3z M20,11h-8V7h8V11z"/><path d="M4,12H2v7c0,1.1,0.9,2,2,2h9v-2H4V12z"/></g></g><g display="none"><g display="inline"/><g display="inline"><path d="M8,8H6v7c0,1.1,0.9,2,2,2h9v-2H8V8z"/><path d="M20,3h-8c-1.1,0-2,0.9-2,2v6c0,1.1,0.9,2,2,2h8c1.1,0,2-0.9,2-2V5C22,3.9,21.1,3,20,3z M20,11h-8V7h8V11z"/><path d="M4,12H2v7c0,1.1,0.9,2,2,2h9v-2H4V12z"/></g></g></svg>';

let carbonCopyIcon =
  '<path d="M.01 0h24v24h-24V0z" fill="none"/><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>';

let disabledIcon =
  '<path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M10 6.35V4.26c-.66.17-1.29.43-1.88.75l1.5 1.5c.13-.05.25-.11.38-.16zM20 12c0-2.21-.91-4.2-2.36-5.64L20 4h-6v6l2.24-2.24C17.32 8.85 18 10.34 18 12c0 .85-.19 1.65-.51 2.38l1.5 1.5C19.63 14.74 20 13.41 20 12zM4.27 4L2.86 5.41l2.36 2.36C4.45 8.99 4 10.44 4 12c0 2.21.91 4.2 2.36 5.64L4 20h6v-6l-2.24 2.24C6.68 15.15 6 13.66 6 12c0-1 .25-1.94.68-2.77l8.08 8.08c-.25.13-.5.24-.76.34v2.09c.8-.21 1.55-.54 2.23-.96l2.58 2.58 1.41-1.41L4.27 4z"/>';

let selectIcon =
  '<path d="M0 0h24v24H0z" fill="none"/><path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z"/>';

let stickiesToShapeIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M22 18v-2H8V4h2L7 1 4 4h2v2H2v2h4v8c0 1.1.9 2 2 2h8v2h-2l3 3 3-3h-2v-2h4zM10 8h6v6h2V8c0-1.1-.9-2-2-2h-6v2z"/></svg>';

var appId;

const syncWidgets = ["TEXT", "STICKER", "SHAPE", "CARD", "LINE"]; //IMAGE is another supported widget but there is a issue on metadata update

const syncText = async (widgetsToSync, type) => {

  // If widget is newly added update the window.miroSyncData object
  let syncWidgetIDs = widgetsToSync.map(widget => widget.id);

  let prevWidgetState = window.miroSyncData.filter(widget => syncWidgetIDs.includes(widget.id));
  let prevWidgetStateIDs = prevWidgetState.map(widget => widget.id);

  syncWidgetIDs.map(widgetID => {
    if (!prevWidgetStateIDs.includes(widgetID)) {
      let newWidget = widgetsToSync.filter(wid => wid.id === widgetID);
      window.miroSyncData = [...window.miroSyncData, ...newWidget];
      prevWidgetState = [...window.miroSyncData, ...newWidget];
    }
    return 0;
  });

  // No sync required if no of inputs is ONE
  if (widgetsToSync.length < 2) {
    return;
  }

  // Identify the widget that has changed
  let updatedWidget = widgetsToSync.filter(widget => {

    let oldState = prevWidgetState.filter(oldWidget => oldWidget.id === widget.id);
    oldState = oldState[0];
    if (widget.type === "CARD") {
      return (widget.title !== oldState.title || widget.description !== oldState.description);
    }
    else if (widget.type === "STICKER") {
      return (widget.text !== oldState.text || widget.plainText !== oldState.plainText ||
        widget.style.stickerBackgroundColor !== oldState.style.stickerBackgroundColor);
    }
    else if (widget.type === "SHAPE") {
      return (widget.text !== oldState.text || widget.plainText !== oldState.plainText || !compareAllValues(widget.style, oldState.style, ["shapeType", "fontSize"]));
    }
    else if (widget.type === "TEXT") {
      return (widget.text !== oldState.text || widget.plainText !== oldState.plainText || !compareAllValues(widget.style, oldState.style));
    }
    else if (widget.type === "LINE") {
      return !compareAllValues(widget.style, oldState.style);
    }
    else {
      return (widget.text !== oldState.text || widget.plainText !== oldState.plainText);
    }
  });

  // No sync required if length is ZERO
  if (!updatedWidget.length) {
    return;
  }
  updatedWidget = updatedWidget[0];

  let newWidgetData = [];

  widgetsToSync.map(widget => {
    if (widget.id !== updatedWidget.id) {
      if (type === "CARD") {
        newWidgetData.push({
          ...widget,
          title: updatedWidget.title,
          description: updatedWidget.description,
        });
      }
      else if (type === "STICKER" && widget.type === updatedWidget.type) {
        newWidgetData.push({
          ...widget,
          text: updatedWidget.text,
          plainText: updatedWidget.plainText,
          style: {
            ...widget.style,
            stickerBackgroundColor: updatedWidget.style.stickerBackgroundColor
          }
        });
      }
      else if (type === "SHAPE" && widget.type === updatedWidget.type) {
        newWidgetData.push({
          ...widget,
          text: updatedWidget.text,
          plainText: updatedWidget.plainText,
          style: { ...updatedWidget.style, shapeType: widget.style.shapeType, fontSize: widget.style.fontSize }
        });
      }
      else if (type === "TEXT") {
        newWidgetData.push({
          ...widget,
          text: updatedWidget.text,
          plainText: updatedWidget.plainText,
          style: updatedWidget.style
        });
      }
      else if (type === "LINE") {
        newWidgetData.push({
          ...widget,
          style: updatedWidget.style
        });
      }
      else {
        newWidgetData.push({
          ...widget,
          text: updatedWidget.text,
          plainText: updatedWidget.plainText,
        });
      }
    }
    return 0;
  });

  for (let i = 0; i < newWidgetData.length; i++) {
    await miro.board.widgets.update(newWidgetData[i]);
  }

  let updatedIds = newWidgetData.map(item => item.id);

  let newMiroSyncData = window.miroSyncData.map(item => {
    if (updatedIds.includes(item.id)) {
      return newWidgetData.filter(updatedWidget => updatedWidget.id === item.id)[0];
    }
    else if (item.id === updatedWidget.id) {
      return updatedWidget;
    }
    else {
      return item;
    }
  });
  window.miroSyncData = newMiroSyncData;
}

const syncImageWidget = async (widgetToSync, allSyncableWidgets) => {

}

const handleSync = async () => {

  try {

    let allWidgets = await miro.board.widgets.get();
    let syncableWidgets = allWidgets.filter(widget => widget.metadata[appId]?.sync);
    let syncIDs = [];
    syncableWidgets.map(widget => {
      if (!syncIDs.includes(widget.metadata[appId].syncID)) {
        syncIDs.push(widget.metadata[appId].syncID);
      }
      return 0;
    });

    for (let i = 0; i < syncIDs.length; i++) {

      let widgets = syncableWidgets.filter(widget => widget.metadata[appId].syncID === syncIDs[i]);

      switch (widgets[0].type) {
        case "TEXT": await syncText(widgets, widgets[0].type);
          break;
        case "STICKER": await syncText(widgets, widgets[0].type);
          break;
        case "SHAPE": await syncText(widgets, widgets[0].type);
          break;
        case "CARD": await syncText(widgets, widgets[0].type);
          break;
        case "LINE": await syncText(widgets, widgets[0].type);
          break;
        case "IMAGE": await syncImageWidget(widgets);
          break;
        default: break;
      }

    };

    // Tag sync for Card and Sticker
    let tagSyncableWidgets = syncableWidgets.filter(widget => (widget.type === "CARD" || widget.type === "STICKER"));
    if (tagSyncableWidgets.length) {

      let tags = await miro.board.tags.get();
      let tagSyncableWidgetIds = tagSyncableWidgets.map(tagSyncableWidget => tagSyncableWidget.id);

      for (let i = 0; i < tags.length; i++) {
        let newTag = tags[i];
        let oldTag = window.miroTagData.find(oldTag => oldTag.id === newTag.id);

        if (oldTag) {
          if (oldTag.widgetIds.length > newTag.widgetIds.length) {  //  deleted
            let deletedWidgetId = oldTag.widgetIds.find(widgetId => !newTag.widgetIds.includes(widgetId));
            let deletedWidget = tagSyncableWidgets.find(widget => widget.id === deletedWidgetId);
            let assoicatedWidgets = tagSyncableWidgets.filter(widget =>
              widget.metadata[appId].syncID === deletedWidget.metadata[appId].syncID
              && widget.id !== deletedWidget.id);
            let assoicatedWidgetIds = assoicatedWidgets.map(widget => widget.id);
            await miro.board.tags.update({
              ...newTag,
              widgetIds: [...newTag.widgetIds.filter(widgetId => !assoicatedWidgetIds.includes(widgetId))]
            });
          }
          else if (oldTag.widgetIds.length < newTag.widgetIds.length) { // added
            let addedWidgetId = newTag.widgetIds.find(widgetId => !oldTag.widgetIds.includes(widgetId));
            let addedWidget = tagSyncableWidgets.find(widget => widget.id === addedWidgetId);
            let assoicatedWidgets = tagSyncableWidgets.filter(widget =>
              widget.metadata[appId].syncID === addedWidget.metadata[appId].syncID
              && widget.id !== addedWidget.id);
            await miro.board.tags.update({
              ...newTag,
              widgetIds: [...newTag.widgetIds, ...assoicatedWidgets.map(widget => widget.id)]
            });
          }
        }
        else {
          // If Tag is created and added to an syncable widget
          let syncableWidgetId = newTag.widgetIds.find(widgetId => tagSyncableWidgetIds.includes(widgetId));
          if (syncableWidgetId) {
            let addedWidget = tagSyncableWidgets.find(widget => widget.id === syncableWidgetId);
            let assoicatedWidgets = tagSyncableWidgets.filter(widget =>
              widget.metadata[appId].syncID === addedWidget.metadata[appId].syncID
              && widget.id !== addedWidget.id);
            await miro.board.tags.update({
              ...newTag,
              widgetIds: [...newTag.widgetIds, ...assoicatedWidgets.map(widget => widget.id)]
            });
          }
        }
      }


      miro.board.tags.get().then(res => {
        window.miroTagData = res;
      });
    }

  }
  catch (exception) {
    console.error("Error in syncing widgets", exception);
  }
}

const initializeSync = async () => {
  window.miroSyncData = await miro.board.widgets.get();
  window.miroTagData = await miro.board.tags.get();

  miro.addListener(miro.enums.event.SELECTION_UPDATED, handleSync);
}

miro.onReady(async () => {
  appId = await miro.getClientId();
  const authorized = await miro.isAuthorized();

  if (authorized) {
    await initializeSync();
  }

  let extensionPoints = {};

  const bottomBar = {
    title: getAppName(),
    svgIcon: leanStoriesIcon,
    positionPriority: 100,
    onClick: async () => {
      const isAuthorized = await miro.isAuthorized();
      if (!isAuthorized) {
        await miro.requestAuthorization();
        await initializeSync();
      }

      miro.board.ui.openLeftSidebar('sidebar.html');
    }
  };

  const getWidgetMenuItems = async (selectedWidgets, editmode) => {

    let selectedWidget = selectedWidgets[0];

    if (!selectedWidget) {
      return;
    }

    let widgetArray = [];

    let syncButton = {
      tooltip: selectedWidget.metadata[appId]?.sync ? 'disable sync' : 'enable sync',
      svgIcon: selectedWidget.metadata[appId]?.sync ? disabledIcon : carbonCopyIcon,
      positionPriority: 100,
      onClick: async () => {
        const isAuthorized = await miro.isAuthorized();
        if (!isAuthorized) {
          await miro.requestAuthorization();
          await initializeSync();
        }

        let widgetID;

        let currSelectedWidgets = await miro.board.selection.get();
        widgetID = currSelectedWidgets[0].id;

        let metadata = {};
        metadata[appId] = {
          ...(currSelectedWidgets[0].metadata[appId] || {}),
          sync: !Boolean(selectedWidget.metadata[appId]?.sync),
          syncID: (selectedWidget.metadata[appId]?.sync ? "" : new Date().getTime())
        };

        miro.board.widgets.update(
          {
            ...currSelectedWidgets[0],
            id: widgetID,
            metadata: metadata
          }
        );

        // To reload context menu to reflect sync icon state
        miro.board.selection.selectWidgets(currSelectedWidgets);
      },
    };

    let selectButton = {
      tooltip: 'select synced',
      svgIcon: selectIcon,
      positionPriority: 100,
      onClick: async () => {
        const isAuthorized = await miro.isAuthorized();
        if (!isAuthorized) {
          await miro.requestAuthorization();
          await initializeSync();
        }

        let widgets = await miro.board.widgets.get();

        let widgetID;

        if (selectedWidget.id === "0") {
          let currSelectedWidgets = await miro.board.selection.get();
          widgetID = currSelectedWidgets[0].id;
        }
        else {
          widgetID = selectedWidget.id;
        }

        let currWidget = widgets.filter(widget => widget.id === widgetID);
        let syncID = currWidget[0].metadata[appId]?.syncID;
        let selectableWidgets = widgets.filter(widget => widget.metadata[appId]?.syncID === syncID);
        miro.board.selection.selectWidgets(selectableWidgets);
      }
    }

    let stickiesToShape = {
      tooltip: 'Convert to shape',
      svgIcon: stickiesToShapeIcon,
      positionPriority: 90,
      onClick: async () => {
        const isAuthorized = await miro.isAuthorized();
        if (!isAuthorized) {
          await miro.requestAuthorization();
          await initializeSync();
        }
        let currWidget;

        if (selectedWidget.id === "0") {
          let currSelectedWidgets = await miro.board.selection.get();
          currWidget = currSelectedWidgets[0];
        }
        else {
          currWidget = selectedWidget;
        }

        await miro.board.widgets.deleteById({ id: currWidget.id });
        let newShape = await miro.board.widgets.create({ ...currWidget, style: { ...currWidget.style, fontSize: currWidget.style.fontSize / 2 }, type: 'SHAPE' });
        let metadata = await readData();
        metadata[newShape[0].id] = (metadata[currWidget.id] ? metadata[currWidget.id] : { aliases: [], frames: [] });
        delete metadata[currWidget.id];
        await writeData(metadata);

      }
    }

    if (['Lean Stories', 'Lean Stories+'].includes(getAppName()) && selectedWidget.type === "STICKER") {
      widgetArray.push(stickiesToShape);
    }

    // If more than 1 widgets selected don't display sync button
    if (selectedWidgets && selectedWidgets.length === 1 && syncWidgets.includes(selectedWidget.type)) {
      widgetArray.push(syncButton);
      if (selectedWidget.metadata[appId]?.sync) {
        widgetArray.push(selectButton);
      }
    }

    return widgetArray;
  };

  if (['Lean Stories', 'Lean Stories+'].includes(getAppName())) {
    extensionPoints['bottomBar'] = bottomBar;
  }

  if (['Carbon Copy', 'Lean Stories+'].includes(getAppName())) {
    extensionPoints['getWidgetMenuItems'] = getWidgetMenuItems;
  }

  miro.initialize({ extensionPoints: extensionPoints });

});
