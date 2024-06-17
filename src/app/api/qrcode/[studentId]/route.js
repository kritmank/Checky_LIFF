import { NextResponse } from 'next/server';
import crypto from "crypto";
import qrcode from "qrcode";

function encrypted(studentId) {
    const algorithm = "aes-256-cbc";
	const key = Buffer.from(process.env.CIPHER_KEY, "hex");
	const iv = Buffer.from(process.env.CIPHER_IV, "hex");
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(studentId, "utf8", "hex");
	encrypted += cipher.final("hex");
	return encrypted;
}

export async function GET(request, context) {
    let { studentId } = context.params;
    studentId = studentId.split(".")[0];
    console.log("studentId", studentId);

    const qrData = encrypted(studentId);
    const options = {
        width: 350,
        height: 350,
    }
    try {
        const qr = await qrcode.toBuffer(qrData, options);
        const response = new NextResponse(qr, { status: 200 });
        response.headers.set('Content-Type', 'image/png');
        return response;
    } catch (error) {
        console.error("Error generating QR code:", error);
        return NextResponse.json({ status: 500, message: "Error generating QR code" });
    }
}