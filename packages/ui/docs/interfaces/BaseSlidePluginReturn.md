[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / BaseSlidePluginReturn

# Interface: BaseSlidePluginReturn

Defined in: [packages/ui/src/zoid/base.ts:233](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L233)

Common return type for slide plugin hooks.

## Properties

### baseUrl

> **baseUrl**: `Ref`\<`string` \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:238](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L238)

***

### presentationColorPaletteProps

> **presentationColorPaletteProps**: `Ref`\<`string`[] \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:235](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L235)

***

### presentationLighterColorPaletteProps

> **presentationLighterColorPaletteProps**: `Ref`\<`string`[] \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:236](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L236)

***

### presentationProps

> **presentationProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:234](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L234)

***

### reportHeight()

> **reportHeight**: () => `void`

Defined in: [packages/ui/src/zoid/base.ts:242](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L242)

Manually trigger a report of the current content height to the parent.

#### Returns

`void`

***

### slideProps

> **slideProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

Defined in: [packages/ui/src/zoid/base.ts:237](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L237)

***

### subscribeTopic

> **subscribeTopic**: (`options`) => `void` \| `undefined`

Defined in: [packages/ui/src/zoid/base.ts:265](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L265)

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

Defined in: [packages/ui/src/zoid/base.ts:266](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L266)
