import * as Mustache from 'mustache';
import * as moment from 'moment';
import {isUndefined} from "../../Utils";

function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

const changelogs = requireAll(require.context('../../../../../changelog', false, /\.json$/));

const template = require('raw-loader!./changelog.mustache');

interface ChangelogJSON {
    date: string,
    codename: string,
    describtion?: string,
    changes: ChangeJSON[]
}

interface ChangeJSON {
    category: string,
    describtion: string,
    trelloId: string | string[]
}

interface ChangelogVO {
    codename: string,
    date: moment.Moment,
    datetime: string,
    dateFormatted: string,
    categories: ChangeCategoryVO[]
}

interface ChangeCategoryVO {
    name: string,
    changes: ChangeVO[]
}

interface ChangeVO {

}

function mapChangelogs(changelogs: ChangelogJSON[]) : ChangelogVO[] {
    let mapped: ChangelogVO[] = changelogs.map((changelog) => {
        let categories = newCategories;
        changelog.changes.forEach((change) => {
            let category = categories[change.category];

            if (isUndefined(category)) {
                category = {
                    name: change.category,
                    changes: []
                };
                categories[change.category] = category;
            }

            category.changes.push(change);
        });
        let mdate = moment(changelog.date, 'DD.MM.YYYY');
        return {
            codename: changelog.codename,
            date: mdate,
            datetime: mdate.format('YYYY-MM-DD'),
            dateFormatted: mdate.format('L'),
            // TODO spread map with .values()
            categories: Object.values( categories)
        };
    });

    mapped.sort((c1, c2) => {
        // Sort descending - newest on top
        return -1 * c1.date.diff(c2.date);
    });

    return mapped;
}

function newCategories() : Map<string, ChangeCategoryVO[]> {
    let categories = new Map<string, ChangeCategoryVO[]>();

    // Insertion order defines sorting
    categories.set('Highlight', []);
    categories.set('Feature', []);
    categories.set('Bug Fix', []);
    categories.set('Improvement', []);

    return categories;
}

function renderChangelogs(changelogs) {
    console.log(changelogs);
    let rendered = Mustache.render(template, changelogs);
    console.log(rendered);
}

renderChangelogs(mapChangelogs(changelogs));