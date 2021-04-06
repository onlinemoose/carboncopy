# Leanstories+
A plugin for Miro boards enabling users to Build Lean Stories and syncronise Sticy notes, text, shapes and cards on a Miro board. Some call this "card mirroring".

# Install dependencies
`npm i`

# Prepare scripts and deploy to firebase server 
`npm run dist`

Note: Firebase cli needs to be installed and authenticated once before using firebase deploy command

`Lean Stories`: https://github.com/onlinemoose/carboncopy/tree/leanstories

`Lean Stories+`: https://github.com/onlinemoose/carboncopy/tree/leanstories+

`Carbon Copy`: https://github.com/onlinemoose/carboncopy/tree/carboncopy

There are only 4 differences between Each branch:

`util.js`: This file has the appName parameter, which is responsible for different app behaviors (Lean Stories, Lean Stories+ & Carbon Copy)

`.firebaserc`: This file is responsible for indicating the firebase project to which the code should be deployed.

`package.json`: Switch the firebase project on `npm run dist`

`Readme.md`: Readable app information on opening the branch

# Installable Links:
`Lean Stories`

https://miro.com/oauth/authorize/?response_type=code&client_id=3074457353132236000&account_id=3074457352070196241&state=&redirect_uri=/confirm-app-install/

`Lean Stories+`

https://miro.com/oauth/authorize/?response_type=code&client_id=3074457352917830848&account_id=3074457352070196241&state=&redirect_uri=/confirm-app-install/

`Carbon Copy`

https://miro.com/oauth/authorize/?response_type=code&client_id=3074457352071726785&account_id=3074457351928670722&state=&redirect_uri=/confirm-app-install/
