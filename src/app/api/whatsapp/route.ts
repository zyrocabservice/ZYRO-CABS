
import {NextRequest, NextResponse} from 'next/server';

/**
 * Handles the GET request for WhatsApp webhook verification.
 * 
 * @param {NextRequest} request - The incoming request object.
 * @returns {Response} The response to be sent back to WhatsApp.
 */
export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === verifyToken) {
      // Respond with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      return new Response(challenge, {status: 200});
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      console.error('Webhook verification failed: Tokens do not match.');
      return new Response(null, {status: 403});
    }
  }
  return new Response(null, {status: 400});
}

/**
 * Handles the POST request which contains the webhook payload.
 * 
 * @param {NextRequest} request - The incoming request object.
 * @returns {NextResponse} A 200 OK response.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Log the entire payload to see incoming messages from users
    // console.log('Received WhatsApp Webhook Payload:', JSON.stringify(body, null, 2));

    // Here is where you would add logic to process the incoming message.
    // For example, checking message type, content, and responding.

    return new NextResponse(null, {status: 200});
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', {status: 500});
  }
}
