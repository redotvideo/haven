import {Resend} from "resend";

const resend = new Resend(process.env.RESEND_KEY);

async function sendMail(to: string, subject: string, html: string) {
	return resend.emails.send({
		from: "do-reply@haven.run",
		to,
		subject,
		html,
	});
}

export async function sendVerifyEmail(email: string, url: string) {
	const message = `Someone is trying to log into <a href="https://haven.run">Haven</a> using your email address. If it's you, click <a href="${url}">here</a>. If not, you can safely ignore this email or respond to let us know.`;
	await sendMail(email, "Log in to Haven", message);
}
