# SchoolGPT Context-Aware AI Architecture

## Overview
Transform SchoolGPT from basic RAG to intelligent school operating system assistant.

## Architecture Layers

### 1. Intent Classification Engine
**Purpose:** Classify user queries into 20+ intent categories with confidence scores.

**Intents:**
- Attendance, Homework, Timetable, Exams, Behaviour, Bus, Fees, PTM, Health
- Library, Sports, Events, Announcements, Teacher Workload, General Education
- Small Talk, School Policy, Motivation, Career Guidance, Subject Explanation
- Administrative, Greeting, Unknown

**Implementation:**
- ML-based classification (not keyword matching)
- Multi-label support (queries can have multiple intents)
- Confidence scoring for each intent
- Context-aware (uses conversation history)

### 2. Role Context Engine
**Purpose:** Deep role awareness for personalized responses.

**Roles:**
- Teacher, Parent, Student, Admin, Driver, Gate Staff, Vendor, Principal

**Context per Role:**
- **Teacher:** Their classes, subjects, students, timetable, workload
- **Parent:** Their children, their performance, attendance, fees
- **Student:** Their classes, homework, timetable, clubs, bus
- **Admin:** School-wide metrics, trends, all data
- **Driver:** Their route, stops, students, vehicle
- **Gate Staff:** Visitor logs, entry/exit policies
- **Vendor:** Rewards, inventory, orders
- **Principal:** All admin + strategic insights

### 3. Knowledge Retrieval Layer
**Three-tier retrieval:**

**Tier 1: Live Database (HIGH confidence)**
- Real-time school data from Supabase
- Attendance, homework, grades, timetable, etc.
- Always current, authoritative

**Tier 2: Demo Knowledge Base (MEDIUM confidence)**
- Comprehensive school context
- Policies, procedures, general information
- Static but realistic school data

**Tier 3: General LLM (GENERAL confidence)**
- Educational concepts, teaching strategies
- Subject explanations, career guidance
- Motivation, general knowledge

### 4. Reasoning Layer
**Purpose:** Synthesize data from multiple sources, make inferences.

**Capabilities:**
- Cross-domain reasoning (attendance + grades + behaviour)
- Temporal reasoning (trends over time)
- Comparative analysis (student vs class average)
- Causal inference (why is performance declining?)
- Recommendation generation

### 5. Confidence System
**Scoring:**
- **HIGH (0.8-1.0):** Live database data
- **MEDIUM (0.5-0.8):** Demo knowledge base
- **GENERAL (0.3-0.5):** LLM knowledge
- **LIMITED (0.0-0.3):** Feature not connected

**Usage:**
- Determines response tone (certain vs exploratory)
- Influences suggested actions
- Triggers capability awareness messages

### 6. Conversation Memory System
**Features:**
- Entity tracking (who/what we're discussing)
- Context window management (last 20 messages)
- Reference resolution ("their", "it", "those")
- Topic continuity
- Follow-up detection

### 7. Capability Awareness Layer
**Purpose:** Know what features exist and are accessible.

**Capabilities:**
- Real-time feature availability
- Role-based access rights
- Integration status
- Graceful degradation when features missing

**Response Pattern:**
"I don't currently have access to [feature]. Once [integration] is enabled, I can help with:
• [capability 1]
• [capability 2]
• [capability 3]

Meanwhile, I can help you with [available alternatives]."

### 8. Response Builder
**Components:**
- Natural language generation
- Role-appropriate tone
- Confidence-aware phrasing
- Source attribution
- Suggested actions

**Tone Guidelines:**
- Calm, helpful, professional, empathetic
- Never defensive
- Conversational, not robotic
- Context-aware (teacher vs student)

### 9. Suggested Actions Engine
**Purpose:** Generate contextual follow-up actions.

**Types:**
- Data exploration (show more details)
- Actionable tasks (send message, schedule meeting)
- Comparative analysis (compare with last month)
- Proactive suggestions (based on patterns)

**Max 3 actions**, short and actionable.

## Module Structure

```
lib/schoolgpt/
├── architecture.md              # This file
├── types.ts                     # Type definitions
├── engines/
│   ├── intentClassifier.ts     # Intent classification
│   ├── roleContext.ts          # Role context engine
│   ├── knowledgeRetrieval.ts   # Multi-tier retrieval
│   ├── reasoning.ts            # Reasoning layer
│   ├── confidence.ts           # Confidence scoring
│   ├── conversationMemory.ts   # Memory management
│   ├── capabilityAwareness.ts # Feature awareness
│   └── responseBuilder.ts      # Response construction
├── knowledge/
│   ├── demoKnowledgeBase.ts    # Demo KB data
│   ├── schoolPolicies.ts       # Policy information
│   └── generalKnowledge.ts     # General educational knowledge
├── retrievers/
│   ├── databaseRetrievers.ts   # Live DB retrievers
│   ├── demoRetrievers.ts       # Demo KB retrievers
│   └── generalRetrievers.ts    # LLM-based retrieval
├── prompts/
│   ├── systemPrompts.ts        # Role-specific system prompts
│   └── reasoningPrompts.ts     # Reasoning prompts
└── utils/
    ├── textProcessing.ts       # Text utilities
    ├── entityExtraction.ts     # Entity extraction
    └── referenceResolution.ts  # Pronoun resolution
```

## Performance Considerations

**Optimization Strategies:**
- Parallel retrieval across tiers
- Caching for demo knowledge base
- Streaming responses for long answers
- Request batching for multiple queries
- Context window optimization

**Target Response Times:**
- Simple queries: < 2 seconds
- Complex reasoning: < 5 seconds
- Multi-source synthesis: < 8 seconds

## Schema Additions

**New Tables Needed:**
- `school_knowledge_base` (demo knowledge storage)
- `conversation_memory` (persistent conversation history)
- `intent_logs` (intent classification analytics)
- `feature_capabilities` (feature availability tracking)

**Existing Tables to Enhance:**
- Add more comprehensive demo data to existing tables
- Add indexes for faster retrieval
- Add materialized views for common queries

## Migration Strategy

**Phase 1:** Core engines (Intent, Role, Knowledge Retrieval)
**Phase 2:** Reasoning and Confidence systems
**Phase 3:** Memory and Capability Awareness
**Phase 4:** Demo knowledge base population
**Phase 5:** Testing and refinement
**Phase 6:** Performance optimization

## Backward Compatibility

**Preserve:**
- Existing API endpoints
- Current retriever interface
- Frontend chat component
- Role-based access control

**Enhance:**
- Add new capabilities without breaking existing ones
- Gradual rollout of new features
- Feature flags for experimental features

## Success Metrics

**Qualitative:**
- Natural, contextual responses
- Accurate entity resolution
- Helpful suggested actions
- Graceful handling of missing data

**Quantitative:**
- Intent classification accuracy > 85%
- Response time < 5 seconds (95th percentile)
- User satisfaction > 4/5
- Reduction in "I don't know" responses by 50%
