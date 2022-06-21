<script setup lang="ts">
// Libraries
import { ref, computed, customRef, type Ref, onMounted } from "vue";
import { plural } from "pluralize";
// Typing
import type { Media } from "./interfaces/media";
// Data
import { media as rawMedia } from "./data/data.json";
// Components
import mediaGrid from "./components/mediaGrid.vue";
// import MultiSelect from "./components/multiSelect.vue";

const media = ref<Media[] | []>([]);
const genreFilter = ref<Set<string>>(new Set());
const yearFilter = ref<Set<string>>(new Set());
const mediaTypeFilter = ref<string>("");
const genreMenuActive = ref<boolean>(false);
const yearMenuActive = ref<boolean>(false);
const mediaQuery = useDebouncedRef("");

async function fetchMedia() {
  try {
    const url =
      "https://raw.githubusercontent.com/HubSpotWebTeam/CodeExercise/main/src/js/data/data.json";
    const response = await fetch(url);
    const data = await response.json();
    media.value = data.media;
  } catch (error) {
    console.error(error);
    media.value = rawMedia;
  }
}

onMounted(() => {
  fetchMedia();
});

const getSortedData = computed(() => {
  return {
    media: [...media.value].sort(mediaSortByTitleAsc),
    genres: [...getUniqueGenres()].sort(sortAsc),
    types: [...getUniqueMediaTypes()].sort(sortDesc),
    years: [...getUniqueYears()].sort(sortAsc),
  };
});

const intlCollator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

function getUniqueGenres(): string[] {
  return [...new Set(getMediaSortedByTitle().flatMap((item) => item.genre))];
}

function getUniqueYears(): string[] {
  return [...new Set(getMediaSortedByTitle().map((item) => item.year))];
}

function getUniqueMediaTypes(): string[] {
  return [...new Set(getMediaSortedByTitle().map((item) => item.type))];
}

function getMediaSortedByTitle(): Media[] {
  return [...media.value].sort(mediaSortByTitleAsc);
}

function mediaSortByTitleAsc(a: Media, b: Media): number {
  return intlCollator.compare(a.title, b.title);
}

function sortAsc(a: string, b: string): number {
  return intlCollator.compare(a, b);
}

function sortDesc(a: string, b: string): number {
  return intlCollator.compare(b, a);
}

function clearFilters(): void {
  genreFilter.value = new Set();
  yearFilter.value = new Set();
  mediaTypeFilter.value = "";
  mediaQuery.value = "";
}

function toggleGenreMenu(): void {
  if (yearMenuActive.value === true) {
    toggleYearMenu();
  }
  genreMenuActive.value = !genreMenuActive.value;
}

function toggleYearMenu(): void {
  if (genreMenuActive.value === true) {
    toggleGenreMenu();
  }
  yearMenuActive.value = !yearMenuActive.value;
}

function useDebouncedRef(value: string, delay = 200): Ref<string> {
  let timeout: number;
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      },
    };
  });
}
</script>

<template>
  <div class="container__primary">
    <div class="media-interface">
      <p v-if="media === []" class="text-center">Loading data...</p>
      <!-- SEARCH -->
      <div class="media-interface__item media-interface__search-container">
        <div class="media-interface__search">
          <input
            v-model="mediaQuery"
            type="text"
            class="media-interface__search-input"
          />
        </div>
      </div>
      <!-- SELECTS -->
      <div class="media-interface__item media-interface__multiselects">
        <!-- <MultiSelect
          v-model="genreFilter"
          :items="getSortedData.genres"
        ></MultiSelect> -->
        <div class="multiselect">
          <button class="multiselect__button" @click="toggleGenreMenu">
            GENRE
          </button>
          <div
            class="multiselect__list-container"
            :class="{ 'multiselect__list-container--active': genreMenuActive }"
          >
            <ul id="genre_filter" name="genre-filter" class="multiselect__list">
              <li
                v-for="(genre, genreIndex) in getSortedData.genres"
                :key="genreIndex"
                :value="genre"
                class="multiselect__option-wrapper"
              >
                <input
                  :id="genre"
                  v-model="genreFilter"
                  type="checkbox"
                  :value="genre"
                  class="multiselect__input"
                />
                <label :for="genre" class="multiselect__label">{{
                  genre
                }}</label>
              </li>
            </ul>
          </div>
        </div>
        <div class="multiselect">
          <button class="multiselect__button" @click="toggleYearMenu">
            YEAR
          </button>
          <div
            class="multiselect__list-container"
            :class="{ 'multiselect__list-container--active': yearMenuActive }"
          >
            <ul id="year_filter" name="year-filter" class="multiselect__list">
              <li
                v-for="(year, yearIndex) in getSortedData.years"
                :key="yearIndex"
                :value="year"
                class="multiselect__option-wrapper"
              >
                <input
                  :id="year"
                  v-model="yearFilter"
                  type="checkbox"
                  :value="year"
                  class="multiselect__input"
                />
                <label :for="year" class="multiselect__label">{{ year }}</label>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- RADIOS -->
      <div class="media-interface__item media-interface__radios">
        <div
          v-for="(type, index) in getSortedData.types"
          :key="index"
          class="media-interface__radio"
        >
          <input
            :id="`media_selector_${type}`"
            v-model="mediaTypeFilter"
            type="radio"
            :value="type"
          />
          <label
            :for="`media_selector_${type}`"
            class="media-interface__radio-label"
            >{{ plural(type) }}</label
          >
        </div>
      </div>
      <!-- CLEAR FILTERS -->
      <div class="media-interface__item media-interface__clear">
        <button @click="clearFilters">CLEAR FILTERS</button>
      </div>
    </div>
    <!-- MEDIA GRID -->
    <mediaGrid
      :media="getSortedData.media"
      :genre-filter="genreFilter"
      :year-filter="yearFilter"
      :media-type-filter="mediaTypeFilter"
      :media-query-filter="mediaQuery"
    />
  </div>
