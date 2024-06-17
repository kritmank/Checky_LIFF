import pool from "@/utils/db.js";
import paramMissing from "@/utils/paramMissing";

export async function POST(request) {
    const userData = await request.json();
    const [isMissingParam, response] = paramMissing(userData, ["user_id"]);    

    if (isMissingParam) {
        return Response.json(response, { status: 400 })
    }

    try {
        const client = await pool.connect();    
        const result = await client.query('SELECT * FROM student_user WHERE user_id = $1', [userData.user_id]);
        const data = result.rows;
        client.release();

        if (data.length === 0) {
            return Response.json({ code: 404, message: "User not found" }, { status: 404 })
        }
        return Response.json({ code: 200, message: "User found", studentId: data[0].student_id }, { status: 200 })
    } 
    catch (err) {
        console.error("Error fetching data", err);
    }

    return Response.json({ code: 500, message: "Something went wrong." }, { status: 500 })
}