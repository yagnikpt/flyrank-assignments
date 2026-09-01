import { NextResponse } from "next/server";

export function GET() {
	return NextResponse.json({
		message: "Welcome stranger! This info is public.",
	});
}
