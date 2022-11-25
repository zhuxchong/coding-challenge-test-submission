import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "../src/App";
import { configureStore } from "../src/core/reducers";
import reportWebVitals from "../src/reportWebVitals";

export default function Home() {
  return (
    <React.StrictMode>
      <Provider store={configureStore()}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
