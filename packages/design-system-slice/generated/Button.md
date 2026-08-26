# Button

> Generated from `button.contract.json` — do not edit by hand. Run `npm run generate` to refresh.

Interactive control that triggers an action. The single source of truth for Button across every framework tier.

Wraps: React `antd@6` · Vue `ant-design-vue@4`.

## Props

| Prop | Type | Values | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | enum | primary \| default \| dashed \| text \| link | `"default"` | Visual emphasis of the button. |
| `size` | enum | small \| middle \| large | `"middle"` | Control height and padding. |
| `state` | enum | default \| disabled \| loading | `"default"` | Interaction state. Projects to the boolean antd props `disabled` and `loading`. |
| `danger` | boolean | true \| false | `false` | Marks a destructive action. |
| `block` | boolean | true \| false | `false` | Stretches the button to the full width of its container. |
| `icon` | slot | ReactNode (React) / slot (Vue) | `null` | Optional leading icon. React: `icon` prop (ReactNode). Vue: `icon` slot. |

## Design tokens

Consumed live from `@aha/design`:

| Token | Value |
| --- | --- |
| `colorPrimary` | `#6A1EBB` |
| `colorError` | `#F5222D` |
| `colorTextDisabled` | `#B5B5B5` |
| `colorBgFillDisabled` | `#E3E3E3` |
| `borderRadius` | `8` |
| `fontSize` | `14` |
| `fontFamily` | `Plus Jakarta Sans, sans-serif` |
