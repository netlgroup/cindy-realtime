/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { combineReducers } from "redux-immutable";
import { fromJS } from "immutable";
import { LOCATION_CHANGE } from "react-router-redux";

import languageProviderReducer from "containers/LanguageProvider/reducer";

const initialReducers = {
  puzzleActiveList: require("containers/PuzzleActiveList/reducer").default,
  puzzlePage: require("containers/PuzzlePage/reducer").default,
  puzzleList: require("containers/PuzzleList/reducer").default,
};

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to react-router-redux@4
 *
 */

// Initial routing state
const routeInitialState = fromJS({
  location: null
});

/**
 * Merge route into the global application state
 */
function routeReducer(state = routeInitialState, action) {
  switch (action.type) {
    /* istanbul ignore next */
    case LOCATION_CHANGE:
      return state.merge({
        location: action.payload
      });
    default:
      return state;
  }
}

/**
 * Creates the main reducer with the dynamically injected ones
 */
export default function createReducer(injectedReducers) {
  console.log(injectedReducers);
  return combineReducers({
    route: routeReducer,
    language: languageProviderReducer,
    ...initialReducers,
    ...injectedReducers
  });
}