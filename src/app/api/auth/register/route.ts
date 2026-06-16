import { NextResponse } from "next/server";
import { createUser } from "@/services/userService";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    const user = await createUser(name, email, password);
    await sendWelcomeEmail(user.name, user.email).catch(() => {});
    return NextResponse.json({ id: user.id, name: user.name, email: user.email });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
