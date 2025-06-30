import { Component, h, Prop, State } from '@stencil/core';
import { z } from 'zod';

const billingSchema = z.object({
  billingName: z.string().min(1, { message: 'billingName must be filled out.' }),
  billingEmail: z.string().email({ message: 'billingEmail must be valid.' }),
  billingPhone: z.string().min(10),
  billingAddress1: z.string().min(1),
  billingCity: z.string().min(1),
  billingState: z.string().min(1),
  billingZipcode: z.string().min(1),
});

@Component({
  tag: 'billing-form',
  styleUrl: 'billing-form.css',
  shadow: false,
})
export class BillingForm {
  @Prop() inputData: any;
  @State() billingForm = {
    billingName: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress1: '',
    billingCity: '',
    billingState: '',
    billingZipcode: '',
  };
  @State() isFormEditable: boolean = true;
  @State() formErrors: Record<string, string> = {};
  @State() showPayment: boolean = false;

  componentWillLoad() {
    if (this.inputData?.addresses?.billingAddress) {
      const parseResult = billingSchema.safeParse(this.inputData.addresses.billingAddress);
      if (parseResult.success) {
        this.billingForm = parseResult.data;
        this.isFormEditable = false;
        this.showPayment = true;
      }
    }
  }

  private handleChange(field: string, value: string) {
    this.billingForm = { ...this.billingForm, [field]: value };
    this.validateForm();
  }

  private validateForm() {
    const result = billingSchema.safeParse(this.billingForm);
    if (result.success) {
      this.formErrors = {};
    } else {
      this.formErrors = {};
      result.error.errors.forEach((err) => {
        this.formErrors[err.path[0]] = err.message;
      });
    }
  }

  private handleContinue() {
    this.validateForm();
    if (Object.keys(this.formErrors).length === 0) {
      this.isFormEditable = false;
      this.showPayment = true;
      // this.sendToAPI(this.billingForm); // Integrate API call here
    }
  }

  private handleEdit() {
    this.isFormEditable = true;
    this.showPayment = false;
  }

  private renderInput(label: string, name: keyof typeof this.billingForm, type = 'text') {
    return (
      <div>
        <label>{label}</label>
        <input
          type={type}
          value={this.billingForm[name]}
          disabled={!this.isFormEditable}
          onInput={(e: any) => this.handleChange(name, e.target.value)}
        />
        {this.formErrors[name] && <span class="error">{this.formErrors[name]}</span>}
      </div>
    );
  }

  render() {
    return (
      <div>
        <h3>Billing address</h3>
        {this.renderInput('Name', 'billingName')}
        {this.renderInput('Email', 'billingEmail')}
        {this.renderInput('Phone', 'billingPhone')}
        {this.renderInput('Address', 'billingAddress1')}
        {this.renderInput('City', 'billingCity')}
        {this.renderInput('State', 'billingState')}
        {this.renderInput('Zip code', 'billingZipcode')}

        {this.isFormEditable ? (
          <button disabled={Object.keys(this.formErrors).length > 0} onClick={() => this.handleContinue()}>
            Continue
          </button>
        ) : (
          <button onClick={() => this.handleEdit()}>Edit</button>
        )}

        {this.showPayment && (
          <div>
            <h4>Payment methods</h4>
            <label><input type="radio" name="payment" /> Credit or debit card</label>
            <label><input type="radio" name="payment" /> ACH</label>
            <p class="powered">Payment by <strong>worldpay</strong></p>
          </div>
        )}
      </div>
    );
  }
}
