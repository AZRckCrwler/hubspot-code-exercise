<script setup lang="ts">
import { computed } from "vue";
import type { Media, SanitizedMedia } from "../interfaces/media";

const props = defineProps<{
  media: Media[];
  genreFilter: Set<string>;
  yearFilter: Set<string>;
  mediaTypeFilter: string;
  mediaQueryFilter: string;
}>();

// Create a copy of media data, adding in sanitized versions of media properties
const sanitizedMedia = computed<SanitizedMedia[]>(() => {
  return props.media.map((item) => {
    return {
      sanitizedTitle: item.title.toLowerCase(),
      ...item,
    };
  });
});

const filteredMedia = computed(() => {
  return sanitizedMedia.value.filter(itemVisibility);
});

const sanitizedMediaQueryFilter = computed(() => {
  return props.mediaQueryFilter.toLowerCase().trim();
});

// Define empty object as Record<PropsKeys, PropsKeys>
// Fill object with keys from props for later programattic usage with proper typing
// ex: allows usage of props[variable]
type PropsKeys = keyof typeof props;
const propKeys = Object.keys(props).reduce((acc, key) => {
  return { ...acc, [key]: key };
}, {} as Record<PropsKeys, PropsKeys>);

function itemVisibility(item: SanitizedMedia): boolean {
  return (
    // filterByArrayProperty(item.genre, propKeys.genreFilter) &&
    filterByGenre(item.genre) &&
    filterByStringProperty(item.type, propKeys.mediaTypeFilter) &&
    filterByYear(item.year) &&
    filterQuery(item.sanitizedTitle)
  );
}

// function filterByArrayProperty(item: string[], propsKey: PropsKeys) {
//   // TODO: Narrow to only types of Set<string>
//   return (
//     props[propsKey].size === 0 ||
//     item.some((genre) => props[propsKey].has(genre))
//   );
// }

function filterByGenre(item: string[]) {
  return (
    props.genreFilter.size === 0 ||
    item.some((item) => props.genreFilter.has(item))
  );
}

function filterByYear(item: string) {
  return props.yearFilter.size === 0 || props.yearFilter.has(item);
}

function filterByStringProperty(item: string, propsKey: PropsKeys) {
  // TODO: Narrow to only types of string
  return props[propsKey] === "" || props[propsKey] === item;
}

function filterQuery(item: string) {
  return (
    sanitizedMediaQueryFilter.value === "" ||
    item.indexOf(sanitizedMediaQueryFilter.value) !== -1
  );
}
</script>

<template>
  <div class="media-grid">
    <template v-for="(item, gridIndex) in filteredMedia" :key="gridIndex">
      <div :data-type="item.type" class="media-grid__item">
        <img
          :src="item.poster"
          :alt="
            item.type === 'movie'
              ? `Movie poster for ${item.title}`
              : `Book cover for ${item.title}`
          "
          class="media-grid__image"
        />
        <p class="media-grid__title-year">{{ item.title }} ({{ item.year }})</p>
        <p class="media-grid__genre">
          Genres:
          <span v-for="(genre, genreIndex) in item.genre" :key="genreIndex"
            >{{ genre
            }}{{ genreIndex !== item.genre.length - 1 ? ", " : "" }}</span
          >
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.media-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  justify-content: center;
  gap: 14px;
  padding: 7px;
  border: 1px solid #e3e4e3;

  &__image {
    max-width: 100%;
    width: 100%;
  }

  &__title-year {
    font-weight: bold;
  }

  &__genre {
    font-weight: bold;
  }

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);

    &__image {
      width: auto;
    }
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
