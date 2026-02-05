[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / BaseSlidePluginReturn

# Interface: BaseSlidePluginReturn

Defined in: [packages/ui/src/zoid/base.ts:212](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L212)

Common return type for slide plugin hooks.

## Properties

### audienceSendCountingUniqueAction

> **audienceSendCountingUniqueAction**: (`payload?`) => `Promise`\<`any`\> \| `undefined`

Defined in: [packages/ui/src/zoid/base.ts:242](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L242)

***

### baseUrl

> **baseUrl**: `Ref`\<`string` \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:217](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L217)

***

### presentationColorPaletteProps

> **presentationColorPaletteProps**: `Ref`\<`string`[] \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:214](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L214)

***

### presentationLighterColorPaletteProps

> **presentationLighterColorPaletteProps**: `Ref`\<`string`[] \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:215](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L215)

***

### presentationProps

> **presentationProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:213](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L213)

***

### slideProps

> **slideProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:216](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L216)

***

### subscribeTopic

> **subscribeTopic**: (`options`) => `void` \| `undefined`

Defined in: [packages/ui/src/zoid/base.ts:240](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L240)

Subscribe to a specific MQTT topic.

The topic is typically constructed using a bucket and a key: `${bucket}/${key}`.
You can also subscribe to multiple topics using a prefix followed by a `#` wildcard (e.g., `bucket/#`).

#### Example

```typescript
subscribeTopic({
  topic: 'my-bucket/my-key',
  callback: (topic, message) => console.log(topic, message)
});
```

Or subscribing to all changes in the bucket:
```typescript
subscribeTopic({
  topic: 'my-bucket/#',
  callback: (topic, message) => console.log(topic, message)
});
```

***

### unsubscribeTopic

> **unsubscribeTopic**: (`topic`) => `void` \| `undefined`

Defined in: [packages/ui/src/zoid/base.ts:241](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L241)
