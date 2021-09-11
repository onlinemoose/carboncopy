import { setWidgetTitles } from "../../store/actions/selection";
import { storage } from "../firebase/firebase";
import { widgetTypes } from "../miro/consts";
import { getWidgets, updateWidgetData } from "../miro/manipulate";
import { isLeanLaneWidget, isLeanStoryMirror, isLeanStoryWidget } from "../miro/validations";
import _ from "lodash";
import { analyticsEvents } from "../firebase/consts";

export class dataSync {

    constructor(dispatcher, boardId, miroAppId) {
        this.dispatcher = dispatcher;
        this.boardId = boardId;
        this.miroAppId = miroAppId;
        this.firebase = new storage(boardId);
        this.leanWidgets = [];
        this.cardWidgets = [];
        this.firebaseData = [];
    }

    loadLeanWidgets = async () => {

        let leanWidgets = await getWidgets({ type: widgetTypes.SHAPE });
        leanWidgets = leanWidgets.filter(widget =>
            isLeanLaneWidget(widget, this.miroAppId) ||
            isLeanStoryWidget(widget, this.miroAppId));

        const cardWidgets = await getWidgets({ type: widgetTypes.CARD });

        if (!_.isEqual([...leanWidgets, ...cardWidgets],
            [...this.leanWidgets, ...this.cardWidgets])) {
            this.dataChanged = true;
            this.leanWidgets = leanWidgets;
            this.cardWidgets = cardWidgets;
        }
    }

    loadFirebaseData = async () => {
        let leanWidgets = [];
        await this.firebase
            .getDocuments(this.leanWidgets.map(wid => wid.id))
            .then((docs) =>
                docs.forEach(doc => {
                    if (doc.exists) leanWidgets.push({ id: doc.id, ...(doc.data() || {}) });
                }))
            .catch(err => window.firebase.analytics().logEvent(analyticsEvents.log_error, err));
        this.firebaseData = leanWidgets;
    }

    getWidgetByID = (id) => {
        return [...this.leanWidgets, ...this.cardWidgets].find(widget => widget.id === id);
    }

    resolveDelta = async () => {
        this.firebaseData.forEach(({ id, title, stories, lanes }) => {
            if (!title || title !== this.getWidgetByID(id).plainText) {
                this.firebase.mergeData(id, { title: this.getWidgetByID(id).plainText });
            }
            if (stories) {
                let hasChange = false;
                let newStories = stories.map(story => {
                    if (this.getWidgetByID(story.id)
                        && (story.title !== this.getWidgetByID(story.id).title ||
                            story.description !== this.getWidgetByID(story.id).description)) {
                        hasChange = true;
                        return {
                            ...story,
                            title: this.getWidgetByID(story.id).title,
                            description: this.getWidgetByID(story.id).description
                        }
                    }
                    else {
                        return story;
                    }
                });
                if (hasChange) {
                    this.firebase.mergeData(id, { stories: newStories });
                }
            }
            if (lanes) {
                let hasChange = false;
                let newLanes = lanes.map(lane => {
                    let newStories = (lane.stories || []).map(story => {
                        let text = this.getWidgetByID(story.id)?.plainText;
                        if (!this.getWidgetByID(story.id)) {
                            text = '(Deleted)';
                        }
                        if (story.text !== text && story.text !== '(Deleted)') {
                            hasChange = true;
                        }
                        return { ...story, text }
                    });
                    return { ...lane, stories: newStories };
                });
                if (hasChange) {
                    this.firebase.mergeData(id, { lanes: newLanes });
                }
            }
        });
    }

    generateDataAndDispatch = async () => {
        const widgetInfo = {};
        [...this.leanWidgets, ...this.cardWidgets].forEach(widget => {
            widgetInfo[widget.id] = widget;
        });
        this.dispatcher(setWidgetTitles(widgetInfo));
    }

    updateChildTitles = async () => {
        let leanMirrorWidgets = await getWidgets({ type: widgetTypes.SHAPE });
        leanMirrorWidgets = leanMirrorWidgets.filter(widget =>
            isLeanStoryMirror(widget, this.miroAppId));

        for (let i = 0; i < leanMirrorWidgets.length; i++) {
            const parentWidget = this.leanWidgets.find(wid =>
                wid.id === leanMirrorWidgets[i].metadata[this.miroAppId].parentId);
            if (parentWidget
                && (parentWidget.text !== leanMirrorWidgets[i].text
                    || !_.isEqual(parentWidget.style, leanMirrorWidgets[i].style))) {
                await updateWidgetData({
                    ...leanMirrorWidgets[i],
                    text: parentWidget.text,
                    style: parentWidget.style
                });
            }
        }
    }

    syncWidgets = async () => {

        this.dataChanged = false;

        await this.loadLeanWidgets();

        if (!this.dataChanged) return;

        this.generateDataAndDispatch();

        await this.loadFirebaseData();

        this.updateChildTitles();

        this.resolveDelta();
    }
}