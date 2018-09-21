let html = require('./rating.html');

export class Rating {
    private socialMediaContainer: Element;
    private feedbackContainer: Element;
    private feedbackText: HTMLTextAreaElement;
    private submitContainer: Element;
    private rating: number = 0;

    constructor(parentElement: Element, showSocialMedia: boolean) {
        parentElement.innerHTML = html;

        this.initRatingContainer(parentElement.querySelector('.ratingContainer'));

        this.socialMediaContainer = parentElement.querySelector('.socialMediaContainer');
        this.socialMediaContainer.classList.toggle('hidden', !showSocialMedia);

        this.feedbackContainer = parentElement.querySelector('.feedbackContainer');
        this.feedbackText = this.feedbackContainer.querySelector('.feedbackText') as HTMLTextAreaElement;

        this.submitContainer = parentElement.querySelector('.submitContainer');

        this.initSubmit();
    }

    initRatingContainer(ratingContainer: Element) {
        let starElements: HTMLElement[] = [];
        let handleHover = (event: Event, isHovering: boolean) => {
            // if (this.rating > 0){
            //     return;
            // }
            // event.currentTarget refers to the element that this handler was bound to while event.target is the actual element that triggered the event
            let starElement: HTMLElement = event.currentTarget as HTMLElement;
            let value: number = parseInt(starElement.dataset.value);
            for (let i = 0; i < value; i++) {
                starElements[i].classList.toggle('hover', isHovering);
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

        // ratingContainer.addEventListener('mouseleave', (event: Event) => {
        //     for (let i = 0; i < starElements.length; i++) {
        //         starElements[i].classList.remove('hover');
        //     }
        // });
    }

    initSubmit() {
        this.submitContainer.querySelector('.submitButton').addEventListener('click', (event: Event) => {
            event.preventDefault();

            let feedback = {
                rating: this.rating,
                text: this.feedbackText.value
            }
        })
    }

    onRating() {
        this.feedbackContainer.classList.remove('hidden');
        this.submitContainer.classList.remove('hidden');

        this.feedbackText.focus();
    }
}

