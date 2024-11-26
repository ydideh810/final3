import braintree from 'braintree';

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'your_merchant_id',
  publicKey: 'your_public_key',
  privateKey: 'your_private_key'
});

export async function generateClientToken() {
  try {
    const response = await gateway.clientToken.generate({});
    return response.clientToken;
  } catch (err) {
    console.error('Error generating client token:', err);
    throw new Error('Failed to initialize payment system');
  }
}