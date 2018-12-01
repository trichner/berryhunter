import * as Mustache from 'mustache';
import * as moment from 'moment';
import {isUndefined} from "../../Utils";

function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

const changelogs = requireAll(require.context('../../../../../changelog', false, /\.json$/));

const template = require('raw-loader!./changelog.mustache');

function mapChangelogs(changelogs) {
    return changelogs.map((changelog) => {
        let categories = {};
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
            datetime: mdate.format('YYYY-MM-DD'),
            dateFormatted: mdate.format('L'),
            categories: Object.values(categories)
        };
    })
}

function renderChangelogs(changelogs) {
    console.log(changelogs);
    let rendered = Mustache.render(template, changelogs);
    console.log(rendered);
}

renderChangelogs(mapChangelogs(changelogs));