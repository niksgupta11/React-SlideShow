import {
  cleanup,
  wait,
  fireEvent,
  waitForDomChange
} from '@testing-library/react';
import { renderSlide, images } from '../test-utils';

const options = {
  duration: 1000,
  transitionDuration: 50,
  infinite: true,
  indicators: true
};

afterEach(cleanup);

test('All slide children dom elements were loaded, the first and last are loaded twice', () => {
  const { container } = renderSlide(options);
  const childrenElements = container.querySelectorAll('.images-wrap > div');
  expect(childrenElements.length).toEqual(images.length + 2);
});

test('indciators should show with the exact number of children dots', () => {
  const { container } = renderSlide(options);
  let indicators = container.querySelectorAll('.indicators');
  let dots = container.querySelectorAll('.indicators > div');
  expect(indicators.length).toBe(1);
  expect(dots.length).toBe(images.length);
});

test('Navigation arrows should show if not specified', () => {
  const { container } = renderSlide(options);
  let nav = container.querySelectorAll('.nav');
  expect(nav.length).toBe(2);
});

test('Previous navigation array should be disabled if infinite option is false', async () => {
  const { baseElement } = renderSlide({ ...options, infinite: false });
  let nav = baseElement.querySelectorAll('.nav');
  expect(nav[0].classList).toContain('disabled');
  fireEvent.click(nav[0]);
  await wait(
    () => {
      expect(baseElement.querySelector('[data-index="0"]').classList).toContain(
        'active'
      );
    },
    {
      timeout: options.transitionDuration
    }
  );
});

test('When next is clicked, the second child should have an active class', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderSlide(options, wrapperElement);
  const childrenElements = baseElement.querySelectorAll('.images-wrap > div');
  const nav = baseElement.querySelectorAll('.nav');
  fireEvent.click(nav[1]);
  await wait(
    () => {
      expect(childrenElements[1].classList).toContain('active');
    },
    {
      timeout: options.transitionDuration
    }
  );
});

test('If infinite is false and next is clicked on the last image everything should remain the same', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderSlide(
    { ...options, infinite: false, defaultIndex: 2 },
    wrapperElement
  );
  const childrenElements = baseElement.querySelectorAll('.images-wrap > div');
  const nav = baseElement.querySelectorAll('.nav');
  fireEvent.click(nav[1]);
  await wait(
    () => {
      expect(childrenElements[3].classList).toContain('active');
    },
    {
      timeout: options.transitionDuration
    }
  );
});

test('When back is clicked, the third child should have an active class', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderSlide(options, wrapperElement);
  const nav = baseElement.querySelectorAll('.nav');
  fireEvent.click(nav[0]);
  await waitForDomChange({
    container: baseElement.querySelector('.indicators')
  });
  const childrenElements = baseElement.querySelectorAll('.images-wrap > div');
  // index 3 was used because there are two extra divs, one at the beginning and end
  expect(childrenElements[3].classList).toContain('active');
});

test('It should automatically show second child after first slide', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderSlide(options, wrapperElement);
  await wait(
    () => {
      const childrenElements = baseElement.querySelectorAll(
        '.images-wrap > div'
      );
      expect(childrenElements[1].classList).toContain('active');
    },
    {
      timeout: options.duration + options.transitionDuration
    }
  );
});

test('When the pauseOnHover prop is true and the mouse hovers the container the slideshow stops', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderSlide(
    { ...options, autoplay: true, pauseOnHover: true },
    wrapperElement
  );
  const childrenElements = baseElement.querySelectorAll('.images-wrap > div');

  fireEvent.mouseEnter(baseElement.querySelector('.react-slideshow-container'));
  await wait(
    () => {
      expect(childrenElements[1].classList).toContain('active');
    },
    {
      timeout: options.duration + options.transitionDuration
    }
  );
  fireEvent.mouseLeave(baseElement.querySelector('.react-slideshow-container'));
  await wait(
    () => {
      expect(childrenElements[2].classList).toContain('active');
    },
    {
      timeout: options.duration + options.transitionDuration
    }
  );
});
