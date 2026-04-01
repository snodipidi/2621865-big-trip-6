import {render, replace, remove} from '../framework/render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import EditFormView from '../view/edit-form-view.js';
import EventView from '../view/event-view.js';
import Model from '../model/model.js';

export default class MainPresenter {
  constructor() {
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.eventsContainer = document.querySelector('.trip-events');
    this.model = new Model();
    this.eventsList = null;
  }

  init() {
    render(new FiltersView(), this.filtersContainer);
    render(new SortView(), this.eventsContainer);

    const eventsList = document.createElement('ul');
    eventsList.classList.add('trip-events__list');
    this.eventsContainer.appendChild(eventsList);
    this.eventsList = eventsList;

    this._renderPoints();
  }

  _renderPoints() {
    const points = this.model.getPoints();
    
    points.forEach((point) => {
      this._renderPoint(point);
    });
  }

  _renderPoint(point) {
    const destination = this.model.getDestinationById(point.destinationId);
    const pointOffers = this.model.getOffersByType(point.type)
      .filter((offer) => point.offersIds.includes(offer.id));

    const pointComponent = new EventView(point, destination, pointOffers,
      () => this._replacePointToForm(pointComponent, point, destination, pointOffers)
    );

    render(pointComponent, this.eventsList);
    pointComponent.setEventListeners();
  }

  _replacePointToForm(pointComponent, point, destination, pointOffers) {
    const editFormComponent = new EditFormView(point, destination, pointOffers,
      (evt) => {
        evt.preventDefault();
        this._replaceFormToPoint(editFormComponent, point, destination, pointOffers);
      },
      () => this._replaceFormToPoint(editFormComponent, point, destination, pointOffers)
    );

    const onEscKeyDown = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        document.removeEventListener('keydown', onEscKeyDown);
        this._replaceFormToPoint(editFormComponent, point, destination, pointOffers);
      }
    };
    document.addEventListener('keydown', onEscKeyDown);

    replace(editFormComponent, pointComponent);
    editFormComponent.setEventListeners();
  }

  _replaceFormToPoint(editFormComponent, point, destination, pointOffers) {
    const newPointComponent = new EventView(point, destination, pointOffers,
      () => this._replacePointToForm(newPointComponent, point, destination, pointOffers)
    );

    replace(newPointComponent, editFormComponent);
    newPointComponent.setEventListeners();
    remove(editFormComponent);
  }
}