# AI Usage and Originality Statement

## Overview
This document outlines the usage of Artificial Intelligence tooling during the development of this Inventory Management System, in accordance with disclosure requirements.

## AI Tools Used
During the development lifecycle, AI developer assistance tools (specifically Google DeepMind's Antigravity assistant) were utilized. The AI acted as a pair-programmer, aiding in generating boilerplate, assisting with architecture decisions, generating schema files, and helping troubleshoot coding errors.

## Areas of AI Contribution

### 1. Code Scaffold & Boilerplate
AI tools were used to quickly scaffold standard Laravel elements, including:
- Migrations (`make:migration`)
- Controllers
- Eloquent Models 
This accelerated development by bypassing mundane syntax typing.

### 2. Feature Implementation
Concepts such as pessimistic locking (`lockForUpdate()`) and database transactions for handling race conditions were implemented directly with AI assistance, ensuring best-practice solutions were applied to known computer science problems.

### 3. Documentation Generation
The AI generated structural documentation such as the `database_schema.md` (which included a Mermaid ER diagram) and formatting project readmes.

## Originality and Verification
Despite the substantial efficiency boost provided by AI assistance, the project logic, domain design, and architectural flow remain conceptually original to the project requirements. 

- **Architectural Guidance**: The human developer steered the overarching system design (e.g., deciding the decoupling of React and Laravel, determining the entities like "Cupboards", "Places", and "Items" and their relationships).
- **Code Review & Verification**: Every block of code generated or suggested by the AI was independently analyzed, accepted, tested, and integrated by the human developer to ensure it fit the actual business logic of the inventory system. No code was deployed unverified.
- **Problem Solving**: The AI acts as a sophisticated, syntax-aware tutor and auto-completer, but the core problem definitions, requirements mapping, and final product compilation represent an original solution crafted by the developer.

This balanced approach—utilizing AI for rapid implementation while retaining human oversight of architecture and business logic—is highly representative of modern software engineering practices.
