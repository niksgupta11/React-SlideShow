import { cleanup, wait, fireEvent } from '@testing-library/react';
import { renderFade, images } from '../test-utils';

afterEach(cleanup);

test('All children dom elements were loaded', () => {
  const { container } = renderFade();
  const childrenElements = container.querySelectorAll(
    '.react-slideshow-fade-images-wrap > div'
  );
  expect(childrenElements.length).toEqual(images.length);
});

test('The opacity and z-index of the first child are 1', () => {
  const { container } = renderFade();
  const childrenElements = container.querySelectorAll(
    '.react-slideshow-fade-images-wrap > div'
  );
  expect(childrenElements[0].style.opacity).toBe('1');
  expect(childrenElements[0].style.zIndex).toBe('1');
});

test('Left and right arrow navigation should show', () => {
  const { container } = renderFade();
  let nav = container.querySelectorAll('.nav');
  expect(nav.length).toEqual(2);
});

test('indicators should not show since default value is false', () => {
  const { container } = renderFade();
  let indicators = container.querySelectorAll('.indicators');
  expect(indicators.length).toBe(0);
});

const fadeProperties = {
  duration: 2000,
  transitionDuration: 200,
  indicators: true,
  arrows: false
};

const fadeProperties2 = {
  duration: 2000,
  transitionDuration: 200,
  arrows: true
};

test('Navigation arrows should not show if arrows props is false', () => {
  const { container } = renderFade(fadeProperties);
  let nav = container.querySelectorAll('.nav');
  expect(nav.length).toBe(0);
});

test('Nav arrow should be disabled on the first slide for infinite:false props', () => {
  const { container } = renderFade({ ...fadeProperties2, infinite: false });
  let nav = container.querySelectorAll('.nav');
  expect(nav[0].classList).toContain('disabled');
});

test("It shouldn't navigate if infinite false and previous arrow is clicked", async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderFade(
    { ...fadeProperties2, infinite: false },
    wrapperElement
  );
  const childrenElements = baseElement.querySelectorAll(
    '.react-slideshow-fade-images-wrap > div'
  );
  const nav = baseElement.querySelectorAll('.nav');
  fireEvent.click(nav[0]);
  await wait(
    () => {
      expect(
        parseFloat(childrenElements[childrenElements.length - 1].style.opacity)
      ).toBe(0);
      expect(parseFloat(childrenElements[0].style.opacity)).toBe(1);
    },
    {
      timeout: fadeProperties2.transitionDuration
    }
  );
});

test("It shouldn't navigate to next if infinite false and next arrow is clicked on the last slide", async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderFade(
    { ...fadeProperties2, defaultIndex: 2, infinite: false },
    wrapperElement
  );
  const childrenElements = baseElement.querySelectorAll(
    '.react-slideshow-fade-images-wrap > div'
  );
  const nav = baseElement.querySelectorAll('.nav');
  fireEvent.click(nav[1]);
  await wait(
    () => {
      expect(parseFloat(childrenElements[0].style.opacity)).toBe(0);
      expect(parseFloat(childrenElements[2].style.opacity)).toBe(1);
    },
    {
      timeout: fadeProperties2.transitionDuration
    }
  );
});

test('indciators should show with the exact number of children dots', () => {
  const { container } = renderFade(fadeProperties);
  let indicators = container.querySelectorAll('.indicators');
  let dots = container.querySelectorAll('.indicators > div');
  expect(indicators.length).toBe(1);
  expect(dots.length).toBe(images.length);
});

test('When next or previous arrow is clicked, the right child shows up', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderFade(fadeProperties2, wrapperElement);
  const childrenElements = baseElement.querySelectorAll(
    '.react-slideshow-fade-images-wrap > div'
  );
  const nav = baseElement.querySelectorAll('.nav');
  fireEvent.click(nav[1]);
  await wait(
    () => {
      expect(parseFloat(childrenElements[1].style.opacity)).toBeGreaterThan(0);
    },
    {
      timeout: fadeProperties2.transitionDuration
    }
  );

  fireEvent.click(nav[0]);
  await wait(
    () => {
      expect(parseFloat(childrenElements[0].style.opacity)).toBeGreaterThan(0);
    },
    {
      timeout: fadeProperties2.transitionDuration
    }
  );
});

test(`The second child should start transition to opacity after ${fadeProperties.duration}ms`, async () => {
  const { container } = renderFade(fadeProperties);
  await wait(
    () => {
      const childrenElements = container.querySelectorAll(
        '.react-slideshow-fade-images-wrap > div'
      );
      expect(parseFloat(childrenElements[1].style.opacity)).toBeGreaterThan(0);
    },
    {
      timeout: fadeProperties.duration + fadeProperties.transitionDuration
    }
  );
});

test('When the pauseOnHover prop is true and the mouse hovers the container the slideshow stops', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderFade(
    { ...fadeProperties, autoplay: true, pauseOnHover: true },
    wrapperElement
  );
  const childrenElements = baseElement.querySelectorAll(
    '.react-slideshow-fade-images-wrap > div'
  );

  fireEvent.mouseEnter(baseElement.querySelector('.react-slideshow-container'));
  // nothing happens on mouse enter
  await wait(
    () => {
      expect(Math.round(childrenElements[0].style.opacity)).toBe(1);
      expect(childrenElements[0].style.zIndex).toBe('1');
      expect(Math.round(childrenElements[1].style.opacity)).toBe(0);
      expect(childrenElements[1].style.zIndex).toBe('0');
    },
    {
      timeout: fadeProperties.duration + fadeProperties.transitionDuration
    }
  );
  fireEvent.mouseLeave(baseElement.querySelector('.react-slideshow-container'));
  // it resumes
  await wait(
    () => {
      expect(Math.round(childrenElements[0].style.opacity)).toBe(0);
      expect(Math.round(childrenElements[1].style.opacity)).toBe(1);
    },
    {
      timeout: fadeProperties.duration + fadeProperties.transitionDuration
    }
  );
});
