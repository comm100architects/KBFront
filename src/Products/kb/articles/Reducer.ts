import {
  ActionType,
  Action,
  NewArticleAction,
  EditArticleAction,
} from "./Action";
import { Articles } from "./Model";

type Reducer = (state: Articles, action: Action) => Articles;

// Reducers

const newArticle = (state: Articles, action: NewArticleAction): Articles => {
  const article = {
    ...action.payload,
    id: new Date().getTime().toString(),
  };
  return { ...state, [article.id]: article };
};

const editArticle = (state: Articles, action: EditArticleAction): Articles => ({
  ...state,
  [action.payload.id]: action.payload,
});

// Map ActionType to Reducer
const mapAction = (type: ActionType): Reducer => {
  switch (type) {
    case ActionType.newArticle:
      return newArticle;
    case ActionType.editArticle:
      return editArticle;
    default:
      throw new Error(`Unknown article actionType: ${type}`);
  }
};

export default (state: Articles, action: Action) => {
  console.log(action);
  return mapAction(action.type)(state, action);
};