</template>

<style>
.container {
  &__primary {
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
  }
}

.media-interface {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  row-gap: 20px;
  padding: 18px 14px;
  border: 1px solid #e3e4e3;

  &__search {
    --input-icon-spacing: rem(22px);

    position: relative;
    width: min-content;

    &-input {
      box-sizing: border-box;
      padding-right: var(--input-icon-spacing);
      min-width: rem(135px);
      min-height: rem(25px);
    }

    &::after {
      content: "\26B2";
      position: absolute;
      bottom: 0;
      right: 0;
      height: 100%;
      width: var(--input-icon-spacing);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 19px;
      line-height: 1;
      font-weight: bold;
      transform: rotate(-45deg);
    }
  }

  &__search-container {
    display: flex;
  }

  &__radio {
    display: inline-block;
    margin-right: 10px;

    &-label {
      text-transform: capitalize;
      font-weight: bold;
      margin-left: 3px;
    }
  }

  &__clear {
    display: flex;
  }

  & + .media-grid {
    border-top: none;
  }
}

.multiselect {
  position: relative;
  display: inline-block;

  &__button {
    position: relative;
    min-width: rem(100px);
    min-height: rem(30px);
    display: inline-block;
    text-align: left;
    background: #f6f4f5;
    border: none;
    border-bottom: 2px solid #dfdddf;
    font-weight: bold;
    color: #706a6a;

    &::after {
      content: "\276E";
      position: absolute;
      bottom: 0;
      right: 5px;
      height: 100%;
      width: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      line-height: 1;
      font-weight: bold;
      transform: rotate(-90deg);
    }
  }

  &__list-container {
    display: none;
    position: absolute;
    top: calc(100% + 7px);
    left: 0;
    z-index: 2;

    &::before {
      content: "";
      position: absolute;
      top: -7px;
      left: 10px;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid #e3e4e3;
    }

    &::after {
      content: "";
      position: absolute;
      top: -5px;
      left: 11px;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 7px solid #fff;
    }

    &--active {
      display: block;
    }
  }

  &__list {
    position: relative;
    list-style: none;
    padding: 0;
    margin: 0;
    min-width: rem(100px);
    max-height: rem(185px);
    overflow-y: auto;
    overflow-x: clip;
    scrollbar-width: thin;
    width: max-content;
    background: #fefcfe;
    border: 1px solid #e3e4e3;
  }

  &__option-wrapper {
    padding: rem(9px 11px);
    box-sizing: border-box;
    width: max-content;
  }

  &__label {
    margin-left: rem(7px);
    text-transform: uppercase;
    font-weight: bold;
  }

  &__input {
    vertical-align: text-bottom;
  }

  & + & {
    margin-left: 20px;
  }
}

@media (min-width: 640px) {
  .media-interface {
    grid-template-columns: repeat(2, 1fr);

    &__search-container {
      order: 2;
      justify-content: flex-end;
    }

    &__multiselects {
      order: 1;
    }

    &__radios {
      order: 3;
    }

    &__clear {
      order: 4;
      justify-content: flex-end;
    }
  }
}
</style>
