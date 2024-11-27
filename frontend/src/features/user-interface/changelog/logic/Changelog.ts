import * as Mustache from 'mustache';
import {htmlModuleToString, isDefined, isUndefined} from '../../../../old-structure/Utils';
import {StartScreenDomReadyEvent} from '../../../core/logic/Events';
import {createStartScreenPanel} from '../../logic/ScreenUtil';
import {compareDesc, format, parse} from 'date-fns';

function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}

const changelogs = requireAll(require.context('../../../../../../changelog', false, /\.json$/));
const template = require('../assets/changelog.mustache');

StartScreenDomReadyEvent.subscribe(setup);

function setup() {
    createStartScreenPanel(
        document.getElementById('changelogContainer'),
        renderChangelogs(mapChangelogs(changelogs)),
        'closeChangelog',
        'changelogVisible',
        '#changelog');
}

function renderChangelogs(changelogs: ChangelogVO[]): string {
    return Mustache.render(htmlModuleToString(template), changelogs);
}

function validateTrelloId(trelloId: string) {
    if (!trelloId.match(/c\/[0-9a-zA-Z]{8}/)) {
        console.warn('Trello Id "' + trelloId + '" appears to be invalid. It should look like "c/aBcD1234".');
    }
}

function validateTrelloIds(trelloIds: string[]) {
    if (!Array.isArray(trelloIds)) {
        console.warn('TrelloIds need to be an array.');
        return;
    }

    trelloIds.forEach(validateTrelloId);
}

function validateTrelloUrl(trelloUrl: string) {
    if (!trelloUrl.match(/https:\/\/trello\.com\/c\/[0-9a-zA-Z]{8}\/[^\/]+/)) {
        console.warn('TrelloUrl "' + trelloUrl + '" appears to be invalid. It should be a full trello card url ' +
            'like "https://trello.com/c/KjluLplC/130-mammoth-and-tiger-damage-collider-are-not-aligned-to-visuals".');
    }
}

function validateTrelloUrls(trelloUrls: string[]) {
    if (!Array.isArray(trelloUrls)) {
        console.warn('TrelloUrls need to be an array.');
        return;
    }

    trelloUrls.forEach(validateTrelloUrl);
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

            let hasTrelloReference = false;
            if (isDefined(change.trelloId)) {
                validateTrelloId(change.trelloId);
                hasTrelloReference = true;
            }
            if (isDefined(change.trelloIds)) {
                validateTrelloIds(change.trelloIds);
                hasTrelloReference = true;
            }
            if (isDefined(change.trelloUrl)) {
                validateTrelloUrl(change.trelloUrl);
                hasTrelloReference = true;
            }
            if (isDefined(change.trelloUrls)) {
                validateTrelloUrls(change.trelloUrls);
                hasTrelloReference = true;
            }
            if (!hasTrelloReference) {
                console.warn('At least one of trelloId, trelloIds, trelloUrl, trelloUrls need to be provided for', change);
            }
        });
        for (let [name, category] of categories) {
            if (category.changes.length === 0) {
                categories.delete(name);
            }
        }
        let mdate = parse(changelog.date, 'dd.MM.yyyy', new Date());
        return {
            codename: prepareCodename(changelog.codename),
            date: mdate,
            datetime: format(mdate, 'yyyy-MM-dd'),
            dateFormatted: format(mdate, 'dd.MM.yyyy'),
            description: changelog.description,
            descriptionHtml: prepareDescriptionHtml(changelog.descriptionHtml),
            categories: Array.from(categories.values()),
        };
    });

    mapped.sort((c1, c2) => {
        return compareDesc(c1.date, c2.date);
    });

    return mapped;
}

function prepareCodename(codename: string): string {
    return codename.replace(/ /g, '<span class="spacer"></span>');
}

function prepareDescriptionHtml(descriptionHtml: string | string[]) {
    if (isUndefined(descriptionHtml)) {
        return undefined;
    }

    if (Array.isArray(descriptionHtml)) {
        return descriptionHtml.join('\n');
    }

    return descriptionHtml;
}

function newCategories(): Map<string, ChangeCategoryVO> {
    let categories = new Map<string, ChangeCategoryVO>();

    // Insertion order defines sorting
    newCategory(categories, 'highlight', 'Highlights in this version');
    newCategory(categories, 'feature', 'New Features');
    newCategory(categories, 'balancing', 'Changes to gameplay values');
    newCategory(categories, 'improvement', 'Other improvements and changes');
    newCategory(categories, 'bugFix', 'Fixed Bugs');

    return categories;
}

function newCategory(categories: Map<string, ChangeCategoryVO>, key: string, name: string) {
    categories.set(key, {
        name: name,
        changes: [],
    });
}

interface ChangelogJSON {
    date: string,
    codename: string,
    description?: string,
    descriptionHtml?: string | string[],
    changes: ChangeJSON[]
}

interface ChangeJSON {
    category: string,
    description: string,
    trelloId?: string,
    trelloIds?: string[],
    trelloUrl?: string,
    trelloUrls?: string[],
}

interface ChangelogVO {
    codename: string,
    date: Date,
    datetime: string,
    dateFormatted: string,
    description?: string,
    descriptionHtml?: string,
    categories: ChangeCategoryVO[]
}

interface ChangeCategoryVO {
    name: string,
    changes: ChangeVO[]
}

interface ChangeVO {
    category: string,
    description: string,
    trelloId?: string,
    trelloIds?: string[],
    trelloUrl?: string,
    trelloUrls?: string[],
}
