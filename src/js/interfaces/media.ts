export interface Media {
  title: string;
  year: string;
  poster: string;
  genre: string[];
  type: string;
}

export interface SanitizedMedia extends Media {
  // TODO: Consider converting genre: string[] to genre: set<string>
  //       Would require refactor of the usage of Array.some() in filterByGenre()
  // genre: Set<string>;
  sanitizedTitle: string;
}
