import { pool } from '@/lib/db';

export async function GET() {
    const [rows] = await pool.query('SELECT * FROM messages ORDER BY id DESC LIMIT 50');
    return Response.json(rows);
}

export async function POST(req) {
    const { name, email, body } = await req.json();
    if (!name || !email || !body) return new Response('Missing', { status: 400 });
    await pool.execute('INSERT INTO messages (name,email,body) VALUES (?,?,?)', [name,email,body]);
    return Response.json({ ok: true }, { status: 201 });
}
