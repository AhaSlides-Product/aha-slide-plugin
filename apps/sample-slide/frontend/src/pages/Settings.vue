<template>
  <div class="settings-page">
    <p>Configure preferences for Slide: {{ slideId }}</p>
    
    <div class="settings-form">
      <h3>Slide Greeting</h3>
      <a-input v-model:value="slideGreeting" placeholder="Enter slide greeting" style="width: 300px" />
    </div>
    <div>
      <a-typography-title>Heading 1</a-typography-title>
      <a-typography-title :level="2">Heading 2</a-typography-title>
    </div>
    <a-button type="primary" size="small">Sample button</a-button>
    <div style="margin-top: 10px;">
      <p>Upload Image:</p>
      <a-button type="primary" @click="handleImageUpload">Upload Image</a-button>
      <div v-if="imageUrl" style="margin-top: 10px;">
        <img v-if="imageUrl" :src="imageUrl" alt="Slide Image" style="max-width: 100%; max-height: 400px; border-radius: 8px;" />
        <a-button type="primary" @click="() => imageUrl = ''">Clear Image</a-button>
      </div>
    </div>

    <!-- Sample 2: Edit Image Modal Button -->
    <div v-if="imageUrl" style="margin-top: 20px; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h3>Sample 2: Edit Uploaded Image</h3>
      <a-button type="primary" @click="handleEditImage">
        <edit-outlined /> Edit Image
      </a-button>
    </div>

    <div v-if="presentationProps" class="debug-section" data-testid="settings-presentation-props">
      <h3>Presentation Details</h3>
      <p><b>ID:</b> {{ presentationProps.id }}</p>
      <p><b>Language:</b> {{ presentationProps.language }}</p>
      <p><b>Font Family:</b> {{ presentationProps.fontFamily }}</p>
      <p><b>Access Codes:</b> 
        Unique: {{ presentationProps.uniqueAccessCode }}, 
        Share: {{ presentationProps.shareCode }}, 
        Access: {{ presentationProps.accessCode }}
      </p>
      <div class="teamplay-info"><b>Teamplay:</b> <pre style="display:inline">{{ JSON.stringify(presentationProps.teamplay) }}</pre></div>
    </div>
    
    <div v-if="presentationColorPaletteProps" class="debug-section" data-testid="settings-presentation-color-palette-props">
      <h3>Presentation Color Palette</h3>
      <pre class="code-block">{{ JSON.stringify(presentationColorPaletteProps, null, 2) }}</pre>
    </div>
    
    <div v-if="presentationLighterColorPaletteProps" class="debug-section" data-testid="settings-presentation-lighter-color-palette-props">
      <h3>Presentation Lighter Color Palette</h3>
      <pre class="code-block">{{ JSON.stringify(presentationLighterColorPaletteProps, null, 2) }}</pre>
    </div>

    <div v-if="slideProps" class="debug-section" data-testid="settings-slide-details-props">
      <h3>Slide Details</h3>
      <p><b>Slide ID:</b> {{ slideProps.id }}</p>
      <p v-if="slideProps.textColour"><b>Text Colour:</b> <span :style="{ color: slideProps.textColour }">{{ slideProps.textColour }}</span></p>
      <pre>{{ JSON.stringify(slideProps, null, 2) }}</pre>
    </div>
    
    <div v-if="currentUserProps" class="debug-section" data-testid="settings-user-details-props">
      <h3>User Details</h3>
      <p><b>Presenter Language:</b> {{ currentUserProps.presenterLanguage || 'N/A' }}</p>
      <pre class="code-block">{{ JSON.stringify(currentUserProps, null, 2) }}</pre>
    </div>

    <div v-if="attributeResponse && showSlideAttributes" class="debug-section" data-testid="settings-slide-attributes">
      <h3>Slide Attributes</h3>
      <pre class="code-block">{{ JSON.stringify(attributeResponse, null, 2) }}</pre>
    </div>

    <div class="debug-section">
      <h3>Slide Attributes Control</h3>
      <a-button @click="showSlideAttributes = !showSlideAttributes">
        {{ showSlideAttributes ? 'Hide' : 'Show' }} Slide Attributes
      </a-button>
    </div>

    <div class="debug-section">
      <h3>Toast Notifications</h3>
      <a-space>
        <a-button @click="showToastInfo?.('Info toast from plugin', 'plugin-info')">Info</a-button>
        <a-button type="primary" @click="showToastSuccess?.('Success toast from plugin', 'plugin-success')">Success</a-button>
        <a-button danger @click="showToastError?.('Error toast from plugin', 'plugin-error')">Error</a-button>
      </a-space>
    </div>

    <div class="debug-section">
      <h3>Height Change Test (Long Select)</h3>
      <a-select v-model:value="selectedTestValue" placeholder="Select to test height change" style="width: 100%">
        <a-select-option v-for="i in 50" :key="i" :value="'Option ' + i">
          Option {{ i }} - This is a very long option text to test if it affects anything else as well.
        </a-select-option>
      </a-select>
      <div style="margin-top: 10px;">
        <a-button type="primary" @click="handleManualReportHeight">Trigger Manual Height Report</a-button>
      </div>

      <div style="margin-top: 10px;">
        <a-button type="primary" @click="showConfirm">Show Confim Modal</a-button>
      </div>

      <div style="margin-top: 10px;">
        <a-button type="danger" @click="onClearSlideData">Clear Slide Data</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed, nextTick } from 'vue';
