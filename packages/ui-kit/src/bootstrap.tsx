import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import Button from './components/Button';
import Card from './components/Card';
import Badge from './components/Badge';
import Input from './components/Input';

// Standalone preview app for the UI Kit
const App = () => {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-secondary-900 mb-8">
        UI Kit - Component Preview
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Buttons</h2>
        <div className="flex gap-4 flex-wrap">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Badge</h2>
        <div className="flex gap-4 items-center">
          <span>Cart: <Badge count={3} /></span>
          <span>Notifications: <Badge count={150} variant="primary" /></span>
          <span>Empty: <Badge count={0} /></span>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Input</h2>
        <div className="max-w-sm">
          <Input
            label="Email"
            name="email"
            type="email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="With Error"
            name="error-demo"
            value=""
            onChange={() => {}}
            error="This field is required"
            required
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            title="Product Card"
            image="https://picsum.photos/400/300"
            imageAlt="Sample product"
            footer={<Button size="sm">Add to Cart</Button>}
          >
            <p>A beautiful product worth buying.</p>
            <p className="text-lg font-bold text-secondary-900 mt-2">$29.99</p>
          </Card>
          <Card title="Simple Card">
            <p>This is a basic card without an image.</p>
          </Card>
        </div>
      </section>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
