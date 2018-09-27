import {makeRequest} from "../Utils";
import * as _ from 'lodash';

let html = require('./rating.html');
let emptyStarIcon = require('!svg-inline-loader!./img/emptyStar.svg');
let filledStarIcon = require('!svg-inline-loader!./img/filledStar.svg');

export class Rating {
    private ratingContainer: Element;
    private ratingTooltips: Element[] = [];
    private socialMediaContainer: Element;
    private feedbackContainer: Element;
    private feedbackText: HTMLTextAreaElement;
    private submitContainer: Element;
    private successContainer: Element;
    private rating: number = 0;

    constructor(parentElement: Element, showSocialMedia: boolean) {
        parentElement.innerHTML = html;

        this.ratingContainer = parentElement.querySelector('.ratingContainer');
        this.initRatingContainer(this.ratingContainer);

        this.socialMediaContainer = parentElement.querySelector('.socialMediaContainer');
        this.socialMediaContainer.classList.toggle('hidden', !showSocialMedia);

        this.feedbackContainer = parentElement.querySelector('.feedbackContainer');
        this.feedbackText = this.feedbackContainer.querySelector('.feedbackText') as HTMLTextAreaElement;

        this.submitContainer = parentElement.querySelector('.submitContainer');
        this.initSubmit();

        this.successContainer = parentElement.querySelector('.successContainer');
    }

    initRatingContainer(ratingContainer: Element) {
        ratingContainer.querySelectorAll('.icon.emptyStar').forEach(element => {
            element.innerHTML = emptyStarIcon;
        });
        ratingContainer.querySelectorAll('.icon.filledStar').forEach(element => {
            element.innerHTML = filledStarIcon;
        });

        let starElements: HTMLElement[] = [];
        let handleHover = (event: Event, isHovering: boolean) => {
            /* event.currentTarget refers to the element that this
             * handler was bound to while event.target is the actual
             * element that triggered the event.
             */
            let starElement: HTMLElement = event.currentTarget as HTMLElement;
            let value: number = parseInt(starElement.dataset.value);
            for (let i = 0; i < value; i++) {
                starElements[i].classList.toggle('hover', isHovering);
            }

            this.ratingTooltips[value].classList.toggle('hidden', !isHovering);
            if (this.rating > 0) {
                if (!isHovering) {
                    // Make sure the tooltip of the selected value stays visible
                    this.ratingTooltips[this.rating].classList.remove('hidden');
                } else if (this.rating !== value) {
                    // Hide the tooltip of the selected value when another value is hovered
                    this.ratingTooltips[this.rating].classList.add('hidden');
                }
            }
        };
        ratingContainer.querySelectorAll('.star').forEach((starElement: HTMLElement) => {
            starElements.push(starElement);
            starElement.addEventListener('mouseenter', (event: Event) => {
                handleHover(event, true);
            });
            starElement.addEventListener('mouseleave', (event: Event) => {
                handleHover(event, false);
            });
            starElement.addEventListener('click', (event) => {
                let starElement: HTMLElement = event.currentTarget as HTMLElement;
                let value: number = parseInt(starElement.dataset.value);
                this.rating = value;
                for (let i = 0; i < starElements.length; i++) {
                    starElements[i].classList.toggle('selected', i < value);
                }
                this.onRating();
            });
        });

        ratingContainer.querySelectorAll('.tooltip > span').forEach((tooltip: HTMLElement) => {
            let value: number = parseInt(tooltip.dataset.value);
            this.ratingTooltips[value] = tooltip;
        })
    }

    onRating() {
        this.feedbackContainer.classList.remove('hidden');
        this.submitContainer.classList.remove('hidden');

        this.feedbackText.focus();
    }

    initSubmit() {
        this.submitContainer.querySelector('.submitButton').addEventListener('click', (event: Event) => {
            event.preventDefault();

            let feedback: UserFeedback = {
                rating: this.rating,
                text: this.feedbackText.value
            };

            this.sendUserFeedback(feedback);
        })
    }

    sendUserFeedback(feedback: UserFeedback) {
        let parameters = {
            'entry.1823206010': feedback.rating,
            'entry.959385503': feedback.text,
            'entry.2052218940': undefined, // Desired feature as 'Feature 1', 'Feature 2', ...
        };
        makeRequest({
            method: 'POST',
            url: 'https://docs.google.com/forms/d/e/1FAIpQLSfqC2NiJxMfWPNdbrfuOO0ibeLZBO44UIyZI1svp_otVog4sQ/formResponse',
            params: parameters,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(() => {
            // won't happen because of CORS
        }).catch(response => {
            if (_.isObject(response) && response.status === 0) {
                // All good, CORS just blocked the response but the server got the user feedback
                this.onSuccess();
                return;
            }

            this.submitContainer.classList.add('hasError');
        });
    }

    onSuccess() {
        this.ratingContainer.classList.add('hidden');
        this.feedbackContainer.classList.add('hidden');
        this.submitContainer.classList.add('hidden');

        this.successContainer.classList.remove('hidden');
        this.socialMediaContainer.querySelector('.default').classList.add('hidden');
        this.socialMediaContainer.querySelector('.submitted').classList.remove('hidden');
    }
}

interface UserFeedback {
    rating: number;
    text: string;
}