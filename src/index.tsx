import React, { Suspense } from "react"
import ReactDOM from "react-dom"
import { Provider } from "react-redux"
import {  ConnectedRouter } from "connected-react-router"
import * as serviceWorker from "./serviceWorker"
import { createBrowserHistory } from "history";
import App from "./app"
import store from "./redux/store/store"
import './i18n';
import { AppLoader } from "./components/app-loader/app-loader"

const history = createBrowserHistory()



ReactDOM.render(
  <Suspense fallback={<AppLoader />} >
    <Provider store={store}>
      <ConnectedRouter history={history}>
      <App />
      </ConnectedRouter>
    </Provider>
  </Suspense>,
  document.getElementById("root")
)
serviceWorker.unregister()
