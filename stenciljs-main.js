
import { newSpecPage } from '@stencil/core/testing';
import { CommonSelect } from './common-select';

describe('common-select with props in HTML', () => {
  it('renders with basic props from HTML', async () => {
    const page = await newSpecPage({
      components: [CommonSelect],
      html: `<common-select 
               name="country" 
               placeholder="Select country" 
               required 
               required-error-text="Country is required"
               value="USA"
             ></common-select>`,
    });

    page.root.options = ['USA', 'Canada', 'Mexico'];
    await page.waitForChanges();

    const select = page.root.shadowRoot.querySelector('select');
    expect(select.getAttribute('name')).toBe('country');
    expect(select.getAttribute('id')).toBe('country');
    expect(select.value).toBe('USA');

    const options = page.root.shadowRoot.querySelectorAll('option');
    expect(options.length).toBe(4); // 1 placeholder + 3 options
    expect(options[1].textContent).toBe('USA');
  });

  it('emits valueChanged event on input', async () => {
    const page = await newSpecPage({
      components: [CommonSelect],
      html: `<common-select name="test-select" value="One" required></common-select>`,
    });

    page.root.options = ['One', 'Two', 'Three'];
    await page.waitForChanges();

    const spy = jest.fn();
    page.root.addEventListener('valueChanged', spy);

    const select = page.root.shadowRoot.querySelector('select');
    select.value = 'Two';
    select.dispatchEvent(new Event('input'));
    await page.waitForChanges();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail).toBe('Two');
  });

  it('shows required error when value is empty and required', async () => {
    const page = await newSpecPage({
      components: [CommonSelect],
      html: `<common-select 
               name="email" 
               required 
               required-error-text="This field is required"
             ></common-select>`,
    });

    page.root.options = ['Yes', 'No'];
    page.root.value = ''; // empty selection
    await page.waitForChanges();

    const select = page.root.shadowRoot.querySelector('select');
    select.value = '';
    select.dispatchEvent(new Event('input'));
    await page.waitForChanges();

    const error = page.root.shadowRoot.querySelector('p');
    expect(error).toBeTruthy();
    expect(error.textContent).toBe('This field is required');
  });

  it('renders with disabled attribute when set in HTML', async () => {
    const page = await newSpecPage({
      components: [CommonSelect],
      html: `<common-select name="region" disabled></common-select>`,
    });

    page.root.options = ['East', 'West'];
    await page.waitForChanges();

    const select = page.root.shadowRoot.querySelector('select');
    expect(select.disabled).toBe(true);
  });

  it('applies classNames passed via HTML attribute', async () => {
    const page = await newSpecPage({
      components: [CommonSelect],
      html: `<common-select class-names="my-custom-class" name="zones"></common-select>`,
    });

    page.root.options = ['Zone 1', 'Zone 2'];
    await page.waitForChanges();

    const select = page.root.shadowRoot.querySelector('select');
    expect(select.className).toContain('my-custom-class');
  });
});
