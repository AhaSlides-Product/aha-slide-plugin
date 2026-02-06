<template>
  <a-config-provider :theme="ahaSlidesDefaultTheme">  
  <div class="p-8 bg-base-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-base-100 mb-2">Ant Design Vue Components</h1>
      <p class="text-base-70">A comprehensive showcase of all components in ant-design-vue 4.2</p>
    </div>

    <!-- Developer Guide -->
    <div class="mb-10 p-6 bg-white rounded-xl shadow-xs border border-base-20">
      <h2 class="text-2xl font-bold mb-6 text-base-100 flex items-center gap-2">
        <span>📚</span> Developer Guide
      </h2>

      <div class="space-y-8">
        <!-- Setup -->
        <div>
          <h3 class="font-semibold text-lg text-base-90 mb-3 border-b border-base-10 pb-2">Setup</h3>
          <p class="text-base-70 mb-3">To use the AhaSlides custom Ant Design extensions (like extra sizes, colors), you need to import the CSS file.</p>
          <div class="bg-base-5 p-4 rounded-lg border border-base-10 font-mono text-sm text-base-80 overflow-x-auto">
            <div><span class="text-primary-80">import</span> <span class="text-emerald-70">'@aha/ui/ahaslides-antd-extensions.css'</span>;</div>
          </div>
        </div>

        <!-- Usage -->
        <div>
          <h3 class="font-semibold text-lg text-base-90 mb-3 border-b border-base-10 pb-2">Usage</h3>
          <p class="text-base-70 mb-3">Apply utility classes to Ant Design components to use extended styles.</p>
          <div class="bg-base-5 p-4 rounded-lg border border-base-10 font-mono text-sm text-base-80">
            &lt;<span class="text-primary-90">a-button</span> <span class="text-purple-60">type</span>=<span class="text-emerald-70">"primary"</span> <span class="text-purple-60">class</span>=<span class="text-emerald-70">"ant-btn-xl"</span>&gt;Extra Large Button&lt;/<span class="text-primary-90">a-button</span>&gt;
          </div>
        </div>
      </div>
    </div>

    <!-- Component Categories -->
    <a-space direction="vertical" size="large" class="w-full">
      
      <!-- GENERAL -->
      <ComponentSection title="General" description="Basic UI elements">
        <ComponentDemo title="Button" :span="24">
          <a-space direction="vertical" class="w-full" size="middle">
            <!-- Types -->
            <div>
              <a-typography-title :level="5">Types</a-typography-title>
              <a-space wrap>
                <a-button type="primary">Primary</a-button>
                <a-button>Default</a-button>
                <a-button type="dashed">Dashed</a-button>
                <a-button type="text">Text</a-button>
                <a-button type="link">Link</a-button>
              </a-space>
            </div>

            <!-- Sizes -->
            <div>
              <a-typography-title :level="5">Sizes</a-typography-title>
              <a-space wrap align="center">
                <a-button type="primary" class="ant-btn-xl">Extra Large</a-button>
                <a-button type="primary" size="large">Large</a-button>
                <a-button type="primary">Default</a-button>
                <a-button type="primary" size="small">Small</a-button>
              </a-space>
            </div>

            <!-- States -->
            <div>
              <a-typography-title :level="5">States</a-typography-title>
              <a-space wrap>
                <a-button type="primary" loading>Loading</a-button>
                <a-button type="primary" disabled>Disabled</a-button>
                <a-button danger>Danger Default</a-button>
                <a-button type="primary" danger>Danger Primary</a-button>
                <a-button type="text" danger>Danger Text</a-button>
                <a-button type="dashed" danger>Danger Dashed</a-button>
              </a-space>
            </div>

            <!-- Shapes -->
            <div>
              <a-typography-title :level="5">Shapes</a-typography-title>
              <a-space wrap>
                <a-button type="primary" shape="circle">A</a-button>
                <a-button type="primary" shape="round">Round Button</a-button>
                <a-button shape="circle">B</a-button>
                <a-button shape="round">Round Default</a-button>
              </a-space>
            </div>

            <!-- Ghost -->
            <div class="p-4 bg-gray-400 rounded">
              <a-typography-title :level="5" class="!text-white">Ghost</a-typography-title>
              <a-space wrap>
                <a-button type="primary" ghost>Primary</a-button>
                <a-button ghost>Default</a-button>
                <a-button type="dashed" ghost>Dashed</a-button>
                <a-button type="primary" danger ghost>Danger</a-button>
              </a-space>
            </div>
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Typography" :span="24">
          <a-typography-title>h1. Ant Design</a-typography-title>
          <a-typography-title :level="2">h2. Ant Design</a-typography-title>
          <a-typography-title :level="3">h3. Ant Design</a-typography-title>
          <a-typography-text>Ant Design (default)</a-typography-text><br />
          <a-typography-text type="secondary">Ant Design (secondary)</a-typography-text><br />
          <a-typography-text type="success">Ant Design (success)</a-typography-text><br />
          <a-typography-text type="warning">Ant Design (warning)</a-typography-text><br />
          <a-typography-text type="danger">Ant Design (danger)</a-typography-text><br />
          <a-typography-text mark>Ant Design (mark)</a-typography-text><br />
          <a-typography-text code>Ant Design (code)</a-typography-text>
        </ComponentDemo>

      </ComponentSection>

      <!-- LAYOUT -->
      <ComponentSection title="Layout" description="Page layout components">
        <ComponentDemo title="Divider" :span="24">
          <div>
            <p>Lorem ipsum dolor sit amet.</p>
            <a-divider />
            <p>Lorem ipsum dolor sit amet.</p>
            <a-divider dashed />
            <p>Lorem ipsum dolor sit amet.</p>
            <a-divider>With Text</a-divider>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>
        </ComponentDemo>

        <ComponentDemo title="Grid" :span="24">
          <a-row :gutter="[16, 16]">
            <a-col :span="12"><div class="bg-purple-60 text-white p-4 text-center">col-12</div></a-col>
            <a-col :span="12"><div class="bg-purple-60 text-white p-4 text-center">col-12</div></a-col>
            <a-col :span="8"><div class="bg-emerald-60 text-white p-4 text-center">col-8</div></a-col>
            <a-col :span="8"><div class="bg-emerald-60 text-white p-4 text-center">col-8</div></a-col>
            <a-col :span="8"><div class="bg-emerald-60 text-white p-4 text-center">col-8</div></a-col>
          </a-row>
        </ComponentDemo>

        <ComponentDemo title="Space" :span="12">
          <a-space direction="vertical">
            <a-button>Button 1</a-button>
            <a-button>Button 2</a-button>
            <a-button>Button 3</a-button>
          </a-space>
        </ComponentDemo>
      </ComponentSection>

      <!-- NAVIGATION -->
      <ComponentSection title="Navigation" description="Navigation components">
        <ComponentDemo title="Breadcrumb" :span="24">
          <a-breadcrumb>
            <a-breadcrumb-item>Home</a-breadcrumb-item>
            <a-breadcrumb-item><a href="#">Application</a></a-breadcrumb-item>
            <a-breadcrumb-item>Current Page</a-breadcrumb-item>
          </a-breadcrumb>
        </ComponentDemo>

        <ComponentDemo title="Dropdown" :span="12">
          <a-dropdown>
            <a-button>Dropdown Menu</a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1">1st menu item</a-menu-item>
                <a-menu-item key="2">2nd menu item</a-menu-item>
                <a-menu-item key="3">3rd menu item</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </ComponentDemo>

        <ComponentDemo title="Menu" :span="24">
          <a-menu mode="horizontal" :selected-keys="['1']">
            <a-menu-item key="1">Navigation One</a-menu-item>
            <a-menu-item key="2">Navigation Two</a-menu-item>
            <a-menu-item key="3">Navigation Three</a-menu-item>
          </a-menu>
        </ComponentDemo>

        <ComponentDemo title="Pagination" :span="24">
          <a-pagination :total="50" show-size-changer />
        </ComponentDemo>

        <ComponentDemo title="Steps" :span="24">
          <a-steps :current="1">
            <a-step title="Finished" description="This is a description" />
            <a-step title="In Progress" description="This is a description" />
            <a-step title="Waiting" description="This is a description" />
          </a-steps>
        </ComponentDemo>
      </ComponentSection>

      <!-- DATA ENTRY -->
      <ComponentSection title="Data Entry" description="Form and input components">
        <ComponentDemo title="Input" :span="12">
          <a-space direction="vertical" class="w-full">
            <a-input placeholder="Basic input" />
            <a-input placeholder="Disabled" disabled />
            <a-input-search placeholder="Search input" />
            <a-textarea placeholder="Textarea" :rows="3" />
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Checkbox" :span="12">
          <a-space direction="vertical">
            <a-checkbox :checked="true">Checked</a-checkbox>
            <a-checkbox>Unchecked</a-checkbox>
            <a-checkbox disabled>Disabled</a-checkbox>
            <a-checkbox-group v-model:value="checkboxValue" :options="['Apple', 'Pear', 'Orange']" />
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Radio" :span="12">
          <a-space direction="vertical">
            <a-radio-group v-model:value="radioValue">
              <a-radio value="a">Option A</a-radio>
              <a-radio value="b">Option B</a-radio>
              <a-radio value="c">Option C</a-radio>
            </a-radio-group>
            <a-radio-group v-model:value="radioValue" button-style="solid">
              <a-radio-button value="a">Button A</a-radio-button>
              <a-radio-button value="b">Button B</a-radio-button>
              <a-radio-button value="c">Button C</a-radio-button>
            </a-radio-group>
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Select" :span="12">
          <a-space direction="vertical" class="w-full">
            <a-select v-model:value="selectValue" placeholder="Select an option" class="w-full">
              <a-select-option value="jack">Jack</a-select-option>
              <a-select-option value="lucy">Lucy</a-select-option>
              <a-select-option value="tom">Tom</a-select-option>
            </a-select>
            <a-select mode="multiple" v-model:value="multiSelectValue" placeholder="Multiple select" class="w-full">
              <a-select-option value="jack">Jack</a-select-option>
              <a-select-option value="lucy">Lucy</a-select-option>
              <a-select-option value="tom">Tom</a-select-option>
            </a-select>
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Switch" :span="12">
          <a-space>
            <a-switch v-model:checked="switchValue" />
            <a-switch v-model:checked="switchValue" checked-children="ON" un-checked-children="OFF" />
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Slider" :span="12">
          <a-space direction="vertical" class="w-full">
            <a-slider v-model:value="sliderValue" />
            <a-slider v-model:value="rangeValue" range :min="0" :max="100" />
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="DatePicker" :span="12">
          <a-space direction="vertical">
            <a-date-picker v-model:value="dateValue" />
            <a-range-picker v-model:value="rangeDate" />
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="TimePicker" :span="12">
          <a-time-picker v-model:value="timeValue" />
        </ComponentDemo>

        <ComponentDemo title="InputNumber" :span="12">
          <a-input-number v-model:value="numberValue" :min="0" :max="100" />
        </ComponentDemo>

        <ComponentDemo title="Rate" :span="12">
          <a-rate v-model:value="rateValue" />
        </ComponentDemo>

        <ComponentDemo title="Upload" :span="12">
          <a-upload action="https://www.mocky.io/v2/5cc8019d300000980a055e76" list-type="picture">
            <a-button>
              <UploadOutlined />
              Click to Upload
      </a-button>
          </a-upload>
        </ComponentDemo>

        <ComponentDemo title="Form" :span="24">
          <a-form :model="formState" layout="vertical">
            <a-form-item label="Username" name="username">
              <a-input v-model:value="formState.username" />
            </a-form-item>
            <a-form-item label="Password" name="password">
              <a-input-password v-model:value="formState.password" />
            </a-form-item>
            <a-form-item>
              <a-button type="primary">Submit</a-button>
            </a-form-item>
          </a-form>
        </ComponentDemo>
      </ComponentSection>

      <!-- DATA DISPLAY -->
      <ComponentSection title="Data Display" description="Components for displaying data">
        <ComponentDemo title="Avatar" :span="12">
          <a-space>
            <a-avatar>U</a-avatar>
            <a-avatar style="background-color: #87d068">User</a-avatar>
            <a-avatar style="background-color: #1890ff" shape="square">A</a-avatar>
            <a-avatar size="large">L</a-avatar>
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Badge" :span="12">
          <a-space size="large">
            <a-badge :count="5">
              <a-avatar shape="square" />
            </a-badge>
            <a-badge :count="0" show-zero>
              <a-avatar shape="square" />
            </a-badge>
            <a-badge dot>
              <a-avatar shape="square" />
            </a-badge>
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Tag" :span="24">
          <a-space wrap>
            <a-tag>Default</a-tag>
            <a-tag color="success">Success</a-tag>
            <a-tag color="processing">Processing</a-tag>
            <a-tag color="error">Error</a-tag>
            <a-tag color="warning">Warning</a-tag>
            <a-tag color="purple">Purple</a-tag>
            <a-tag color="blue">Blue</a-tag>
            <a-tag closable>Closable</a-tag>
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Card" :span="12">
          <a-card title="Card Title" style="width: 100%">
            <template #extra><a href="#">More</a></template>
            <p>Card content</p>
            <p>Card content</p>
          </a-card>
        </ComponentDemo>

        <ComponentDemo title="Collapse" :span="12">
          <a-collapse v-model:activeKey="collapseKey">
            <a-collapse-panel key="1" header="Panel Header 1">
              <p>Panel content 1</p>
            </a-collapse-panel>
            <a-collapse-panel key="2" header="Panel Header 2">
              <p>Panel content 2</p>
            </a-collapse-panel>
          </a-collapse>
        </ComponentDemo>

        <ComponentDemo title="Descriptions" :span="24">
          <a-descriptions title="User Info" bordered>
            <a-descriptions-item label="Name">John Doe</a-descriptions-item>
            <a-descriptions-item label="Email">john@example.com</a-descriptions-item>
            <a-descriptions-item label="Phone">555-1234</a-descriptions-item>
            <a-descriptions-item label="Address" :span="3">123 Main St, City, Country</a-descriptions-item>
          </a-descriptions>
        </ComponentDemo>

        <ComponentDemo title="Empty" :span="12">
          <a-empty />
        </ComponentDemo>

        <ComponentDemo title="List" :span="12">
          <a-list bordered :data-source="listData">
            <template #renderItem="{ item }">
              <a-list-item>{{ item }}</a-list-item>
            </template>
          </a-list>
        </ComponentDemo>

        <ComponentDemo title="Statistic" :span="12">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-statistic title="Active Users" :value="112893" />
            </a-col>
            <a-col :span="12">
              <a-statistic title="Account Balance" :value="112893" :precision="2" prefix="$" />
            </a-col>
          </a-row>
        </ComponentDemo>

        <ComponentDemo title="Table" :span="24">
          <a-table :columns="tableColumns" :data-source="tableData" :pagination="{ pageSize: 5 }" />
        </ComponentDemo>

        <ComponentDemo title="Tabs" :span="24">
          <a-tabs v-model:activeKey="tabKey">
            <a-tab-pane key="1" tab="Tab 1">Content of Tab Pane 1</a-tab-pane>
            <a-tab-pane key="2" tab="Tab 2">Content of Tab Pane 2</a-tab-pane>
            <a-tab-pane key="3" tab="Tab 3">Content of Tab Pane 3</a-tab-pane>
          </a-tabs>
        </ComponentDemo>

        <ComponentDemo title="Timeline" :span="12">
          <a-timeline>
            <a-timeline-item>Create a services site 2015-09-01</a-timeline-item>
            <a-timeline-item>Solve initial network problems 2015-09-01</a-timeline-item>
            <a-timeline-item>Technical testing 2015-09-01</a-timeline-item>
            <a-timeline-item>Network problems being solved 2015-09-01</a-timeline-item>
          </a-timeline>
        </ComponentDemo>

        <ComponentDemo title="Tooltip" :span="12">
          <a-space>
            <a-tooltip title="Tooltip text">
              <span>Hover me (top)</span>
            </a-tooltip>
            <a-tooltip title="Tooltip text" placement="bottom">
              <span>Hover me (bottom)</span>
            </a-tooltip>
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Popover" :span="12">
          <a-popover title="Title" content="Popover content">
            <a-button>Hover me</a-button>
          </a-popover>
        </ComponentDemo>

        <ComponentDemo title="Tree" :span="12">
          <a-tree :tree-data="treeData" default-expand-all />
        </ComponentDemo>

        <ComponentDemo title="Carousel" :span="24">
          <a-carousel autoplay>
            <div><div class="bg-purple-60 h-40 flex items-center justify-center text-white text-2xl">1</div></div>
            <div><div class="bg-emerald-60 h-40 flex items-center justify-center text-white text-2xl">2</div></div>
            <div><div class="bg-coral-60 h-40 flex items-center justify-center text-white text-2xl">3</div></div>
          </a-carousel>
        </ComponentDemo>
      </ComponentSection>

      <!-- FEEDBACK -->
      <ComponentSection title="Feedback" description="User feedback components">
        <ComponentDemo title="Alert" :span="24">
          <a-space direction="vertical" class="w-full">
            <a-alert message="Success Text" type="success" />
            <a-alert message="Info Text" type="info" />
            <a-alert message="Warning Text" type="warning" />
            <a-alert message="Error Text" type="error" />
            <a-alert message="Success Tips" description="Detailed description and advice about successful copywriting." type="success" closable />
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Modal" :span="12">
          <a-button type="primary" @click="modalVisible = true">Open Modal</a-button>
          <a-modal v-model:open="modalVisible" title="Basic Modal" @ok="modalVisible = false">
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </a-modal>
        </ComponentDemo>

        <ComponentDemo title="Message & Notification" :span="12">
          <a-space>
            <a-button @click="showMessage">Show Message</a-button>
            <a-button @click="showNotification">Show Notification</a-button>
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Progress" :span="24">
          <a-space direction="vertical" class="w-full">
            <a-progress :percent="30" />
            <a-progress :percent="50" status="active" />
            <a-progress :percent="70" status="exception" />
            <a-progress :percent="100" />
            <a-progress type="circle" :percent="75" />
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Popconfirm" :span="12">
          <a-popconfirm title="Are you sure?" @confirm="onConfirm">
            <a-button danger>Delete</a-button>
          </a-popconfirm>
        </ComponentDemo>

        <ComponentDemo title="Result" :span="24">
          <a-result status="success" title="Successfully Purchased Cloud Server ECS!" sub-title="Order number: 2017182818828182881 Cloud server configuration takes 1-5 minutes, please wait.">
            <template #extra>
              <a-button type="primary">Go Console</a-button>
              <a-button>Buy Again</a-button>
            </template>
          </a-result>
        </ComponentDemo>

        <ComponentDemo title="Skeleton" :span="12">
          <a-skeleton :paragraph="{ rows: 4 }" />
        </ComponentDemo>

        <ComponentDemo title="Spin" :span="12">
          <a-space size="large">
            <a-spin />
            <a-spin size="small" />
            <a-spin size="large" />
          </a-space>
        </ComponentDemo>

        <ComponentDemo title="Drawer" :span="12">
          <a-button type="primary" @click="drawerVisible = true">Open Drawer</a-button>
          <a-drawer v-model:open="drawerVisible" title="Basic Drawer" placement="right">
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </a-drawer>
        </ComponentDemo>
      </ComponentSection>

    </a-space>
  </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import '@aha/ui/ahaslides-antd-extensions.css'
