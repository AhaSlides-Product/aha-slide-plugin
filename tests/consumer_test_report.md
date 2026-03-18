# Consumer Test Failure Report

This report details the failures identified during the consumer test run for the `@aha/ui` package. These failures point to specific inconsistencies or bugs in the source code.

## Summary of Results

- **Test Files**: 1 failed | 14 passed
- **Total Tests**: 2 failed | 145 passed

---

## Failure 1: Presenter Color Palette Naming Mismatch

### Details
- **Test File**: `tests/consumer/ui/composables.test.ts`
- **Test Case**: `@aha/ui - Composables > usePresenterPlugin > should return reactive refs from xprops`
- **Error**: `AssertionError: expected undefined to deeply equal { '#ff0000': '#00ff00' }`

### Root Cause
There is a naming mismatch between the Zoid component's property definition and the hook's implementation.
- **Zoid Definition**: [packages/ui/src/zoid/presenter.ts:L128](file:///home/amber/workspaces/ahaslides/aha-slide-plugin/packages/ui/src/zoid/presenter.ts#L128) defines the prop as `presentationAttributeColorPalette`.
- **Hook Access (Base)**: [packages/ui/src/zoid/base.ts:L276](file:///home/amber/workspaces/ahaslides/aha-slide-plugin/packages/ui/src/zoid/base.ts#L276) in `useBaseSlidePlugin` looks for `presentationColorPalette`.
- **Hook Retrieval**: [packages/ui/src/zoid/presenter.ts:L309](file:///home/amber/workspaces/ahaslides/aha-slide-plugin/packages/ui/src/zoid/presenter.ts#L309) in `usePresenterPlugin` returns `baseHook.presentationColorPaletteProps`.

Because the Zoid component uses the "Attribute" version of the name but the hook uses the "Base" version, the data is never passed to the reactive ref.

---

## Failure 2: Audience Teamplay Property Casing Inconsistency

### Details
- **Test File**: `tests/consumer/ui/composables.test.ts`
- **Test Case**: `@aha/ui - Composables > useAudiencePlugin > should return base refs and audience-specific refs`
- **Error**: `AssertionError: expected undefined to deeply equal { score: 100 }`

### Root Cause
There is a casing inconsistency for the `teamplay` property in the Audience plugin compared to the Presenter plugin.
- **Presenter (Correct)**: [packages/ui/src/zoid/presenter.ts:L31](file:///home/amber/workspaces/ahaslides/aha-slide-plugin/packages/ui/src/zoid/presenter.ts#L31) uses `teamplay` (lowercase 'p').
- **Audience (Incorrect)**: [packages/ui/src/zoid/audience.ts:L16](file:///home/amber/workspaces/ahaslides/aha-slide-plugin/packages/ui/src/zoid/audience.ts#L16) uses `teamPlay` (PascalCase 'P').
- **Base Hook Logic**: [packages/ui/src/zoid/base.ts:L296](file:///home/amber/workspaces/ahaslides/aha-slide-plugin/packages/ui/src/zoid/base.ts#L296) handles property updates but doesn't reconcile this casing difference, leading to `undefined` when the test (or consumer) expects `teamplay`.

---

## Recommendations for Fix

1.  **Presenter Palette**: Consolidate the property name to `presentationColorPalette` in `PresenterSlidePluginIframe` at [packages/ui/src/zoid/presenter.ts:L128](file:///home/amber/workspaces/ahaslides/aha-slide-plugin/packages/ui/src/zoid/presenter.ts#L128).
2.  **Audience Teamplay**: Rename `teamPlay` to `teamplay` in `AudienceSlidePluginProps` at [packages/ui/src/zoid/audience.ts:L16](file:///home/amber/workspaces/ahaslides/aha-slide-plugin/packages/ui/src/zoid/audience.ts#L16) to match the Presenter plugin and common conventions.
