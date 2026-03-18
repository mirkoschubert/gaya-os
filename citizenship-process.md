# CITIZENSHIP-PROCESS.md – Technical Specification

This document describes the technical implementation of the **citizenship application and verification process** for Civitas Gaya, including heuristics against multi‑accounts, integration with Admin and (later) Council workflows, and a debug mode for local/testing environments.

---

## 1. Scope and Goals

- Ensure that **each physical person receives at most one Citizen ID**, in line with the Constitution (one‑person‑one‑vote).  
- Avoid hard identity checks (no ID card uploads), but make **abuse costly and detectable**.
- Treat all technical checks as **heuristics that raise flags**, not as infallible proofs.  
- Support two operation modes:
  - **Production mode**: citizenship applications are serious, manually reviewed, with throttling and checks.  
  - **Debug mode**: relaxed throttling and time‑based constraints for testing with multiple accounts.
- Integrate with existing models: `User`, `AuditLog`, later `Membership` / Councils.

---

## 2. Domain Models

### 2.1 User (existing)

Relevant fields (from the main domain spec):

```prisma
model User {
  id            String      @id @default(cuid())
  email         String      @unique
  passwordHash  String
  displayName   String
  role          UserRole    @default(USER)
  civicStatus   CivicStatus @default(VISITOR)
  citizenId     String?     @unique
  joinedAt      DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // relations
  // ...
}

enum CivicStatus {
  VISITOR
  CITIZEN
}
```

### 2.2 CitizenshipApplication

Each Visitor can have **at most one active application** (PENDING). Applications are kept for audit even after decision.

```prisma
model CitizenshipApplication {
  id             String                @id @default(cuid())
  userId         String                @unique
  realName       String
  country        String
  city           String?
  motivationText String

  status         CitizenshipStatus     @default(PENDING)
  flags          Json?                 // array of string codes with metadata

  reviewerId     String?
  reviewedAt     DateTime?
  reviewComment  String?

  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt

  user           User                  @relation(fields: [userId], references: [id])
  reviewer       User?                 @relation("CitizenshipReviewer", fields: [reviewerId], references: [id])
}

enum CitizenshipStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### 2.3 Technical Source Data (per application)

Minimal approach: log raw technical context in the application record (no separate table unless needed):

```prisma
// Extend CitizenshipApplication
  ipAddress      String?
  userAgent      String?
  fingerprintId  String?   // hash of device/browser fingerprint
  geoCountry     String?   // derived from IP, coarse
