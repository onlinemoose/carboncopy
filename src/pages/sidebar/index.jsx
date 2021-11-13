import { useContext, useEffect, useRef, useState } from 'react';
import Link from '../../components/link';
import Checkbox from '../../components/checkbox';
import './style.css';
import SyncButton from '../../components/iconButton/sync';
import DeleteButton from '../../components/iconButton/delete';
import DuplicateButton from '../../components/iconButton/duplicate';
import SelectButton from '../../components/iconButton/select';
import FeedbackButton from '../../components/iconButton/feedback';
import { AppContext } from '../../store';
import { selectionChanged, setDeferSelection } from '../../store/actions/selection';
import { updateFirebaseWidgets } from '../../store/actions/board';
import { isDisabled, isChecked, isIndeterminate, elementTypes, formatSyncData, isOverlapping, isParent, getFirebaseWidgetForId } from './helper';
import { storage } from '../../services/firebase/firebase';
import DeSyncButton from '../../components/iconButton/desync';
import { cloneDeep } from 'lodash';
import AddButton from '../../components/iconButton/add';
import { showErrorNotification, showNotification } from '../../services/miro/manipulate';
import CancelButton from '../../components/iconButton/cancel';
import { widgetTypes } from '../../services/miro/consts';

const { miro } = window;

