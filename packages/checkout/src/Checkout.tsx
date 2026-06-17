import React, { useState, useEffect } from 'react';
import Button from 'uiKit/Button';
import Input from 'uiKit/Input';
import Toast from 'uiKit/Toast';
import { EventBus, EVENTS } from '@mfe-demo/shared/eventBus';
import { CartItem, ShippingAddress } from '@mfe-demo/shared/types';
import './styles.css';

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  useEffect(() => {
    const stored = localStorage.getItem('mfe-cart');
    setCartItems(stored ? JSON.parse(stored) : []);
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ShippingAddress]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Clear cart
    localStorage.removeItem('mfe-cart');
    EventBus.emit(EVENTS.CART_CLEAR, null);

    setOrderPlaced(true);
    setShowToast(true);
  };

  if (orderPlaced) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">
          Order Placed Successfully!
        </h2>
        <p className="text-secondary-500">
          Thank you for your purchase. Your order is being processed.
        </p>
        <div className="mt-6">
          <Button onClick={() => (window.location.href = '/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-secondary-500 text-lg">Your cart is empty.</p>
        <p className="text-secondary-400 text-sm mt-2">
          Add items to your cart before checking out.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Checkout</h1>

      {/* Order summary */}
      <div className="bg-white p-4 rounded shadow-sm border border-secondary-200 mb-6">
        <h2 className="font-semibold text-secondary-900 mb-3">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.product.id} className="flex justify-between text-sm py-1">
            <span className="text-secondary-600">
              {item.product.name} × {item.quantity}
            </span>
            <span className="text-secondary-900 font-medium">
              ${(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="border-t border-secondary-200 mt-3 pt-3 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary-600">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm border border-secondary-200">
        <h2 className="font-semibold text-secondary-900 mb-4">Shipping Address</h2>

        <Input
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="John Doe"
          error={errors.fullName}
          required
        />
        <Input
          label="Address Line 1"
          name="addressLine1"
          value={form.addressLine1}
          onChange={handleChange}
          placeholder="123 Main Street"
          error={errors.addressLine1}
          required
        />
        <Input
          label="Address Line 2"
          name="addressLine2"
          value={form.addressLine2 || ''}
          onChange={handleChange}
          placeholder="Apt, suite, unit (optional)"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="San Francisco"
            error={errors.city}
            required
          />
          <Input
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="CA"
            error={errors.state}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Zip Code"
            name="zipCode"
            value={form.zipCode}
            onChange={handleChange}
            placeholder="94102"
            error={errors.zipCode}
            required
          />
          <Input
            label="Country"
            name="country"
            value={form.country}
            onChange={handleChange}
            placeholder="United States"
            error={errors.country}
            required
          />
        </div>

        <div className="mt-6">
          <Button type="submit" fullWidth>
            Place Order — ${total.toFixed(2)}
          </Button>
        </div>
      </form>

      {showToast && (
        <Toast
          message="Order placed successfully!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Checkout;
