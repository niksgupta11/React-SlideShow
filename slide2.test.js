import { cleanup, fireEvent, wait } from '@testing-library/react';
import React from 'react';
import { renderSlide } from '../test-utils';
import { prettyDOM } from '@testing-library/dom';

const options = {
  duration: 1000,
  transitionDuration: 50,
  infinite: true,
  indicators: true
};

afterEach(cleanup);

test('When the second indicator is clicked, the third child should have active class', async () => {
  const wrapperElement = document.createElement('div');
  const onChange = jest.fn();
  const { baseElement } = renderSlide(
    { ...options, autoplay: false, onChange },
    wrapperElement
  );
  let dots = baseElement.querySelectorAll('.indicators > div');
  const childrenElements = baseElement.querySelectorAll('.images-wrap > div');
  fireEvent.click(dots[1]);
  await wait(
    () => {
      expect(childrenElements[2].classList).toContain('active');
      expect(onChange).toBeCalledWith(0, 1);
    },
    {
      timeout: options.transitionDuration + options.duration
    }
  );
});

test('When the autoplay prop changes from false to true the slideshow plays again', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement, rerender } = renderSlide(
    { ...options, autoplay: false },
    wrapperElement
  );
  // nothing changes after duration and transitionDuration
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
  renderSlide({ ...options, autoplay: true }, false, rerender);
  await wait(
    () => {
      const childrenElements = baseElement.querySelectorAll(
        '.images-wrap > div'
      );
      expect(childrenElements[2].classList).toContain('active');
    },
    {
      timeout: options.duration + options.transitionDuration + 1000
    }
  );
});

test('When the autoplay prop changes from true to false the slideshow stops', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement, rerender } = renderSlide(
    { ...options, autoplay: true },
    wrapperElement
  );
  // the slide plays since autoplay is true changes after duration and transitionDuration
  await wait(
    () => {
      const childrenElements = baseElement.querySelectorAll(
        '.images-wrap > div'
      );
      expect(childrenElements[2].classList).toContain('active');
    },
    {
      timeout: options.duration + options.transitionDuration + 1000
    }
  );
  renderSlide({ ...options, autoplay: false }, false, rerender);
  await wait(
    () => {
      const childrenElements = baseElement.querySelectorAll(
        '.images-wrap > div'
      );
      expect(childrenElements[2].classList).toContain('active');
      expect(childrenElements[3].classList.contains('active')).toBeFalsy();
    },
    {
      timeout: options.duration + options.transitionDuration
    }
  );
});

test('When a valid defaultIndex prop is set, it shows that particular index first', () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderSlide(
    { ...options, defaultIndex: 1 },
    wrapperElement
  );
  const childrenElements = baseElement.querySelectorAll('.images-wrap > div');
  expect(childrenElements[2].classList).toContain('active');
});

test('shows custom indicators if it exists', () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderSlide(
    {
      ...options,
      indicators: index => <div className="custom-indicator">{index + 1}</div>
    },
    wrapperElement
  );
  const indicators = baseElement.querySelectorAll('.custom-indicator');
  expect(indicators).toHaveLength(3);
  expect(indicators[0].innerHTML).toBe('1');
  expect(indicators[1].innerHTML).toBe('2');
  expect(indicators[2].innerHTML).toBe('3');
});

test('Custom nextArrow indicator can be set', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderSlide(
    {
      ...options,
      nextArrow: <div className="next">Next</div>
    },
    wrapperElement
  );
  expect(baseElement.querySelector('.next')).toBeTruthy();
  fireEvent.click(baseElement.querySelector('[data-type="next"]'));
  await wait(
    () => {
      expect(baseElement.querySelector('[data-index="1"]').classList).toContain(
        'active'
      );
    },
    {
      timeout: options.transitionDuration + 200
    }
  );
});

test('Custom prevArrow indicator can be set', async () => {
  const wrapperElement = document.createElement('div');
  const { baseElement } = renderSlide(
    {
      ...options,
      prevArrow: <div className="previous">Previous</div>
    },
    wrapperElement
  );
  expect(baseElement.querySelector('.previous')).toBeTruthy();
  fireEvent.click(baseElement.querySelector('[data-type="prev"]'));
  await wait(
    () => {
      expect(baseElement.querySelector('[data-index="2"]').classList).toContain(
        'active'
      );
    },
    {
      timeout: options.transitionDuration + 200
    }
  );
});
