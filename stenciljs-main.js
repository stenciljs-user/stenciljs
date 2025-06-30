import { Component, Prop, h, State } from '@stencil/core';

@Component({
  tag: 'billing-form',
  styleUrl: 'billing-form.css',
  shadow: false,
})
export class BillingForm {
  @Prop() inputData: any;

  @State() formData = {
    name: '',
    email: '',
    phone: '',
    address1: '',
    city: '',
    state: '',
    zipcode: '',
  };

  @State() isValid = false;
  @State() isSubmitted = false;
  @State() isEditing = false;

  componentWillLoad() {
    if (this.inputData?.addresses?.billingAddress) {
      const billing = this.inputData.addresses.billingAddress;
      const requiredFields = ['billingName', 'billingEmail', 'billingPhone', 'billingAddress1', 'billingCity', 'billingState', 'billingZipcode'];
      const isComplete = requiredFields.every(field => billing[field]);
      if (isComplete) {
        this.formData = {
          name: billing.billingName,
          email: billing.billingEmail,
          phone: billing.billingPhone,
          address1: billing.billingAddress1,
          city: billing.billingCity,
          state: billing.billingState,
          zipcode: billing.billingZipcode,
        };
        this.isSubmitted = true;
      }
    }
  }

  handleInputChange(e, field) {
    this.formData = { ...this.formData, [field]: e.target.value };
    this.validateForm();
  }

  validateForm() {
    const { name, email, phone, address1, city, state, zipcode } = this.formData;
    const isValid = name && email && phone && address1 && city && state && zipcode;
    this.isValid = !!isValid;
  }

  handleContinue = () => {
    if (!this.isValid) return;
    this.isSubmitted = true;
    this.isEditing = false;
    // Call Phoenix BFF here if needed
  };

  handleEdit = () => {
    this.isEditing = true;
    this.isSubmitted = false;
  };

  renderBillingForm() {
    const fields = [
      { label: 'Address', field: 'address1' },
      { label: 'City', field: 'city' },
      { label: 'Zip code', field: 'zipcode' },
      { label: 'Select state', field: 'state' },
    ];

    return (
      <div>
        <input type="text" placeholder="Name" value={this.formData.name} onInput={e => this.handleInputChange(e, 'name')} />
        <input type="text" placeholder="Email" value={this.formData.email} onInput={e => this.handleInputChange(e, 'email')} />
        <input type="text" placeholder="Phone" value={this.formData.phone} onInput={e => this.handleInputChange(e, 'phone')} />
        {fields.map(item => (
          <input type="text" placeholder={item.label} value={this.formData[item.field]} onInput={e => this.handleInputChange(e, item.field)} />
        ))}
        <button disabled={!this.isValid} onClick={this.handleContinue}>Continue</button>
      </div>
    );
  }

  renderReadOnly() {
    const { name, email, phone, address1, city, state, zipcode } = this.formData;
    return (
      <div>
        <p>{name}</p>
        <p>{email}</p>
        <p>{phone}</p>
        <p>{address1}, {city}, {state} - {zipcode}</p>
        <button onClick={this.handleEdit}>Edit</button>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h3>Billing address</h3>
        {!this.isSubmitted || this.isEditing ? this.renderBillingForm() : this.renderReadOnly()}

        {this.isSubmitted && !this.isEditing && (
          <div class="payment-methods">
            <h4>Payment methods</h4>
            <label><input type="radio" name="payment" /> Credit or debit card</label>
            <label><input type="radio" name="payment" /> ACH</label>
          </div>
        )}
      </div>
    );
  }
}
