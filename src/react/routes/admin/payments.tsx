import { createFileRoute } from '@tanstack/react-router';
import { PaymentsTable } from '../../admin-components/PaymentsTable';

export const Route = createFileRoute('/admin/payments')({
  component: AdminPayments,
});

function AdminPayments() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payments Management</h1>
          <p className="text-slate-300">
            View and manage all payment records
          </p>
        </div>

        <PaymentsTable />
      </main>
    </div>
  );
}
