<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  modelValue: Set<string>;
  items: string[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Set<string>): void;
}>();

const updateModelValue = (event: Event) => {
  emit(
    "update:modelValue",
    new Set<string>((event.target as HTMLInputElement).value)
  );
};

const menuVisible = ref<boolean>();

function toggleMenu() {
  menuVisible.value = !menuVisible.value;
}
</script>

<template>
  <div class="multiselect">
    <button class="multiselect__button" @click="toggleMenu">GENRE</button>
    <div class="multiselect__list">
      <ul id="genre_filter" name="genre-filter">
        <li
          v-for="(item, index) in items"
          :key="index"
          class="multiselect__option-wrapper"
        >
          <input
            :id="item"
            type="checkbox"
            :value="item"
            @change="updateModelValue"
          />
          <label :for="item">{{ item }}</label>
        </li>
      </ul>
    </div>
  </div>
</template>
