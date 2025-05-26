import { serve } from 'https://deno.land/std@0.177.1/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Test Pinata authentication first
    const pinataResponse = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PINATA_JWT')}`,
      },
    });

    if (!pinataResponse.ok) {
      throw new Error(`Pinata authentication failed: ${await pinataResponse.text()}`);
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    pinataFormData.append('pinataMetadata', JSON.stringify({
      name: 'BlockTix Event Image',
      keyvalues: {
        app: 'BlockTix',
        type: 'event-image',
        groupId: '950e7186-8694-4e04-9ec5-1775896d0a88',
      }
    }));

    // Upload to Pinata
    const uploadResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PINATA_JWT')}`,
      },
      body: pinataFormData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(`Pinata upload failed: ${errorData.error?.details || 'Unknown error'}`);
    }

    const { IpfsHash } = await uploadResponse.json();

    return new Response(
      JSON.stringify({ ipfsHash: IpfsHash }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});