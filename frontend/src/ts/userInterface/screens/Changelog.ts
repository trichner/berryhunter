import * as Mustache from 'mustache';
import * as moment from 'moment';
import {isUndefined} from '../../Utils';
import * as Events from '../../Events';
import {createStartScreenPanel} from "./ScreenUtil";

function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

const changelogs = requireAll(require.context('../../../../../changelog', false, /\.json$/));
const template = require('raw-loader!./changelog.mustache');

Events.on('startScreen.domReady', setup);

function setup() {
    createStartScreenPanel(
        document.getElementById('changelog'),
        renderChangelogs(mapChangelogs(changelogs)),
        'closeChangelog',
        'changelogVisible',
        '#changelog');
}

function renderChangelogs(changelogs: ChangelogVO[]): string {
    return Mustache.render(template, changelogs);
}

function mapChangelogs(changelogs: ChangelogJSON[]): ChangelogVO[] {
    let mapped: ChangelogVO[] = changelogs.map((changelog) => {
        let categories = newCategories();
        changelog.changes.forEach((change) => {
            let category = categories.get(change.category);
            if (isUndefined(category)) {
                throw 'Unknown change category "' + change.category + '"';
            }
            category.changes.push(change);
        });
        let mdate = moment(changelog.date, 'DD.MM.YYYY');
        return {
            codename: prepareCodename(changelog.codename),
            date: mdate,
            datetime: mdate.format('YYYY-MM-DD'),
            dateFormatted: mdate.format('DD.MM.YYYY'),
            categories: Array.from(categories.values())
        };
    });

    mapped.sort((c1, c2) => {
        // Sort descending - newest on top
        return -1 * c1.date.diff(c2.date);
    });

    return mapped;
}

function prepareCodename(codename: string): string {
    return codename.replace(/ /g, '<span class="spacer"></span>');
}

function newCategories(): Map<string, ChangeCategoryVO> {
    let categories = new Map<string, ChangeCategoryVO>();

    // Insertion order defines sorting
    newCategory(categories, 'highlight', 'Highlights in this version');
    newCategory(categories, 'feature', 'New Features');
    newCategory(categories, 'bugFix', 'Fixed Bugs');
    newCategory(categories, 'improvement', 'Other improvements and changes');

    return categories;
}

function newCategory(categories: Map<string, ChangeCategoryVO>, key: string, name: string) {
    categories.set(key, {
        name: name,
        changes: []
    });
}

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
    category: string,
    describtion: string,
    trelloId: string | string[]
}