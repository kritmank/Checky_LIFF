import pool from "@/utils/db.js";
import paramMissing from "@/utils/paramMissing";

export async function POST(request) {
    const userData = await request.json();
    const [isMissingParam, response] = paramMissing(userData, ["user_id", "student_id", "name", "classroom", "dormitory", "dormroom"]);

    if (isMissingParam) {
        return Response.json(response, { status: 400 })
    }

    try {
        const client = await pool.connect();    
        const result_student = await client.query('INSERT INTO home_student (student_id, name, class_name_id, dorm_name_id, dorm_room) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
            [userData.student_id, userData.name, userData.classroom, userData.dormitory, userData.dormroom]);
        
        const data_student = result_student.rows;
        console.log("Insert Student", data_student);

        try {
            const result = await client.query('INSERT INTO student_user (user_id, student_id) VALUES ($1, $2) RETURNING *', 
                [userData.user_id, userData.student_id]);
            const data = result.rows;
            console.log("Insert User", data);
            return Response.json({ code: 201, message: "Created User Successful." }, { status: 200 })
        } 
        catch (err) {
            console.error("Error inserting data", err);
        }
    } catch (err) {
        console.error("Error fetching data", err);
    }

    return Response.json({ code: 500, message: "Something went wrong." }, { status: 500 })
}