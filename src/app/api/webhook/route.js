import { NextResponse } from 'next/server';
import pool from "@/utils/db";

const MessagingApiClient =
	require("@line/bot-sdk").messagingApi.MessagingApiClient;

const client = new MessagingApiClient({
	channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

const flexMsg = {
	type: "bubble",
	body: {
		type: "box",
		layout: "vertical",
		contents: [
			{
				type: "box",
				layout: "horizontal",
				contents: [
					{
						type: "box",
						layout: "vertical",
						contents: [
							{
								type: "image",
								url: "https://htmlcolorcodes.com/assets/images/colors/gray-color-solid-background-1920x1080.png",
								aspectMode: "cover",
								size: "full",
							},
						],
						cornerRadius: "100px",
						width: "90px",
						height: "90px",
					},
					{
						type: "box",
						layout: "vertical",
						contents: [
							{
								type: "text",
								text: "null",
								size: "md",
								margin: "md",
								weight: "bold",
							},
							{
								type: "text",
								text: "64991032",
								margin: "md",
							},
						],
						alignItems: "flex-start",
						justifyContent: "center",
					},
				],
				spacing: "xl",
				paddingAll: "20px",
				background: {
					type: "linearGradient",
					angle: "85deg",
					startColor: "#fbc4ab",
					endColor: "#a3cef1",
				},
			},
			{
				type: "box",
				layout: "vertical",
				contents: [
					{
						type: "text",
						text: "Information",
						margin: "none",
						size: "lg",
						weight: "bold",
						align: "start",
						wrap: false,
						offsetBottom: "md",
					},
					{
						type: "box",
						layout: "baseline",
						contents: [
							{
								type: "text",
								text: "Name",
								color: "#aaaaaa",
								size: "sm",
								flex: 1,
							},
							{
								type: "text",
								text: "null",
								size: "sm",
								flex: 3,
							},
						],
						margin: "lg",
						offsetStart: "sm",
					},
					{
						type: "box",
						layout: "baseline",
						contents: [
							{
								type: "text",
								text: "Class",
								color: "#aaaaaa",
								size: "sm",
								flex: 1,
							},
							{
								type: "text",
								text: "null",
								size: "sm",
								flex: 3,
							},
						],
						margin: "lg",
						offsetStart: "sm",
					},
					{
						type: "box",
						layout: "baseline",
						contents: [
							{
								type: "text",
								text: "Dorm",
								color: "#aaaaaa",
								size: "sm",
								flex: 1,
							},
							{
								type: "text",
								text: "null",
								size: "sm",
								flex: 3,
							},
						],
						margin: "lg",
						offsetStart: "sm",
					},
				],
				paddingAll: "20px",
			},
			{
				type: "box",
				layout: "horizontal",
				contents: [
					{
						type: "box",
						layout: "vertical",
						contents: [
							{
								type: "image",
								url: "",
								size: "full",
							},
						],
						width: "180px",
						height: "180px",
						justifyContent: "center",
					},
				],
				justifyContent: "center",
                paddingBottom: "xxl",
			},
		],
		paddingAll: "0px",
	},
};

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
            reply(event.replyToken, "-- ไม่พบข้อมูล --\n\nกรุณากด\n*Check Attendance*\n\nเพื่อลงทะเบียน 🔻");
            return new NextResponse({ status: 200 });
        }

        const student = data[0];
		const qrcode_url = hostname + "/api/qrcode/" + student.student_id + ".png";
		console.log("QR Code:", qrcode_url);

        // Config Flex Message
        flexMsg.body.contents[0].contents[0].contents[0].url = profile.pictureUrl;
        flexMsg.body.contents[0].contents[1].contents[0].text = profile.displayName;
        flexMsg.body.contents[0].contents[1].contents[1].text = student.student_id;
        flexMsg.body.contents[1].contents[1].contents[1].text = student.name;
        flexMsg.body.contents[1].contents[2].contents[1].text = student.class_name;
        flexMsg.body.contents[1].contents[3].contents[1].text = `${student.dorm_name}-${student.dorm_room}`;
        flexMsg.body.contents[2].contents[0].contents[0].url = qrcode_url;

        sendFlexMsg(event.source.userId, flexMsg);
	}
    else {
        reply(event.replyToken, "ไม่รองรับข้อความประเภทนี้ 🙏🏻");
    }
	return new NextResponse({ status: 200 });
}