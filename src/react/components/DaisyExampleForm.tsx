// Example: How to refactor forms with DaisyUI
// This shows the difference between current styling and DaisyUI approach

import { useState } from 'react';

export default function DaisyExampleForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Your submit logic here
    setTimeout(() => {
      setLoading(false);
      setSuccess('Form submitted successfully!');
    }, 1000);
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        {/* Header */}
        <h2 className="card-title text-2xl mb-4">🎨 DaisyUI Example Form</h2>

        {success && (
          <div className="alert alert-success mb-4">
            <svg
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Input */}
          <div className="form-control">
            <label htmlFor="name" className="label">
              <span className="label-text">Name</span>
              <span className="label-text-alt">Required</span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          {/* Email Input */}
          <div className="form-control">
            <label htmlFor="email" className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <div className="label">
              <span className="label-text-alt">
                We'll never share your email
              </span>
            </div>
          </div>

          {/* Select Dropdown */}
          <div className="form-control">
            <label htmlFor="category" className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              id="category"
              className="select select-bordered w-full"
              value={formData.category}
              onChange={e =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option disabled value="">
                Pick a category
              </option>
              <option value="wide-angle">Wide Angle</option>
              <option value="macro">Macro</option>
              <option value="black-white">Black & White</option>
            </select>
          </div>

          {/* Toggle */}
          <div className="form-control">
            <label htmlFor="isActive" className="label cursor-pointer">
              <span className="label-text">Active Status</span>
              <input
                id="isActive"
                type="checkbox"
                className="toggle toggle-primary"
                checked={formData.isActive}
                onChange={e =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            </label>
          </div>

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Form'}
            </button>
          </div>
        </form>

        {/* Additional Actions */}
        <div className="card-actions justify-end mt-4">
          <button className="btn btn-ghost">Cancel</button>
          <button className="btn btn-secondary">Save Draft</button>
        </div>
      </div>
    </div>
  );
}
