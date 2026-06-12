import { useMemo, memo, useState, useCallback } from 'react';
import type { Country } from '../../types';
import { CountryCard } from '../country-card/country-card';
import { getPopulationForYear, createYearDataMap } from '../../utils/data-transformers';

import styles from './country-list.module.css';

type CountryListProps = {
  countries: Country[];
  searchQuery: string;
  selectedColumns: string[];
  selectedRegion: string;
  selectedYear: number;
  sortField: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
  onYearChange: (year: number) => void;
};

const ITEM_HEIGHT = 300;
const CONTAINER_HEIGHT = 800;
const OVERSCAN = 3;

export const CountryList = memo(({
                                   countries,
                                   searchQuery,
                                   selectedColumns,
                                   selectedRegion,
                                   selectedYear,
                                   sortField,
                                   sortOrder,
                                 }: CountryListProps) => {
  const [scrollTop, setScrollTop] = useState(0);

  const filteredCountries = useMemo(() =>
      countries
        .filter((c) => {
          const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesRegion = !selectedRegion || c.data.some((d) => d.region === selectedRegion);
          return matchesSearch && matchesRegion;
        })
        .sort((a, b) => {
          if (sortField === 'name') {
            return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
          } else {
            const popA = getPopulationForYear(createYearDataMap(a.data), selectedYear) || 0;
            const popB = getPopulationForYear(createYearDataMap(b.data), selectedYear) || 0;
            return sortOrder === 'asc' ? popA - popB : popB - popA;
          }
        }),
    [countries, searchQuery, selectedRegion, sortField, sortOrder, selectedYear]
  );

  const itemHeight = useMemo(() =>
      ITEM_HEIGHT + (selectedColumns.length - 4) * 36,
    [selectedColumns.length]
  );

  const totalHeight = filteredCountries.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - OVERSCAN);
  const endIndex = Math.min(
    filteredCountries.length - 1,
    Math.floor((scrollTop + CONTAINER_HEIGHT) / itemHeight) + OVERSCAN
  );

  const visibleCountries = filteredCountries.slice(startIndex, endIndex + 1);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className={styles.countryList}
      style={{ height: CONTAINER_HEIGHT, overflowY: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleCountries.map((country, i) => (
          <div
            key={country.id}
            style={{
              position: 'absolute',
              top: (startIndex + i) * itemHeight,
              width: '100%',
            }}
          >
            <CountryCard
              country={country}
              selectedYear={selectedYear}
              selectedColumns={selectedColumns}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
