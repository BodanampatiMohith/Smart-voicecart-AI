# SmartCart AI -- Implementation Report

This document describes the features that were built, the design decisions behind them, and the trade-offs made within the eight-hour time budget.

---

## What Was Built

SmartCart AI is a voice-powered grocery shopping assistant. At its core, a user speaks a command in English, Hindi, or Telugu, and the application understands the intent, updates a shopping list, and offers intelligent suggestions for what to buy next.

### The Voice Pipeline

The most challenging part of the project was making voice commands work reliably across three languages. The Web Speech API handles the actual speech-to-text conversion in the browser, which means there is no cost and no API key needed for that stage. The transcript is then sent to the backend where the real language understanding happens.

The backend uses Groq's Llama 3.3 model to parse the transcript into a structured intent. The prompt is carefully designed to handle mixed-language input (for example, someone saying "doodh add karo" which mixes Hindi and English). The model returns a clean JSON object with the action (add, remove, modify, search, or complete), the item name normalized to English, the quantity, and the category.

If the Groq API key is not configured or the service is down, the application falls back to a heuristic parser that uses regex patterns and a bilingual glossary. This fallback handles common cases well enough that the application never appears broken.

### Smart Suggestions

Rather than hardcoding messages like "you might be running low on milk," the suggestion engine actually computes restock recommendations from the user's purchase history. It calculates the average number of days between purchases for each item and flags items where the current gap has exceeded 80% of that average.

For example, if someone has been buying milk every 7 days and it has been 6 days since their last purchase, milk will appear in the suggestions. This is real statistical analysis using pandas, not a canned response.

The substitute recommendations (for example, suggesting almond milk when someone adds regular milk) come from a curated lookup table. This is an intentional design choice. A trained recommendation model would require purchase data from many users, which is not available in a single-user prototype. The README and this document are transparent about this.

### The User Interface

The frontend was designed with a warm, clean e-commerce aesthetic inspired by modern grocery and lifestyle shopping platforms. Key design choices include:

- A scrolling marquee banner at the top with contextual messages about deals and seasonal availability, which gives the application a more complete feel than a bare utility screen.
- Category filter pills that let users quickly narrow their list to specific types of items.
- Cart-style item cards with quantity steppers, category tags, and action buttons for marking items as purchased or removing them.
- A persistent bottom command bar with both text input and a voice button, making the primary interaction always accessible.
- No technical jargon anywhere in the user-facing interface. Terms like "heuristic parser," "LLM," and "FastAPI" appear only in documentation.

---

## Feature Checklist

### Voice Input
- [x] Voice command recognition with real-time transcript display
- [x] Natural language processing for varied phrasing across languages
- [x] Multilingual support: English, Hindi, Telugu
- [x] Heuristic fallback when LLM is unavailable

### Smart Suggestions
- [x] Purchase history-based restock recommendations (computed, not hardcoded)
- [x] Substitute item suggestions from a curated lookup table
- [x] Suggestions refresh automatically after list changes

### Shopping List Management
- [x] Add, remove, and modify items via voice or text
- [x] Automatic item categorization (dairy, produce, snacks, grains, household)
- [x] Quantity parsing from natural language including Hindi and Telugu number words
- [x] Mark items as purchased (archives to history for future suggestions)

### User Interface
- [x] Clean, responsive e-commerce design
- [x] Real-time visual feedback for voice recognition
- [x] Category filtering with interactive pills
- [x] Cart-style list with quantity steppers
- [x] Scrolling marquee banner

### Technical Quality
- [x] TypeScript strict mode throughout the frontend
- [x] Pydantic validation for all API contracts
- [x] Error handling with user-friendly toast notifications
- [x] Database seeding for immediate demonstration
- [x] Production build passes cleanly

---

## Design Decisions and Trade-Offs

### Two-Service Architecture

The application uses a separate React frontend and FastAPI backend rather than a Next.js monolith. This adds deployment complexity (two services instead of one) but keeps the NLP and database logic off the browser, matches common production patterns, and exercises both deployment platforms.

### SQLite as Default Database

SQLite was chosen as the default database to enable zero-configuration local development. A reviewer can clone the repository and run the application without setting up PostgreSQL. The application accepts a `DATABASE_URL` environment variable to switch to PostgreSQL in production.

### Static Substitutes

Substitute recommendations are a static dictionary rather than a machine learning model. This was deliberate. A recommendation model requires training data from many users and purchase sessions. In a single-user prototype, a curated lookup table is more honest and more useful than a poorly-trained model.

### Deferred Features

Several features from the assessment brief were intentionally deferred:

- **Price-range voice filters**: Requires a product catalog with pricing data, which is a separate data ingestion project.
- **Seasonal recommendations**: Would need a calendar-aware dataset of regional produce availability.
- **User authentication**: Adds OAuth complexity without improving the core voice-to-list demonstration.
- **WebSocket real-time sync**: REST with refresh is more reliable on free-tier hosting with sleep cycles.

These deferrals were made to ensure the shipped features work end-to-end rather than building a wider but broken surface area.

---

## Verification

### Automated

- Frontend production build: `npm run build` completes without errors.
- Backend Python compilation: all modules compile without syntax errors.

### Manual Testing

1. Start the backend on port 8001 and frontend on port 5173.
2. Open Chrome at `http://localhost:5173`.
3. Voice test: select English and say "add two bananas." Verify the item appears in the Produce category with quantity 2.
4. Voice test: select Hindi and say "doodh chahiye." Verify "milk" appears in the Dairy category.
5. Voice test: select Telugu and say "biyyam kavali." Verify "rice" appears in the Grains category.
6. Text test: type "remove bananas" and verify the item is removed.
7. Suggestions: verify the panel shows computed suggestions from seeded purchase history.
8. Complete: click the checkmark on an item and verify it moves to history and suggestions refresh.
