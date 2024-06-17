import { NextResponse } from 'next/server';
import pool from "@/utils/db";

const MessagingApiClient =
	require("@line/bot-sdk").messagingApi.MessagingApiClient;

const client = new MessagingApiClient({
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});


async function getProfile(line_id) {
	try {
		const profile = await client.getProfile(line_id);
		return profile;
	} catch (err) {
		console.log("Error", err.statusCode);
	}
	return false;
}

function sendFlexMsg(line_id, flex_msg) {
	client.pushMessage({
		to: line_id,
		messages: [
			{
				type: "flex",
				altText: "Flex Message",
				contents: flex_msg,
			},
		],
	}).then((res) => {}).catch((err) => {
		console.log("Error", err);
	});
}

function reply(reply_token, msg) {
	client.replyMessage({
		replyToken: reply_token,
		messages: [
			{
				type: "text",
				text: msg,
			},
		],
	});
}

export async function POST(request) {
    const reqData = await request.json();
    const { events } = reqData;

    // No event
	if (events.length == 0) {
		return new NextResponse({ status: 200 });
	}

    const event = events[0];

    // Check if event is message
	if (event.type == "message" && event.message.type == "text") {
		const message = event.message.text;

        if (message != "Profile") {
            reply(event.replyToken, "ไม่รองรับข้อความประเภทนี้ 🙏🏻\nกรุณาเลือกเมนูด้านล่าง📌");
            return new NextResponse({ status: 200 });
        }
        
        // Get User Profile
		const hostname = process.env.HOSTNAME;
        const profile = await getProfile(event.source.userId);

        // Get student info
        const client = await pool.connect();
        const result = await client.query(`
            SELECT s.student_id, s.name, s.class_name_id as class_name, s.dorm_name_id as dorm_name, s.dorm_room
            FROM student_user as u LEFT JOIN home_student as s ON u.student_id = s.student_id
            WHERE u.user_id = $1`
        , [event.source.userId]);

        const data = result.rows;
        client.release();

        if (data.length == 0) {
            reply(event.replyToken, "-- ไม่พบข้อมูล --\n\nกรุณากด\n*Register*\n\nเพื่อลงทะเบียน 🔻");
            return new NextResponse({ status: 200 });
        }

        const student = data[0];
		const qrcode_url = hostname + "/api/qrcode/" + student.student_id;

		// Fetch Flex Message JSON
        let flexMsg;
        try {
            const res = await fetch("https://pbl.kritmank-domain.pw/flex_msg.json");
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            flexMsg = await res.json();
        } catch (err) {
            console.error('Error fetching flex_msg.json:', err);
            return new NextResponse({ status: 500, statusText: 'Error fetching flex message' });
        }

        // Config Flex Message
        flexMsg.body.contents[0].contents[0].contents[0].url = profile.pictureUrl;
        flexMsg.body.contents[0].contents[1].contents[0].text = profile.displayName;
        flexMsg.body.contents[0].contents[1].contents[1].text = student.student_id;
        flexMsg.footer.contents[1].contents[1].text = student.name;
        flexMsg.footer.contents[2].contents[1].text = student.class_name;
        flexMsg.footer.contents[3].contents[1].text = `${student.dorm_name}-${student.dorm_room}`;
        flexMsg.footer.contents[4].contents[0].url = qrcode_url;

        sendFlexMsg(event.source.userId, flexMsg);
	}
    else {
        reply(event.replyToken, "ไม่รองรับข้อความประเภทนี้ 🙏🏻");
    }
	return new NextResponse({ status: 200 });
}