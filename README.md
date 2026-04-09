# 🧠 AI Critic Agent

An intelligent, multi-agent AI system that provides **brutally honest feedback** on blogs, research papers, and code — with contextual understanding and actionable improvements.

---

## 🚀 Overview

AI Critic Agent is designed to go beyond generic AI responses.
Instead of sugarcoating, it behaves like a **strict reviewer**, identifying:

* Critical flaws
* Weak reasoning
* Missing elements
* Structural issues

It also adapts to user intent — switching between:

* 🔍 **Critique mode** (harsh feedback)
* 🛠️ **Improve mode** (fixes and suggestions)

---

## 🔥 Key Features

### 🧩 Multi-Agent Architecture

* **Structure Critic** → organization & flow
* **Logic Critic** → correctness & reasoning
* **Depth Critic** → quality & technical depth
* **Meta-Critic** → merges & prioritizes feedback

---

### 🧠 Context-Aware Conversations

* Remembers previous messages
* Understands follow-up queries like:

  > “Improve this” or “Why is this weak?”

---

### 🎯 Intent Detection

Automatically detects:

* **critique** → review & point mistakes
* **improve** → suggest fixes & enhancements

---

### 💬 Conversation System

* Multiple chat sessions
* Resume past conversations
* Context carried across messages

---

### ⚡ Clean Frontend

* Chat-based UI (HTML, CSS, JS)
* Sidebar with conversations
* Real-time interaction with backend

---

## 🏗️ System Architecture

```
Frontend (HTML/CSS/JS)
        ↓
FastAPI Backend
        ↓
Conversation Manager (SQLite)
        ↓
LangGraph Pipeline
        ↓
[Router → Multi Critics → Meta-Critic]
        ↓
Final Response
```

---

## 🛠️ Tech Stack

* **Backend:** FastAPI
* **AI Orchestration:** LangGraph
* **LLM Integration:** LangChain
* **Model:** Claude (Anthropic)
* **Database:** SQLite
* **Frontend:** HTML, CSS, Vanilla JS

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-critic-agent.git
cd ai-critic-agent
```

---

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Set your API key:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

Run server:

```bash
uvicorn main:app --reload
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
python -m http.server 5500
```

Open in browser:

```
http://127.0.0.1:5500
```

---

## 🔌 API Endpoints

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/conversation`      | Create new conversation |
| GET    | `/conversations`     | List all conversations  |
| GET    | `/conversation/{id}` | Get chat history        |
| POST   | `/analyze`           | Analyze input           |

---

## 🧪 Example Use Cases

### 🔍 Critique Mode

```
Here is my blog on AI...
```

→ Returns harsh, structured feedback

---

### 🛠️ Improve Mode

```
Can you improve this blog?
```

→ Provides fixes and better version

---

### 🧠 Context Awareness

```
Why is my introduction weak?
```

→ Refers to previous conversation

---

## 💡 What Makes This Different?

Unlike typical AI tools:

* ❌ No generic praise
* ❌ No vague suggestions
* ✅ Direct, actionable critique
* ✅ Multi-agent reasoning
* ✅ Context-aware intelligence

---

## 🚀 Future Improvements

* 📊 Scoring system (clarity, logic, depth)
* 🧠 Pattern detection (user mistakes over time)
* ⚡ Streaming responses
* 🌐 Deployment (cloud hosting)
* 🔐 User authentication

---

## 🤝 Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Built with focus on **real-world AI system design** and practical usability.