import { debounce } from 'lodash-es';
import { useSync, usePresenterPlugin } from '@aha/ui';
import { useSlideImage } from '../composables/useSlideImage';
import { EditOutlined } from '@ant-design/icons-vue';

const { 
  presentationProps, 
  presentationColorPaletteProps, 
  presentationLighterColorPaletteProps, 
  slideProps, currentUserProps, upsertSlideAttributeAction, getSlideAttributesAction,
  openUploadImageModal, openEditImageModal, showToastInfo, showToastSuccess, showToastError, reportHeight, 
  showConfirmModal, 
  clearSlideData
 } = usePresenterPlugin({ autoHeight: true });
const slideId = computed(() => slideProps.value?.id);
const slideGreeting = useSync(computed(() => `greeting-${slideId.value}`), '');

const showSlideAttributes = ref(false);
const selectedTestValue = ref('');

const handleManualReportHeight = () => {
  reportHeight();
  showToastInfo?.('Manual height report triggered', 'manual-height-report');
};

const { imageUrl } = useSlideImage(slideId);

const handleImageUpload = async () => {
  try {
    if (openUploadImageModal) {
      const result = await openUploadImageModal();
      imageUrl.value = result.url;
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Sample 1: Upload image using uploadImage function
// const handleCustomUpload = async (options: any) => {
//   const { file } = options;
//   console.log('is instance of Blob', file.originFileObj instanceof Blob);
//   console.log('originFileObj',file.originFileObj)
//   try {
//     if (uploadImage) {
//       const result = await uploadImage(file.originFileObj);
//       imageUrl.value = result.url;
//       console.log('Image uploaded successfully:', result);
//     }
//   } catch (error) {
//     console.error('Upload failed:', error);
//   }
// };

// Sample 2: Edit image using openEditImageModal function
const handleEditImage = async () => {
  try {
    if (openEditImageModal && imageUrl.value) {
      const result = await openEditImageModal(imageUrl.value);
      imageUrl.value = result.url;
      console.log('Image edited successfully:', result);
    }
  } catch (error) {
    console.error('Edit failed:', error);
  }
};
// xprops removed as it is now handled by usePresenterPlugin

/**
 * Stores the response from the getSlideAttributesAction call.
 */
const attributeResponse = ref<any>(null);

/**
 * Handles the click event to fetch slide attributes from the parent application.
 * Calls the `getSlideAttributesAction` provided by the parent via xprops.
 * 
 * @param {string | number} [id] - The ID of the slide to fetch attributes for.
 * @returns {Promise<void>}
 */
const handleGetAttributes = async (id?: string | number) => {
  if (getSlideAttributesAction) {
    try {
      attributeResponse.value = await getSlideAttributesAction(id);
      console.log('Attributes response:', attributeResponse.value);
      return attributeResponse.value;
    } catch (error) {
      console.error('Error calling getSlideAttributesAction:', error);
    }
  } else {
    console.warn('getSlideAttributesAction is not available');
  }
};

onMounted(async () => {
  if (slideId.value) {
    const attributes = await handleGetAttributes(slideId.value);
    if (attributes && attributes.greeting) {
      slideGreeting.value = attributes.greeting;
    }
  }
});

const debouncedUpdate = debounce((newGreeting: string) => {
  if (upsertSlideAttributeAction) {
    upsertSlideAttributeAction({ slideId: slideId.value, attributeKey: 'greeting', attributeValue: newGreeting })
  }
}, 500);

const showConfirm = async () => {
  const confirm = await showConfirmModal?.({
    title: 'Sample confirm',
    content: 'This is a sample confirm modal',
    okText: 'OK',
    cancelText: 'Cancel',
    variant: 'danger'
  })
  console.log('Confirm:', confirm);
}

watch(showSlideAttributes, async () => {
  await nextTick();
  reportHeight();
});

const onClearSlideData = async () => {
  const confirm = await showConfirmModal?.({
    title: 'Clear Slide Data',
    content: 'Are you sure you want to clear the slide data?',
    okText: 'OK',
    cancelText: 'Cancel',
    variant: 'danger'
  })
  if (confirm) {
    clearSlideData?.(slideId.value);
  }
}

watch(slideGreeting, (newGreeting) => {
  debouncedUpdate(newGreeting);
});
</script>

<style scoped>
.settings-page {
  padding: 2rem;
}
.settings-form {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.debug-section {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-left: 4px solid #1890ff;
  font-size: 13px;
}
.debug-section h3 {
  margin-bottom: 5px;
  color: #1890ff;
  font-size: 16px;
}
.code-block {
  background: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 6px;
  overflow: auto;
  font-size: 12px;
}
</style>
