const API_BASE = "http://localhost:8000";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/login.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getGlobalMessages() {
  const res = await fetch(`${API_BASE}/get_messages.php`);
  return res.json();
}

export async function sendGlobalMessage(user_id: string, content: string) {
  const res = await fetch(`${API_BASE}/send_message.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id, content }),
  });
  return res.json();
}
