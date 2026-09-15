const GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzw6UkrKb16LC2B2JPZVGo4OK4ck9MEKlEEwkFwgHcdyxI7ndZO5qmqdNUkBUsakmKciA/exec';

export function GET() {
  return Response.json({
    success: true,
    status: 'BQ Recruiting Lead API proxy is running'
  });
}

export async function POST(request) {
  try {
    let payload = {};

    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    // Honeypot: bots may fill this hidden field.
    if (payload.website) {
      return Response.json({ success: true });
    }

    const gasResponse = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const raw = await gasResponse.text();

    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      result = {
        success: gasResponse.ok,
        raw
      };
    }

    if (!gasResponse.ok || result.success === false) {
      return Response.json(
        {
          success: false,
          error:
            result.error ||
            `Google Apps Script returned HTTP ${gasResponse.status}`
        },
        { status: 502 }
      );
    }

    return Response.json({
      success: true
    });

  } catch (error) {
    console.error('Lead proxy error:', error);

    return Response.json(
      {
        success: false,
        error: 'Lead submission service unavailable'
      },
      { status: 500 }
    );
  }
}
