[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useAudiencePlugin

# Function: useAudiencePlugin()

> **useAudiencePlugin**(`options`): `object`

Defined in: [packages/ui/src/zoid.ts:508](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ba80983bd50ca063a1b9a1379ae08370d8394222/packages/ui/src/zoid.ts#L508)

Hook for Audience Plugins.
Provides access to presentation, slide, and slideAttributes data.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

`object`

Reactive refs for presentation, slide, and slideAttributes props.

### audienceEmail

> **audienceEmail**: `Ref`\<`string` \| `undefined`\>

### audienceEmoji

> **audienceEmoji**: `Ref`\<`string` \| `undefined`\>

### audienceId

> **audienceId**: `Ref`\<`string` \| `number` \| `undefined`\>

### audienceName

> **audienceName**: `Ref`\<`string` \| `undefined`\>

### audienceSendCountingAction

> **audienceSendCountingAction**: (`payload?`) => `Promise`\<`any`\> \| `undefined`

### audienceTeam

> **audienceTeam**: `Ref`\<`string` \| `undefined`\>

### baseUrl

> **baseUrl**: `Ref`\<`string` \| `undefined`\>

### onMqttMessage

> **onMqttMessage**: (`handler`) => `void` \| `undefined`

### presentationProps

> **presentationProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

### slideAttributesProps

> **slideAttributesProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

### slideProps

> **slideProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

### subscribeTopic

> **subscribeTopic**: (`topic`) => `void` \| `undefined`

### unsubscribeTopic

> **unsubscribeTopic**: (`topic`) => `void` \| `undefined`
