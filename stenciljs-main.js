import { newSpecPage } from '@stencil/core/testing';
import { CommonButton } from './common-button';

describe('common-button', () => {
  it('renders with label', async () => {
    const page = await newSpecPage({
      components: [CommonButton],
      html: `<common-button label="Click Me"></common-button>`,
    });

    expect(page.root.shadowRoot.textContent).toContain('Click Me');
  });

  it('renders with slot fallback when label is not provided', async () => {
    const page = await newSpecPage({
      components: [CommonButton],
      html: `<common-button><span>Slot Label</span></common-button>`,
    });

    expect(page.root.shadowRoot.querySelector('button')?.innerHTML).toContain('<slot>');
  });

  it('applies primary variant styles by default', async () => {
    const page = await newSpecPage({
      components: [CommonButton],
      html: `<common-button label="Primary"></common-button>`,
    });

    const classList = page.root.shadowRoot.querySelector('button')?.className;
    expect(classList).toContain('bg-primary-default');
  });

  it('applies secondary variant styles', async () => {
    const page = await newSpecPage({
      components: [CommonButton],
      html: `<common-button label="Secondary" variant="secondary"></common-button>`,
    });

    const classList = page.root.shadowRoot.querySelector('button')?.className;
    expect(classList).toContain('bg-secondary-default');
  });

  it('does not emit event when disabled', async () => {
    const page = await newSpecPage({
      components: [CommonButton],
      html: `<common-button label="Disabled" disabled></common-button>`,
    });

    const button = page.rootInstance;
    const spy = jest.fn();
    button.buttonClicked = {
      emit: spy,
    } as any;

    await page.root.shadowRoot.querySelector('button')?.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits buttonClicked when enabled and clicked', async () => {
    const page = await newSpecPage({
      components: [CommonButton],
      html: `<common-button label="Click Me"></common-button>`,
    });

    const instance = page.rootInstance;
    const spy = jest.fn();
    instance.buttonClicked = {
      emit: spy,
    } as any;

    await page.root.shadowRoot.querySelector('button')?.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('appends additional classNames', async () => {
    const page = await newSpecPage({
      components: [CommonButton],
      html: `<common-button label="Styled" class-names="custom-class"></common-button>`,
    });

    const classList = page.root.shadowRoot.querySelector('button')?.className;
    expect(classList).toContain('custom-class');
  });

  it('wraps content in <common-button> host element', async () => {
    const page = await newSpecPage({
      components: [CommonButton],
      html: `<common-button label="Test"></common-button>`,
    });

    expect(page.root.tagName).toBe('COMMON-BUTTON');
    expect(page.root.shadowRoot.querySelector('button')).toBeTruthy();
  });
});
