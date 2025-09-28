import { createFileRoute } from '@tanstack/react-router';
import { PayNowView } from '../../../components/PayNowView';

export const Route = createFileRoute('/user/payment/')({
  component: PaymentPage,
});

function PaymentPage() {
  return <PayNowView />;
}