```

If needed later, this can be normalised into separate tables (`DeviceFingerprint`, `IpUsage`), but MVP can inline it as above.

### 2.4 UserFlags (optional, but recommended)

Heuristics should also be able to mark **existing Citizens** with flags.

```prisma
model UserFlag {
  id        String   @id @default(cuid())
  userId    String
  code      String   // e.g. "MULTI_ACCOUNT_SUSPECT", "GEO_MISMATCH"
  metadata  Json?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
}
```

Flags are informational but can be used in admin/council UIs and for future rule changes.

---

## 3. Heuristic Flags

### 3.1 Flag Codes

Use string codes to allow evolution without schema changes. Examples:

- `FP_MULTIPLE_APPS_SAME_FINGERPRINT`  – multiple CitizenshipApplications from the same fingerprint.
- `IP_MULTIPLE_APPS_SAME_IP`           – multiple CitizenshipApplications from the same IP in a short window.
- `GEO_COUNTRY_MISMATCH`              – declared country vs IP‑derived country differ significantly.
- `DISPOSABLE_EMAIL_DOMAIN`           – email domain is known disposable provider.
- `SUSPICIOUS_PATTERN`                – generic catch‑all for manual annotations.
- `MANUAL_DEBUG_OVERRIDE`             – explicitly set when debug mode bypasses throttles.

Flags are **never** alleinige Entscheidungsgrundlage – sie sind Signale für Reviewer.

### 3.2 When flags are generated

- **On application creation** (Visitor submits form):
  - Compute fingerprint (if consented / implemented).  
  - Check how many users/applications share that fingerprint/IP.  
  - Check IP‑geo vs declared country.  
  - Check email domain.
  - Attach resulting flags to `CitizenshipApplication.flags` (JSON array).
- **On later logins / scheduled jobs**:
  - Optional: re‑run bestimmte Checks auch für Citizens und erzeugt `UserFlag`‑Einträge.

### 3.3 Flags for existing Citizens

- Heuristiken laufen nicht nur im Antragsprozess, sondern können bei **bestehenden Citizens** zusätzliche `UserFlag`s erzeugen.  
- Beispiel: Wenn nachträglich festgestellt wird, dass fünf Citizen Accounts denselben Fingerprint und fast identische Daten haben, können alle mit `MULTI_ACCOUNT_SUSPECT` markiert werden.

---

## 4. Bürgschaften (Web of Trust) – Vorbereitungen

Bürgschaften werden später umgesetzt, aber es gelten jetzt schon zwei technische Regeln:

1. **Council Members dürfen nicht bürgen**:
   - Wenn Bürgschaftsmodell implementiert wird, muss es eine harte Validierung geben:
     - `guarantorId` darf nicht auf einen User zeigen, der in einer `Membership` mit `role = COUNCIL_MEMBER` ist.
2. Bürgschaften sind immer **limitierte Ressourcen** (z.B. max. N offene Bürgschaften pro Citizen). Details kommen im späteren Law/Spec.

Für den aktuellen Implementierungsschritt reicht ein TODO‑Hinweis und ggf. schon vorbereitete Felder ohne aktive Nutzung.

---

## 5. Operational Modes: Admin vs Council

### 5.1 Phase 1 – Kein (oder unvollständiger) Council

Solange es keinen funktionsfähigen Council gibt (oder zu wenige Citizens), liegt der komplette Review‑Prozess bei `ADMIN`‑Usern:

- Nur `User.role = ADMIN` darf `CitizenshipApplication.status` von `PENDING` auf `APPROVED` oder `REJECTED` setzen.
- Die Review‑UI hängt an der bestehenden Admin User Management‑Sektion (z.B. `/admin/users/citizenship`).
- Reviewer werden in `CitizenshipApplication.reviewerId` gespeichert.

### 5.2 Phase 2 – Council aktiv

Später kann die Berechtigung erweitert werden:

- Zusätzlich zu Admins dürfen bestimmte Ratsmitglieder (z.B. Membership in einer globalen Unit mit `COUNCIL_MEMBER`) Anträge prüfen.  
- Ratsmitglieder **dürfen nicht** als Bürgen fungieren (siehe oben).
- Die Logik bleibt gleich, nur die **Berechtigungsprüfung** für Reviewer erweitert sich.

---

## 6. Debug Mode

### 6.1 Ziel

Der Debug Mode soll es ermöglichen, mit mehreren Test‑Accounts zu arbeiten, ohne dass Throttling und zeitliche Hürden ständig blockieren – **ohne** die Produktionsregeln zu verwässern.

### 6.2 Konfiguration

- Environment Variable, z.B. `CITIZENSHIP_DEBUG=true` oder generischer `APP_DEBUG=true` Flag.  
- Debug Mode **ist nur** in nicht‑produktiven Umgebungen erlaubt (Sicherheitsnetz: z.B. `if (NODE_ENV === 'production') debug = false` erzwingen).

### 6.3 Verhalten im Debug Mode

- **Rate Limits deaktiviert oder stark gelockert**:
  - IP‑ und Fingerprint‑Throttling wird übersprungen.
- **Account Reifezeit deaktiviert**:
  - Besucher können sofort einen Antrag stellen, ohne Mindestwartezeit.
- **Kennzeichnung**:
  - Jede im Debug Mode erstellte `CitizenshipApplication` erhält einen Flag `MANUAL_DEBUG_OVERRIDE` in `flags`.  
  - Optional: `AuditLog`‑Eintrag mit Hinweis auf Debug Mode.
- **Keine automatische Autopromotion in Production**:
  - Kommentare im Code müssen klarstellen, dass Debug Mode nicht versehentlich in Prod aktiv sein darf.

---

## 7. Application Flow (High-Level)

### 7.1 Voraussetzungen (Prod Mode)

- `User.civicStatus = VISITOR`.
- Noch keine existierende CitizenshipApplication mit `status = PENDING` oder `APPROVED` für diesen User.
- Optional: Mindestkontoalter (z.B. X Tage) und/oder Mindestaktivität (z.B. Y Pageviews oder Interaktionen).

### 7.2 UI: Citizenship Application Form

Felder:

- Real name (required, string, 2–120 chars).  
- Country (required, ISO code).  
- City (optional, string).  
- Motivation text (required, z.B. min. 300 chars).  
- Checkbox: "I endorse the Constitution and core values of Civitas Gaya."  

Backend Actions:

1. Check Preconditions (VISITOR, no active application, not throttled – außer im Debug Mode).  
2. Erzeuge `CitizenshipApplication` mit `status = PENDING`.  
3. Erfasse technische Daten: `ipAddress`, `userAgent`, `fingerprintId`, `geoCountry`.  
4. Führe Heuristiken aus, erzeuge Flag‑Codes, speichere in `flags`.  
5. Schreibe `AuditLog`‑Eintrag (`CITIZENSHIP_APPLIED`).

### 7.3 Review UI (Admin / später Council)

List View:

- Tabelle aller `PENDING`‑Anträge mit:
  - realName, email, country, createdAt, Flag‑Count, wichtigste Flags (Badges).  
  - Icon, wenn Debug Override gesetzt ist.

Detail View:

- Antragsdaten (inkl. Motivationstext).  
- Technische Daten (IP, Geo, Fingerprint‑Summary, Anzahl anderer Accounts mit selber IP/Fingerprint).  
- Flags (Lesbare Beschreibungen zu den Codes).

Aktionen:

- **Approve**:
  - Setze `status = APPROVED`, `reviewerId = currentUser.id`, `reviewedAt = now()`.  
  - Generiere `citizenId` (z.B. `CX-YYYY-NNNN`).  
  - Setze `user.civicStatus = CITIZEN`, `user.joinedAt = now()`, `user.citizenId = generatedId`.  
  - `AuditLog`‑Eintrag (`CITIZENSHIP_GRANTED`).
- **Reject**:
  - Setze `status = REJECTED`, `reviewerId`, `reviewedAt`, optional `reviewComment`.  
  - `AuditLog`‑Eintrag (`CITIZENSHIP_REJECTED`).
- **Mark as Suspicious** (optional):
  - Fügt zusätzliche Flag‑Codes wie `SUSPICIOUS_PATTERN` hinzu oder erzeugt `UserFlag`s.

### 7.4 Guards gegen Mehrfachaccounts

Bei jeder neuen Application (und optional regelmäßig für bestehende Citizens):

- Query: Wie viele `CitizenshipApplication`‑Datensätze existieren mit gleicher `ipAddress`/`fingerprintId` in den letzten N Tagen?  
- Query: Wie viele Users mit `civicStatus = CITIZEN` teilen diese Parameter?  
- Je nach Ergebnis: Flags setzen (`FP_MULTIPLE_APPS_SAME_FINGERPRINT`, `IP_MULTIPLE_APPS_SAME_IP`).

**Wichtig**: Kein automatisches Reject, nur Flags + Priorisierung in der Review‑UI.

---

## 8. Missbrauch und Sanktionen (technische Hooks)

Die konkrete rechtliche Ausgestaltung erfolgt im Citizenship & Naturalisation Law. Technisch sollten bereits folgende Hooks vorbereitet werden:

- Möglichkeit, Citizenship zu entziehen:
  - Funktion/Service `revokeCitizenship(userId, reason)` setzt `civicStatus = VISITOR` oder speziellen Status, entfernt/archiviert `citizenId`, schreibt `AuditLog`‑Eintrag und fügt `UserFlag` mit `MULTI_ACCOUNT_CONFIRMED` hinzu.
- Möglichkeit, Accounts global zu sperren:
  - Flag oder Feld `isBanned` am User (oder separate Ban‑Tabelle) mit Gründen und Zeitstempel.
- Blacklist‑Mechanismus:
  - Einfache Tabelle oder Config für geblockte IP‑Ranges, Fingerprints, Domains.

Diese Hooks werden später durch rats-/gesetzesbasierte Entscheidungen genutzt.

---

## 9. Implementation Notes (für Claude Code / Dev‑Assistenten)

- **Trenne Domain‑Logik von UI**:
  - Citizenship‑Services (`applyForCitizenship`, `reviewCitizenshipApplication`, `runCitizenshipHeuristics`) liegen in `lib/domain` oder ähnlicher Schicht.
  - SvelteKit Actions/Endpoints rufen nur diese Services und kümmern sich um Session/Redirects.
- **Keine harten Magic Numbers**:
  - Throttle‑Zeitfenster, Mindestlängen für Motivationstext etc. als Konfiguration (z.B. via `SystemSetting` oder Environment).  
- **Debug Mode klar markieren**:
  - In Code und UI deutlich machen, wenn Debug aktiv ist (z.B. Banner in Admin‑Area), damit es niemals versehentlich in Prod bleibt.
- **Logging/Audit**:
  - Jede Statusänderung (`PENDING` → `APPROVED`/`REJECTED`) und jede Citizenship‑Änderung am User in `AuditLog` schreiben.

Dieses Dokument gilt als technische Referenz für die Implementierung des Citizenship‑Prozesses und kann bei Bedarf erweitert werden, sobald Councils, Bürgschaften und weitere Gesetze umgesetzt werden.