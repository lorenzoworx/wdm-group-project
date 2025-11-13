import { useEffect, useState } from "react";
import { getMessages, saveMessage } from "./api/messages";

export default function MessageBoard() {
    const [rows, setRows] = useState([]);
    const [form, setForm] = useState({ name: "", email: "", body: "" });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const data = await getMessages();
                setRows(data);
            } catch (e) {
                setError(e.message || "Failed to load");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function onSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await saveMessage(form);
            setForm({ name: "", email: "", body: "" });
            // refresh list
            const data = await getMessages();
            setRows(data);
        } catch (e) {
            setError(e.message || "Failed to save");
        } finally {
            setSubmitting(false);
        }
    }

    const fmt = (ts) => {
        // Firestore Timestamp => Date string
        if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleString();
        return "";
    };

    return (
        <div style={{ maxWidth: 640, margin: "2rem auto", padding: 16 }}>
            <h1>Messages</h1>

            <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
                <input
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    style={{ display: "block", width: "100%", marginBottom: 8 }}
                />
                <input
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    style={{ display: "block", width: "100%", marginBottom: 8 }}
                />
                <textarea
                    placeholder="Message"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    required
                    rows={3}
                    style={{ display: "block", width: "100%", marginBottom: 8 }}
                />
                <button disabled={submitting}>{submitting ? "Saving..." : "Send"}</button>
            </form>

            {error && <p style={{ color: "crimson" }}>{error}</p>}
            {loading ? <p>Loading…</p> : null}

            <ul>
                {rows.map(r => (
                    <li key={r.id} style={{ marginBottom: 12 }}>
                        <strong>{r.name}</strong> ({r.email}) — {r.body}
                        <div style={{ fontSize: 12, color: "#666" }}>{fmt(r.createdAt)}</div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
