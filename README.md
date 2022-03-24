## The stack

Routing - https://reactrouter.com/ <br />
https://reactrouter.com/web/api/Hooks <br /><br />
Style - https://react-bootstrap.netlify.app/ <br />
https://getbootstrap.com/docs/4.0/utilities/spacing/ <br /><br />
State - redux, redux-thunk <br />

## Development

The Project works in tandem with [github.com/orbs-network/pos-analytics-lib](orbs-network/pos-analytics-lib). 

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn format`

Formats the entire code of the app by prettier rules

## Deploy GitHub Pages

* clone git
```
git clone https://github.com/orbs-network/pos-analytics
```

* Install
```
npm install
```

* Build only
Please note that the root domain needs to match the `Homepage` field in package.json.
```
npm run build
```

* Publish a version to branch gh-pages
```
npm run deploy
```

* Setting up github pages
Under setting of repository go to the github pages section and choose the branch `gh-pages` and the root directory and press `Save`. If you also published with a specific domain you can setup the Custom Domain name.

<img src="https://analyticsinsight.b-cdn.net/wp-content/uploads/2022/03/Polygon-MATIC-amp-Terra-LUNA-Price-Drop-Bitgert-Surge-To.jpeg" alt="drawing" width="200"/>

## Polygon network support
As of march 29 2022, Orbs network supports both ETH and Polygon network.

Staking and reward claiming is now cheaper and faster using the L2 Polygon netwrok.

Analytics UI also supports both

Network selector is on the left in a dropdown underneath the logo.




