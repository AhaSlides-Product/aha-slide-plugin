[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / ReportProps

# Interface: ReportProps

Defined in: [packages/ui/src/zoid/report.ts:8](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L8)

Properties for the report slide plugin.

## Properties

### currentLanguage?

> `optional` **currentLanguage**: `string`

Defined in: [packages/ui/src/zoid/report.ts:12](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L12)

The current language code (e.g., 'en', 'vi')

***

### locale?

> `optional` **locale**: `string`

Defined in: [packages/ui/src/zoid/report.ts:29](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L29)

***

### onHeightChange()?

> `optional` **onHeightChange**: (`height`) => `void`

Defined in: [packages/ui/src/zoid/report.ts:19](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L19)

Callback to report height changes from the child to the parent. 
Sending null signals the parent to use 100% height.

#### Parameters

##### height

The new height in pixels, or null for 100% height.

`number` | `null`

#### Returns

`void`

***

### openExportModalForPresentation()?

> `optional` **openExportModalForPresentation**: (`presentation`) => `void`

Defined in: [packages/ui/src/zoid/report.ts:28](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L28)

#### Parameters

##### presentation

`any`

#### Returns

`void`

***

### pushRoute()?

> `optional` **pushRoute**: (`location`, `onComplete?`, `onAbort?`) => `void`

Defined in: [packages/ui/src/zoid/report.ts:27](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L27)

#### Parameters

##### location

`any`

##### onComplete?

`Function`

##### onAbort?

`Function`

#### Returns

`void`

***

### replaceRoute()?

> `optional` **replaceRoute**: (`location`, `onComplete?`, `onAbort?`) => `void`

Defined in: [packages/ui/src/zoid/report.ts:26](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L26)

#### Parameters

##### location

`any`

##### onComplete?

`Function`

##### onAbort?

`Function`

#### Returns

`void`

***

### token?

> `optional` **token**: `string`

Defined in: [packages/ui/src/zoid/report.ts:10](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L10)

The token for authentication/authorization

***

### trackGA4AndMixpanel()?

> `optional` **trackGA4AndMixpanel**: (`eventName`, `payload`) => `void`

Defined in: [packages/ui/src/zoid/report.ts:25](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L25)

Action to track events to GA4 and Mixpanel.

#### Parameters

##### eventName

`string`

##### payload

`any`

The event payload to track.

#### Returns

`void`

***

### translationMap?

> `optional` **translationMap**: `Record`\<`string`, `string`\>

Defined in: [packages/ui/src/zoid/report.ts:30](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/report.ts#L30)