import { ref } from 'vue';
import { message, notification } from 'ant-design-vue';

import ComponentSection from '../../components/ComponentSection.vue';
import ComponentDemo from '../../components/ComponentDemo.vue';
import { ahaSlidesDefaultTheme } from '@aha/ui';

// State
const checkboxValue = ref(['Apple']);
const radioValue = ref('a');
const selectValue = ref('jack');
const multiSelectValue = ref(['jack']);
const switchValue = ref(true);
const sliderValue = ref(30);
const rangeValue = ref([20, 50]);
const dateValue = ref();
const rangeDate = ref();
const timeValue = ref();
const numberValue = ref(3);
const rateValue = ref(4);
const collapseKey = ref(['1']);
const tabKey = ref('1');
const modalVisible = ref(false);
const drawerVisible = ref(false);

// Form
const formState = ref({
  username: '',
  password: '',
});

// List data
const listData = ref([
  'Racing car sprays burning fuel into crowd.',
  'Japanese princess to wed commoner.',
  'Australian walks 100km after outback crash.',
]);

// Table data
const tableColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
  },
];

const tableData = ref([
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park',
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park',
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park',
  },
]);

// Tree data
const treeData = ref([
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'leaf',
        key: '0-0-0',
      },
      {
        title: 'leaf',
        key: '0-0-1',
      },
    ],
  },
  {
    title: 'parent 2',
    key: '0-1',
    children: [
      {
        title: 'leaf',
        key: '0-1-0',
      },
    ],
  },
]);

// Methods
const showMessage = () => {
  message.success('This is a success message');
};

const showNotification = () => {
  notification.open({
    message: 'Notification Title',
    description: 'This is the content of the notification.',
  });
};

const onConfirm = () => {
  message.success('Confirmed!');
};
</script>
