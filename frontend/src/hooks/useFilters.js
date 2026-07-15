import { useState, useCallback } from 'react'

/**
 * Generic filter hook.
 *
 * Example:
 *
 * const {
 *   filters,
 *   setFilter,
 *   setFilters,
 *   resetFilters,
 * } = useFilters({
 *   search: '',
 *   status: '',
 *   project_id: '',
 * })
 */

export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters)

  /**
   * Update a single filter
   *
   * setFilter("search", "amit")
   */
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  /**
   * Replace or merge multiple filters
   *
   * setFilters({
   *   ...filters,
   *   status: "active"
   * })
   */
  const updateFilters = useCallback((values) => {
    setFilters((prev) => ({
      ...prev,
      ...values,
    }))
  }, [])

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  return {
    filters,
    setFilter,
    setFilters: updateFilters,
    resetFilters,
  }
}