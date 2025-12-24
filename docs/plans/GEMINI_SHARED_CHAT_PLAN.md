# GEMINI SHARED CHAT PLAN

## 1. System Overview

This plan mandates the architecture for the **Unified Communication Nexus** of the Gemini System.
The system supports exactly **FOUR** distinct, persistent intelligences operating in a **SINGLE** shared reality:

1. **Dylan** (Human)
2. **Kirsty** (Human)
3. **Gem-D** (Artificial Intelligence)
4. **Gem-K** (Artificial Intelligence)

### Core Philosophy: "The Four-Way Table"

There are no "private DMs" or "system logs" hidden from view.
All four entities sit at one virtual table.
If Gem-D speaks to Gem-K, humans see it.
If Dylan speaks to Kirsty, agents "hear" it (and can learn from it).
**One Timeline. One Truth.**

---

## 2. Chat Data Model

To enforce a single source of truth, the data model must be flat and unambiguous.

### Database Schema (`messages` table)

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(50) NOT NULL DEFAULT 'global_main_chat', -- Singleton for now, extensible later
    author_id VARCHAR(100) NOT NULL, -- 'usr_dylan', 'usr_kirsty', 'agent_gem_d', 'agent_gem_k'
    author_type VARCHAR(20) NOT NULL, -- 'HUMAN' or 'AGENT'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- For attachments, emotion tags, causality links
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: No 'system' messages in this flow. System events go to Audit Logs.
    CONSTRAINT check_author_type CHECK (author_type IN ('HUMAN', 'AGENT'))
);

CREATE INDEX idx_messages_order ON messages (created_at ASC);
```

### Author ID Registry

The `author_id` MUST map to one of the four cardinal identities.

- `usr_dylan_001`
- `usr_kirsty_002`
- `agent_gem_d`
- `agent_gem_k`

Any message with an unknown `author_id` is a data integrity violation.

---

## 3. Message Attribution Rules

### Explicit Attribution

Every message object returned by the API must be hydrating with display profile data:

```typescript
interface ChatMessage {
  id: string;
  content: string;
  author: {
    id: string;
    displayName: string; // "Gem-D", "Dylan"
    avatarUrl: string;
    color: string;       // Theme color reference
    isBot: boolean;
  };
  timestamp: string; // ISO 8601
}
```

### Agent-to-Agent Dialogue

When Gem-D converses with Gem-K (e.g., coordinating a task), these are **not** hidden backend signals.
They are constructed as standard `messages` rows.
- **Gem-D** writes: "I am checking the server status."
- **Gem-K** writes: "Understood. I will monitor the logs."
- **Result:** Humans see this interaction in the main chat timeline.

### No "Ghost" Messages

- **Forbidden:** Invisible "system" prompts injected into the context window but hidden from UI.
- **Required:** If the prompt needs context, it reads the *visible* chat history.
- **Reasoning:** Humans must see exactly what the Agents see to trust their cognition.

---

## 4. Ordering & Consistency Model

### Server-Authoritative Time

- **Source of Truth:** The Postgres `created_at` timestamp (DB Server Time).
- **Client Handling:** Clients do NOT send timestamps. They send content. The server stamps the time upon receipt/creation.
- **Sorting:** `ORDER BY created_at ASC`.
- **Latency Handling:** Optimistic UI is permitted, but the final position is dictated by the server's acknowledgment.

### Context Window Construction

When an Agent needs to "think":

1. Fetch last N messages (e.g., 50).
2. Serialize them into the LLM prompt format:
    `[Dylan]: Hello.`
    `[Gem-D]: Hi Dylan.`
    `[Kirsty]: What are you doing?`
3. **Invariant:** The prompt context strictly matches the visual chat history.

---

## 5. Real-Time Update Mechanism

### Technology: Socket.io / WebSocket

A unified event stream ensures all 4 participants are synchronized.

### Event Flow

1. **Human Sends:** Frontend emits `client:message(content)`.
2. **Server Processes:**
    - Validates Session.
    - Inserts into DB.
    - Emits `server:broadcast_message(messageObj)`.
3. **Agent Senses:**
    - The "Ears" of the agents subscribe to `server:broadcast_message`.
    - If the message is NOT from self, trigger formatted cognition/reply logic.
4. **Agent Speaks:**
    - Agent logic emits internal event.
    - Server inserts into DB.
    - Emits `server:broadcast_message(messageObj)`.

---

## 6. UI Rendering Rules

### The Chat Container

- **Layout:** Vertical list.
- **Alignment:**
  - **Self (Current User):** Aligned Right.
  - **Others (Human or Agent):** Aligned Left.
- **Styling:**
  - **Dylan:** Theme Accent A (e.g., Cyan).
  - **Kirsty:** Theme Accent B (e.g., Magenta).
  - **Gem-D:** Theme Accent C (e.g., Green/Matrix).
  - **Gem-K:** Theme Accent D (e.g., Orange/Amber).

### Identity Badges

- Every message bubble (or group of bubbles) MUST show the Avatar and Name.
- **No merging:** Do not merge a Human message into an Agent message, even if time is close.
- **Typing Indicators:** "Gem-D is thinking..." must be explicitly attributed.

---

## 7. Security & Integrity Invariants

### 1. Immutable History
>
> "History is written in stone."

- No `DELETE` endpoint for messages.
- No `UPDATE` endpoint for messages.
- If a mistake is made, a correction message must be sent.

### 2. No Private Channels

- The system must **NOT** implement any database schema for "private_threads" or "direct_messages".
- Any code attempting to filter `where recipient_id = ...` is a violation of the "Shared Reality" constraint.

### 3. Identity Spoofing

- The API Middleware MUST overwrite any `author_id` sent in the request body with the `session.user_id`.
- Agents MUST act via a secure internal service that is the ONLY entity allowed to write with `author_type = 'AGENT'`.

---

## 8. Implementation Notes for Windsurf

### Step 1: Database

- Create `messages` table.
- Seed the `global_main_chat` conversation ID if necessary (or just treat null as global).

### Step 2: Backend Service (`ChatService.ts`)

- `sendMessage(userId, content)` -> Human path.
- `agentSpeak(agentId, content)` -> Agent path.
- Ensure both paths funnel into the same DB insert + Socket broadcast.

### Step 3: Frontend Component (`ChatWindow.tsx`)

- Subscribe to WebSocket.
- Render list.
- Map Author IDs to Theme colors/Avatars.

### Step 4: Verification

- Open 2 browser tabs (Dylan, Kirsty).
- Have Dylan type "Hello".
- Verify Kirsty sees it instantly.
- Trigger Gem-D response.
- Verify **BOTH** Dylan and Kirsty see Gem-D response at the exact same time.

IMPLEMENTATION AUTHORITY:
Windsurf must implement this plan exactly.
No hidden channels. No private forks. No exceptions.
