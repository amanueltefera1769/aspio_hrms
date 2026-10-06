import Link from "next/link";
export default function NotFound() { return <section className="not-found container"><span className="eyebrow">404 / Page not found</span><h1>Let’s get you<br />back on track.</h1><p>This page may have moved. You can explore Aspio HR from the homepage.</p><Link href="/" className="button">Back to home →</Link></section>; }
