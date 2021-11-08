import { useEffect } from "react";
import { storage } from "../../services/firebase/firebase";
import { getSyncWidgets } from "../../services/miro/manipulate";
import { syncService } from "../sidebar/syncService";

const icon =
    '<path d="M.01 0h24v24h-24V0z" fill="none"/><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>';

const Home = () => {

    useEffect(() => {
        const { miro, location } = window;
        miro.onReady(async () => {
            const authorized = await miro.isAuthorized();

            if (!authorized) {
                await miro.requestAuthorization();
                location.reload();
                return;
            }

            miro.initialize({
                extensionPoints: {
                    toolbar: {
                        title: 'CarbonCopy',
                        librarySvgIcon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">' + icon + '</svg>',
                        toolbarSvgIcon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">' + icon + '</svg>',
                        onClick: async () => {
                            const isAuthorized = await miro.isAuthorized();
                            if (!isAuthorized) {
                                await miro.requestAuthorization();
                            }

                            miro.board.ui.openLeftSidebar('sidebar', { title: "CarbonCopy" });
                        }
                    }
                },

            });

            const boardWidgets = await getSyncWidgets();
            const boardWidgetIds = boardWidgets.map(({ id }) => id);
            const boardInfo = await miro.board.info.get();
            const firebase = new storage(boardInfo.id);

            const firebaseWidgetsRef = await firebase.getBoard();
            let firebaseWidgets;
            if (firebaseWidgetsRef.exists) {
                firebaseWidgets = firebaseWidgetsRef.data();
                const len = (firebaseWidgets?.widgetData?.length || 0);
                firebaseWidgets.widgetData = firebaseWidgets?.widgetData?.filter(({ id }) => boardWidgetIds.includes(id));
                if (len !== firebaseWidgets?.widgetData?.length) {
                    await firebase.writeData({ widgetData: firebaseWidgets.widgetData });
                }
            }

            syncService(firebase, () => { });

            miro.addListener(miro.enums.event.SELECTION_UPDATED, async () => {
                syncService(firebase, () => { });
            });

        });
    }, []);

    return (
        <> </>
    )
}

export default Home;