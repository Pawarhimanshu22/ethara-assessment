import clsx from 'clsx'

/**
 * Generic table.
 * columns: [{ key, header, render?(row), className?, headerClassName? }]
 * rows: array of data objects
 */
export default function Table({ columns, rows, rowKey = 'id', onRowClick, className }) {
  return (
    <div className={clsx('overflow-x-auto rounded-2xl border border-surface-200 bg-white', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-surface-200 bg-surface-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-surface-400',
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={() => onRowClick?.(row)}
              className={clsx(
                'bg-white transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface-50'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={clsx('px-4 py-3 text-surface-700', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}