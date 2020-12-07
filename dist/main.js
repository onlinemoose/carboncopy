let icon =
  '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"></circle>'

miro.onReady(() => {
  miro.initialize({
    extensionPoints: {
        getWidgetMenuItems: async (widgets, editmode) => {
     return [{
        title: 'Looking Glass',
        svgIcon: icon,
        positionPriority: 1,
        onClick: () => {
          miro.board.ui.openLeftSidebar('sidebar.html')
        }
        }]
      }
    }
  })
})
