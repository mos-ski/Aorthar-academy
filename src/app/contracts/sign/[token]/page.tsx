import SignContractClient from './SignContractClient';

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment_ref?: string }>;
};

export default async function SignContractPage({ params, searchParams }: Props) {
  const [{ token }, { payment_ref: paymentRef }] = await Promise.all([params, searchParams]);
  return <SignContractClient token={token} paymentRef={paymentRef ?? null} />;
}
