import { useMemo, useState } from 'react'

import AppLayout from '../components/layout/AppLayout'

import GlobalSearchBar from '../components/search/GlobalSearchBar'
import SearchResultsList from '../components/search/SearchResultsList'

import LoadingSpinner from '../components/common/LoadingSpinner'
import ErrorState from '../components/common/ErrorState'

import { useApiState } from '../hooks/useApiState'
import { useDebounce } from '../hooks/useDebounce'

import { employeeService } from '../api/employeeService'

export default function SearchPage() {
  const [query, setQuery] = useState('')

  const debouncedQuery = useDebounce(query, 350)

  const params = useMemo(
    () => ({
      search: debouncedQuery || undefined,
      page_size: 100,
    }),
    [debouncedQuery]
  )

  const {
    data,
    loading,
    error,
    refetch,
  } = useApiState(
    () =>
      debouncedQuery
        ? employeeService.list(params)
        : Promise.resolve([]),
    [JSON.stringify(params)]
  )

  const results =
    data?.items ||
    data?.results ||
    data ||
    []

  const hint = debouncedQuery
    ? loading
      ? 'Searching…'
      : `${results.length} result${results.length === 1 ? '' : 's'}`
    : 'Type to search across employees, projects and seats.'

  return (
    <AppLayout title="Search">

      <div className="mx-auto max-w-[800px] animate-fadeup">

        <GlobalSearchBar
          value={query}
          onChange={setQuery}
        />

        <p className="mb-[18px] pl-1 text-xs text-surface-400">{hint}</p>

        {!debouncedQuery ? null : loading ? (

          <LoadingSpinner label="Searching..." />

        ) : error ? (

          <ErrorState
            message={error}
            onRetry={refetch}
          />

        ) : (

          <SearchResultsList
            query={debouncedQuery}
            results={results}
          />

        )}

      </div>

    </AppLayout>
  )
}
