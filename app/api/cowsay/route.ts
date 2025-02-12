import { NextResponse } from 'next/server';
import cowsay from 'cowsay';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body) {
      return NextResponse.json(
        { error: 'Body is required' },
        { status: 400 }
      );
    }

    const message = body?.cowsay;
    const style = body?.style ?? 'default';
    const thinking = body?.thinking ?? false;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const options = {
      text: message,
      ...(style !== 'default' && { f: style }),
    };

    const output = thinking ? cowsay?.think(options) : cowsay?.say(options);
    return NextResponse.json({ output });
  } catch (error) {
    console.error('Error:', error);

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
