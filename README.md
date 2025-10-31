# Climate Charts Architecture

This repository demonstrates the evolution from bulky, hard-to-maintain chart components to a scalable, modular architecture for 7 chart types.

Includes two examples: **Hydropost Chart** and **Meteopost Archive Chart**.

### Evolution: 3 Key Stages

**Stage 1 – [Initial bulky components](https://github.com/damir-frontend/climate-charts-architecture/commit/61147316468db19253495654f0f998eddd6673e1)**

- All chart logic (data processing, scales, labels, rendering) was inside large monolithic components.
- Hard to maintain, extend, or test.

**Stage 2 – [Logic moved to hooks](https://github.com/damir-frontend/climate-charts-architecture/commit/7a555386fe3e04a5c0893047e523ff7b79d46aea)**

- Separated data processing, scales, labels, and CSV download into custom hooks.
- Components slimmed down to orchestration and rendering.
- Standardized patterns for chart state and metrics.

**Stage 3 – [Final scalable architecture](https://github.com/damir-frontend/climate-charts-architecture/commit/e422b71c457bdcdd5d12a725a67843ccabad60a2)**

- Unified hooks across all charts, fully modular and reusable.
- Centralized metrics, axes, and labels definitions.
- New charts can be added with minimal boilerplate.
- Faster development and reduced technical debt.

**Impact:**

- Scalable architecture supporting 7 chart types.
- Faster rollout of new visualizations.
- Maintainable, consistent, and testable codebase.
