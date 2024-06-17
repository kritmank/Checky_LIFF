import pool from "@/utils/db.js";
import paramMissing from "@/utils/paramMissing";

export async function POST(request) {
    const userData = await request.json();
    const [isMissingParam, response] = paramMissing(userData, ["user_id", "student_id"]);

    if (isMissingParam) {
        return Response.json(response, { status: 400 })
    }

    try {
        const client = await pool.connect();    
        let result = await client.query('SELECT * FROM home_student WHERE student_id = $1', [userData.student_id]);
        let data = result.rows;
        
        if (data.length === 0) {
            client.release();
            return Response.json({ code: 404, message: "Student not found" }, { status: 404 })
        }
        
        try {
            result = await client.query('INSERT INTO student_user (user_id, student_id) VALUES ($1, $2) RETURNING *', 
                [userData.user_id, userData.student_id]);

            data = result.rows;
            console.log("Insert User", data);
            client.release();
            return Response.json({ code: 201, message: "Created User Successful." }, { status: 200 })
        } 
        catch (err) {
            console.error("Error inserting data", err);
            return Response.json({ code: 500, message: "Something went wrong." }, { status: 500 })
        }
    } catch (err) {
        console.error("Error fetching data", err);
    }

    return Response.json({ code: 500, message: "Something went wrong." }, { status: 500 })
}