import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getSql } from '@/lib/db/neon';

const config = {
  version: '1.0.0',
};

// Types for database records
interface SaveRecord {
  id: number;
  user_id: string;
  slot: number;
  save_data: unknown;
  playtime: number;
  created_at: string;
  updated_at: string;
}

interface GlobalDataRecord {
  key: string;
  value: unknown;
  updated_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  const session = await getServerSession();
  const pathSegments = params.path || [];
  const endpoint = pathSegments.join('/');

  switch (endpoint) {
    case 'session':
      return NextResponse.json({
        authenticated: !!session,
        user: session?.user
          ? {
              name: session.user.name,
              image: session.user.image,
            }
          : null,
      });

    case 'config':
      return NextResponse.json({
        ...config,
        serverTime: new Date().toISOString(),
      });

    case 'ping':
      return NextResponse.json({ pong: true, timestamp: Date.now() });

    case 'saves': {
      // List all saves for the user
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      try {
        const sql = getSql();
        const saves = await sql`
          SELECT slot, playtime, updated_at
          FROM rpg_saves
          WHERE user_id = ${session.user.email}
          ORDER BY slot
        ` as SaveRecord[];
        return NextResponse.json({ saves });
      } catch (error) {
        console.error('[RPG API] Error listing saves:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    }

    case 'global': {
      // Get global game data by key
      const key = request.nextUrl.searchParams.get('key');
      if (!key) {
        return NextResponse.json(
          { error: 'Key parameter required' },
          { status: 400 }
        );
      }

      try {
        const sql = getSql();
        const results = await sql`
          SELECT value FROM rpg_global_data WHERE key = ${key}
        ` as GlobalDataRecord[];
        const data = results[0];
        return NextResponse.json({
          key,
          value: data?.value || null,
        });
      } catch (error) {
        console.error('[RPG API] Error getting global data:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    }

    default:
      return NextResponse.json(
        { error: 'Endpoint not found', endpoint },
        { status: 404 }
      );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  const session = await getServerSession();
  const pathSegments = params.path || [];
  const endpoint = pathSegments.join('/');

  // Require authentication for POST requests
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const userId = session.user.email;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  switch (endpoint) {
    case 'save': {
      // Save player data
      const { slot = 1, data, playtime = 0 } = body;

      if (!data) {
        return NextResponse.json(
          { error: 'Save data required' },
          { status: 400 }
        );
      }

      try {
        const sql = getSql();
        const saveData = JSON.stringify(data);
        await sql`
          INSERT INTO rpg_saves (user_id, slot, save_data, playtime, updated_at)
          VALUES (${userId}, ${slot}, ${saveData}, ${playtime}, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id, slot)
          DO UPDATE SET save_data = ${saveData}, playtime = ${playtime}, updated_at = CURRENT_TIMESTAMP
        `;

        return NextResponse.json({
          success: true,
          message: 'Data saved',
          slot,
          savedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[RPG API] Error saving:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    }

    case 'load': {
      // Load player data
      const { slot = 1 } = body;

      try {
        const sql = getSql();
        const results = await sql`
          SELECT save_data, playtime, updated_at
          FROM rpg_saves
          WHERE user_id = ${userId} AND slot = ${slot}
        ` as SaveRecord[];
        const save = results[0];

        if (!save) {
          return NextResponse.json({
            success: true,
            data: null,
            message: 'No save found',
          });
        }

        return NextResponse.json({
          success: true,
          data: save.save_data,
          playtime: save.playtime,
          savedAt: save.updated_at,
        });
      } catch (error) {
        console.error('[RPG API] Error loading:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    }

    case 'delete': {
      // Delete a save slot
      const { slot = 1 } = body;

      try {
        const sql = getSql();
        await sql`
          DELETE FROM rpg_saves WHERE user_id = ${userId} AND slot = ${slot}
        `;

        return NextResponse.json({
          success: true,
          message: 'Save deleted',
          slot,
        });
      } catch (error) {
        console.error('[RPG API] Error deleting save:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    }

    case 'event': {
      // Log a game event
      const { type, data: eventData } = body;

      if (!type) {
        return NextResponse.json(
          { error: 'Event type required' },
          { status: 400 }
        );
      }

      try {
        const sql = getSql();
        const eventJson = eventData ? JSON.stringify(eventData) : null;
        await sql`
          INSERT INTO rpg_events (user_id, event_type, event_data)
          VALUES (${userId}, ${type}, ${eventJson})
        `;

        return NextResponse.json({ logged: true });
      } catch (error) {
        console.error('[RPG API] Error logging event:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    }

    case 'global': {
      // Set global game data (could restrict this to admins)
      const { key, value } = body;

      if (!key) {
        return NextResponse.json(
          { error: 'Key required' },
          { status: 400 }
        );
      }

      try {
        const sql = getSql();
        const valueJson = JSON.stringify(value);
        await sql`
          INSERT INTO rpg_global_data (key, value, updated_at)
          VALUES (${key}, ${valueJson}, CURRENT_TIMESTAMP)
          ON CONFLICT (key)
          DO UPDATE SET value = ${valueJson}, updated_at = CURRENT_TIMESTAMP
        `;

        return NextResponse.json({
          success: true,
          key,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[RPG API] Error setting global data:', error);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }
    }

    default:
      return NextResponse.json(
        { error: 'Endpoint not found', endpoint },
        { status: 404 }
      );
  }
}
