import { actions } from "./actions";
import { type Extension } from "../../lib/types";
import { settings } from "./settings";
import { AuthorType, Category } from "../../lib/types/marketplace";

export const Wellinks: Extension = {
    key: 'wellinks',
    category: Category.WORKFLOW,
    title: 'Wellinks',
    description: 'Wellinks Application Logic ',
    icon_url: '',
    author: {
        authorType: AuthorType.EXTERNAL,
        authorName: "Wellinks"
    },
    settings,
    actions
}