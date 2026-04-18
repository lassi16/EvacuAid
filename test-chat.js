const testChat = async () => {
  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: "hi" }] })
  })
  const text = await response.text()
  console.log("Status:", response.status)
  console.log("Body:", text)
}

testChat().catch(console.error)
