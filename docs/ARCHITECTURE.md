# Architecture

A2Z FORGE separates deterministic coordination from model judgment.

## Control plane

The strict TypeScript core defines Zod-validated project, task, agent, evidence, finding, usage, and journal schemas. `StateStore` writes snapshots through a randomized temporary file, file sync, atomic rename, and directory sync. Journal writers coordinate through an atomic lock directory and tolerate only a torn final line.

Recovery validates the snapshot, replays later state-changing events, reconciles the journal sequence, writes a new atomic snapshot, and records recovery. It never deletes or overwrites unrelated source work.

## Task plane

`TaskGraph` rejects missing dependencies, self-dependencies, and cycles. It exposes ready work, blocked work, and a usage-weighted critical path. `Scheduler` limits concurrency, prefers critical work, respects capability matching, and preserves configured reserve capacity.

`Orchestrator` connects the registry, scheduler, and adapter lifecycle. The common adapter contract covers availability, start, status, result, stop, and resume. Task packets carry only relevant files, constraints, acceptance criteria, outputs, deadline, and usage boundary.

## Evidence plane

Research records retain source, retrieval date, observation, confidence, classification, supported decision, staleness, and license. License reuse fails closed for unknown or unlicensed code. Findings require reproducible evidence and only high-confidence high-severity open findings block release.

Release gates cannot pass without evidence. Waivers are explicit and remain visible in the release decision.

## Runtime wrappers

The Claude plugin uses official marketplace, skill, agent, hook, and configuration schemas. Plugin state lives in the managed product, never the ephemeral plugin cache. Other agents use the same core through thin adapters so provider formats do not leak into product state.
