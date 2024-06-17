import pool from "@/utils/db.js";

export async function GET() {
    try {
        const client = await pool.connect();    
        const result = await client.query('SELECT * FROM home_dormname ORDER BY dorm_name ASC');
        const data = result.rows;
        client.release();

        return Response.json(data)
    } catch (err) {
        console.error("Error fetching data", err);
    }

    return Response.json({ code: 500, message: "Something went wrong." }, { status: 500 })
}