const Sidebar = () => {

    const [{ selection, deferSelection, deferredSelection, firebaseWidgets }, dispatch] = useContext(AppContext);
    const [firebase, setFirebase] = useState();
    const widgetCache = useRef();

    useEffect(() => {
        miro.onReady(async () => {

            const boardInfo = await miro.board.info.get();
            const firebaseRef = new storage(boardInfo.id);

            miro.addListener(miro.enums.event.SELECTION_UPDATED, async () => {
                dispatch(selectionChanged(await miro.board.selection.get()));
            });

            dispatch(selectionChanged(await miro.board.selection.get()));

            setFirebase(firebaseRef);

            const firebaseWidgetsRef = await firebaseRef.getBoard();
            if (firebaseWidgetsRef.exists) {
                dispatch(updateFirebaseWidgets(firebaseWidgetsRef.data()));
            }

        });
    }, [dispatch]);

    useEffect(() => {
        widgetCache.current = null;
    }, [selection]);

    useEffect(() => {
        if (deferSelection && deferredSelection && deferredSelection.length) {
            const syncedWidget = firebaseWidgets.widgetData.find(widget =>
                widget.id === deferredSelection[0].id
            );
            if (syncedWidget) {
                //showErrorNotification('Widget is already synced');
                return;
            }
            if (selection[0].type !== deferredSelection[0].type ||
                !Object.keys(widgetTypes).includes(deferredSelection[0].type)) {
                showErrorNotification('Incompatible widget for sync');
                dispatch(setDeferSelection(false));
                dispatch(selectionChanged([]));
                return;
            }
            const matchingFirebaseWid = firebaseWidgets.widgetData.find(({ id }) => id === selection[0].id);
            const widgets = formatSyncData([deferredSelection[0]], matchingFirebaseWid.syncID, matchingFirebaseWid.syncAttributes);
            firebase.writeData({ widgetData: [...firebaseWidgets.widgetData, ...widgets] });
            dispatch(updateFirebaseWidgets({ widgetData: [...firebaseWidgets.widgetData, ...widgets] }));
            showNotification('Widget added successfully to sync group');
            dispatch(setDeferSelection(false));
        }
    }, [deferSelection, deferredSelection, firebaseWidgets, firebase, selection, dispatch]);

    const enableSync = () => {
        const widgets = formatSyncData(selection);
        firebase.writeData({ widgetData: [...(firebaseWidgets.widgetData || []), ...widgets] });
        dispatch(updateFirebaseWidgets({ widgetData: [...(firebaseWidgets.widgetData || []), ...widgets] }));
    }

    const disableSync = () => {
        const selectionIds = selection.map(({ id }) => id);
        const widgets = firebaseWidgets.widgetData.filter(({ id }) => !selectionIds.includes(id));
        firebase.writeData({ widgetData: widgets });
        dispatch(updateFirebaseWidgets({ widgetData: widgets }));
    }

    const duplicateWidget = async () => {

        let allWidgets = await miro.board.widgets.get();
        let x = (selection[0].x + selection[0].bounds.width + 20);
        while (true) {
            if (!isOverlapping(x, selection[0].y, allWidgets, selection[0].bounds.width, selection[0].bounds.height)) {
                break;
            }
            x = x + selection[0].bounds.width + 20;
        }

        let [newWid] = await miro.board.widgets.create({ ...selection[0], x });

        const matchingFirebaseWid = firebaseWidgets.widgetData.find(({ id }) => id === selection[0].id);
        const widgets = formatSyncData([newWid], matchingFirebaseWid.syncID, matchingFirebaseWid.syncAttributes);
        firebase.writeData({ widgetData: [...firebaseWidgets.widgetData, ...widgets] });
        dispatch(updateFirebaseWidgets({ widgetData: [...firebaseWidgets.widgetData, ...widgets] }));

        miro.showNotification("Duplicate is created");
        miro.board.selection.selectWidgets(newWid);

        if (selection[0].tags?.length) {
            let tagId = Array.from(selection[0].tags.map(tag => tag.id));
            let boardTags = await miro.board.tags.get();

            let tagData = []
            for (let i = 0; i < tagId.length; i++) {
                let matchTag = boardTags.find(tag => tag.id === tagId[i]);
                tagData.push({
                    ...matchTag,
                    widgetIds: [...matchTag.widgetIds, newWid.id]
                });
            }
            await miro.board.tags.update(tagData);
        }
    }

    const selectAllWidgets = () => {
        let matchWidget = firebaseWidgets.widgetData.find(({ id }) => selection[0].id === id);
        let selectableWidgets = firebaseWidgets.widgetData.filter(({ syncID }) => syncID === matchWidget.syncID);
        miro.board.selection.selectWidgets(selectableWidgets);
    }

    const deleteWidget = () => {
        let currSelectedWidgets = Array.from(selection);
        currSelectedWidgets.sort((a, b) => a.id > b.id ? -1 : 1);
        miro.board.widgets.deleteById(currSelectedWidgets[0].id);

        const widgetData = firebaseWidgets.widgetData.filter(widget => widget.id !== currSelectedWidgets[0].id);
        firebase.writeData({ widgetData });
        dispatch(updateFirebaseWidgets({ widgetData }));
    }

    const openParent = async () => {
        const firebaseWidget = (firebaseWidgets?.widgetData || []).find(({ id }) => id === selection[0].id);
        const syncGroupWidgets = (firebaseWidgets?.widgetData || []).filter(({ syncID }) => syncID === firebaseWidget.syncID);
        const syncGroupWidgetIds = syncGroupWidgets.map(({ id }) => id).sort((a, b) => a > b ? 1 : -1);
        const parent = await miro.board.widgets.get({ id: syncGroupWidgetIds[0] });
        miro.board.selection.selectWidgets(parent);
        miro.board.viewport.zoomToObject(parent);
    }

    const changeCheckBox = (type, value) => {
        const selectedIds = selection.map(({ id }) => id);

        let parent = isParent(selection, firebaseWidgets);
        const syncGroup = getFirebaseWidgetForId(selection[0].id, firebaseWidgets).map(({ id }) => id);

        const indeterminate = isIndeterminate(selection, type, firebaseWidgets);
        let widgetData = [];
        cloneDeep(firebaseWidgets.widgetData || []).forEach(wid => {
            if (parent ? syncGroup.includes(wid.id) : selectedIds.includes(wid.id)) {
                let syncAttributes = Array.from(wid.syncAttributes || []);
                switch (type) {
                    case elementTypes.textCheckBox:
                        if (value) {
                            syncAttributes.push('TEXT');
                        } else if (!value && indeterminate) {
                            if (!syncAttributes.includes('TEXT')) {
                                syncAttributes.push('TEXT');
                            }
                        }
                        else {
                            syncAttributes.splice(syncAttributes.indexOf('TEXT'), 1)
                        }
                        break;
                    case elementTypes.widgetStylesCheckBox:
                        if (value) {
                            syncAttributes.push('STYLE');
                        } else if (!value && indeterminate) {
                            if (!syncAttributes.includes('STYLE')) {
                                syncAttributes.push('STYLE');
                            }
                        }
                        else {
                            syncAttributes.splice(syncAttributes.indexOf('STYLE'), 1)
                        }
                        break;
                    case elementTypes.tagsCheckBox:
                        if (value) {
                            syncAttributes.push('TAG');
                        } else if (!value && indeterminate) {
                            if (!syncAttributes.includes('TAG')) {
                                syncAttributes.push('TAG');
                            }
                        }
                        else {
                            syncAttributes.splice(syncAttributes.indexOf('TAG'), 1)
                        }
                        break;
                    case elementTypes.dimensionsCheckBox:
                        if (value) {
                            syncAttributes.push('DIM');
                        } else if (!value && indeterminate) {
                            if (!syncAttributes.includes('DIM')) {
                                syncAttributes.push('DIM');
                            }
                        }
                        else {
                            syncAttributes.splice(syncAttributes.indexOf('DIM'), 1)
                        }
                        break;
                    default: break;
                }
                widgetData.push({ ...wid, syncAttributes });
                return;
            }
            widgetData.push(cloneDeep(wid));
        });

        if (indeterminate && !value) {
            widgetCache.current = cloneDeep(firebaseWidgets.widgetData || []);
        }

        if (indeterminate && value && selection.length > 1 && widgetCache.current) {
            firebase.writeData({ widgetData: widgetCache.current });
            dispatch(updateFirebaseWidgets({ widgetData: widgetCache.current }));
            widgetCache.current = null;
            return;
        }

        firebase.writeData({ widgetData });
        dispatch(updateFirebaseWidgets({ widgetData }));
    }

    const addWidgets = () => {
        showNotification('Add widget to sync group');
        dispatch(setDeferSelection(true));
    }

    const stopAddWidgets = () => {
        dispatch(setDeferSelection(false));
    }

    return (
        <>
            <h3 className="h3 sidebar__header sidebar__bold">CarbonCopy</h3>
            <hr className="sidebar__divider" />
            <div className="grid sidebar__grid-margin">
                <div className="cs1 ce6">
                    {!isDisabled(selection, elementTypes.deSyncButton, firebaseWidgets) ?
                        <DeSyncButton onClick={disableSync} />
                        :
                        <SyncButton
                            disabled={isDisabled(selection, elementTypes.syncButton, firebaseWidgets)}
                            onClick={enableSync}
                        />
                    }
                </div>
                <div className="cs7 ce12">
                    <SelectButton
                        onClick={selectAllWidgets}
                        disabled={isDisabled(selection, elementTypes.selectButton, firebaseWidgets)} />
                </div>
            </div>
            <div className="grid sidebar__grid-margin">
                <div className="cs1 ce6">
                    {!isDisabled(selection, elementTypes.deSyncButton, firebaseWidgets) &&
                        (deferSelection ?
                            <CancelButton onClick={stopAddWidgets} />
                            : <AddButton onClick={addWidgets} />)
                    }
                </div>
                <div className="cs7 ce12">
                    <DuplicateButton
                        onClick={duplicateWidget}
                        disabled={isDisabled(selection, elementTypes.duplicateButton, firebaseWidgets)} />
                </div>
            </div>
            <div className="grid sidebar__grid-margin">
                <div className="cs1 ce6"></div>
                <div className="cs7 ce12">
                    <DeleteButton
                        onClick={deleteWidget}
                        disabled={isDisabled(selection, elementTypes.deleteButton, firebaseWidgets)} />
                </div>
            </div>
            <div className="grid sidebar__grid-space">
                <div className="cs1 ce1"></div>
                <div className="cs2 ce6">
                    <h4 className="h4 sidebar__bold">Sync Properties</h4>
                </div>
                <div className="cs7 ce11">
                    {!isDisabled(selection, elementTypes.viewParentLink, firebaseWidgets) &&
                        <Link
                            onClick={openParent}
                            label={'View parent'}
                            className='sidebar__float-right' />
                    }
                    {!isDisabled(selection, elementTypes.parentWidget, firebaseWidgets) &&
                        <Link
                            label={'Parent widget'}
                            className='sidebar__float-right sidebar__parent-widget' />
                    }
                </div>
                <div className="cs12 ce12"></div>
            </div>
            <div className="grid">
                <div className="cs1 ce1">
                </div>
                <div className="cs2 ce6">
                    <Checkbox
                        label="Text"
                        onChange={({ target: { checked } }) => changeCheckBox(elementTypes.textCheckBox, checked)}
                        disabled={isDisabled(selection, elementTypes.textCheckBox, firebaseWidgets)}
                        checked={isChecked(selection, elementTypes.textCheckBox, firebaseWidgets)}
                        indeterminate={isIndeterminate(selection, elementTypes.textCheckBox, firebaseWidgets)}
                    />
                </div>
                <div className="cs7 ce11">
                    <Checkbox
                        label="Widget Styles"
                        onChange={({ target: { checked } }) => changeCheckBox(elementTypes.widgetStylesCheckBox, checked)}
                        disabled={isDisabled(selection, elementTypes.widgetStylesCheckBox, firebaseWidgets)}
                        checked={isChecked(selection, elementTypes.widgetStylesCheckBox, firebaseWidgets)}
                        indeterminate={isIndeterminate(selection, elementTypes.widgetStylesCheckBox, firebaseWidgets)}
                    />
                </div>
                <div className="cs12 ce12"></div>
            </div>
            <div className="grid">
                <div className="cs1 ce1"></div>
                <div className="cs2 ce6">
                    <Checkbox
                        label="Tags"
                        onChange={({ target: { checked } }) => changeCheckBox(elementTypes.tagsCheckBox, checked)}
                        disabled={isDisabled(selection, elementTypes.tagsCheckBox, firebaseWidgets)}
                        checked={isChecked(selection, elementTypes.tagsCheckBox, firebaseWidgets)}
                        indeterminate={isIndeterminate(selection, elementTypes.tagsCheckBox, firebaseWidgets)}
                    />
                </div>
                <div className="cs7 ce11">
                    <Checkbox
                        label="Dimensions"
                        onChange={({ target: { checked } }) => changeCheckBox(elementTypes.dimensionsCheckBox, checked)}
                        disabled={isDisabled(selection, elementTypes.dimensionsCheckBox, firebaseWidgets)}
                        checked={isChecked(selection, elementTypes.dimensionsCheckBox, firebaseWidgets)}
                        indeterminate={isIndeterminate(selection, elementTypes.dimensionsCheckBox, firebaseWidgets)}
                    />
                </div>
                <div className="cs12 ce12"></div>
            </div>
            <hr className="sidebar__divider" />
            <div className="grid sidebar__grid-margin">
                <div className="cs1 ce6"></div>
                <div className="cs7 ce12">
                    <FeedbackButton
                        onClick={() => window.miro.board.ui.openModal('modal', { width: 480, height: 440 })}
                    />
                </div>
            </div>
        </>
    )
}

export default Sidebar;